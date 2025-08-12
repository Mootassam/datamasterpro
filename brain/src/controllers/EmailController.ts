import EmailFormats from '../utils/EmailFormat';
import dns from 'dns/promises';
import net from 'net';
import { Server } from "socket.io";
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define interfaces for email accounts and settings
interface EmailAccount {
    id: string;
    name: string;
    email: string;
    password: string;
    smtpHost: string;
    smtpPort: string;
    security: 'tls' | 'ssl' | 'none';
    active: boolean;
    dailyLimit: number;
    sentToday: number;
    lastUsed: Date | null;
}

interface EmailSettings {
    dailyLimit: number;
    delayBetween: number;
}

interface EmailCampaign {
    subject: string;
    content: string;
    senders: string[];
    recipients: string[];
    attachments?: Array<{
        filename: string;
        path: string;
    }>;
}

interface VerificationConfig {
    batchSize: number;          // 1 = sequential, 10 = 10 numbers at once, etc.
    delayBetweenNumbers: number; // Seconds between verifications within a batch
    delayBetweenBatches: number; // Seconds between batch starts
}
interface PhoneNumberResult {
    phoneNumberRegistred: string[];
    phoneNumberRejected: string[];
    totalPhoneNumber: string[];
}
class EmailController {
    private static activeOperations = new Map<string, AbortController>();
    private static currentOperationId: string | null = null;
    private static emailAccounts: EmailAccount[] = [];
    private static emailSettings: EmailSettings = {
        dailyLimit: 100,
        delayBetween: 2
    };
    private static activeSendingOperations = new Map<string, AbortController>();
    private static dataDir = path.join(process.cwd(), 'data');
    private static accountsFile = path.join(this.dataDir, 'email-accounts.json');

    static MAIL_FROM = 'info@cerra-plomberie.fr';
    static HELO_DOMAIN = 'cerra-plomberie.fr';
    static CONCURRENCY_LIMIT = 10; // Increased for better performance
    static TIMEOUT_MS = 8000;

    // Simplified MX cache
    static mxCache = new Map<string, { exchange: string; priority: number }[]>();

    // Remove provider-specific configurations since we'll treat all domains the same
    static PROVIDER_CONFIG = {};
    
    // Initialize data storage
    static {
        try {
            if (!fs.existsSync(this.dataDir)) {
                fs.mkdirSync(this.dataDir, { recursive: true });
            }
            
            if (fs.existsSync(this.accountsFile)) {
                const data = fs.readFileSync(this.accountsFile, 'utf8');
                this.emailAccounts = JSON.parse(data);
            } else {
                fs.writeFileSync(this.accountsFile, JSON.stringify(this.emailAccounts), 'utf8');
            }
        } catch (error) {
            console.error('Error initializing email accounts storage:', error);
        }
    }


    static getEmailProvider(email: string) {
        return email.split('@')[1].toLowerCase(); // Simply return the domain
    }

    static async checkMailboxExists(email: string): Promise<boolean> {
        const domain = email.split('@')[1];

        if (!await this.checkMX(domain)) return false;

        try {
            const mxRecords = await dns.resolveMx(domain);
            const mxHost = mxRecords[0].exchange;

            return new Promise((resolve) => {
                const socket = net.createConnection(25, mxHost);
                let step = 0;
                let response = '';
                let resolved = false;

                const cleanup = (result: boolean) => {
                    if (!resolved) {
                        resolved = true;
                        resolve(result);
                    }
                    if (!socket.destroyed) {
                        socket.destroy();
                    }
                };

                socket.setEncoding('utf8');
                socket.setTimeout(this.TIMEOUT_MS);

                socket.on('data', (data) => {
                    response += data;
                    if (response.endsWith('\r\n')) {
                        const code = response.slice(0, 3);

                        if (code.startsWith('5')) {
                            cleanup(false);
                            return;
                        }

                        if (step === 0) {
                            socket.write(`HELO ${this.HELO_DOMAIN}\r\n`);
                            step++;
                        } else if (step === 1 && code === '250') {
                            socket.write(`MAIL FROM:<${this.MAIL_FROM}>\r\n`);
                            step++;
                        } else if (step === 2 && code === '250') {
                            socket.write(`RCPT TO:<${email}>\r\n`);
                            step++;
                        } else if (step === 3) {
                            cleanup(code === '250' || code === '252');
                        }
                        response = '';
                    }
                });

                socket.on('error', () => cleanup(false));
                socket.on('timeout', () => cleanup(false));
                socket.on('end', () => {
                    if (!resolved) cleanup(false);
                });
            });
        } catch {
            return false;
        }
    }






    // Verify Numbers whatsApp 
    static async verify(
        emails: string[],
        res: Response,
        io: Server,
        config: VerificationConfig
    ): Promise<PhoneNumberResult> {

        const operationId = Math.random().toString(36).substring(2, 15);
        this.currentOperationId = operationId;

        const abortController = new AbortController();
        this.activeOperations.set(operationId, abortController);

        const result: PhoneNumberResult = {
            phoneNumberRegistred: [],
            phoneNumberRejected: [],
            totalPhoneNumber: [],
        };

        try {
            const batchSize = config.batchSize || 25;
            const totalBatches = Math.ceil(emails.length / batchSize);
            const startTime = Date.now();

            io.emit("progress", {
                progress: 0,
                batchesCompleted: 0,
                totalBatches,
                registered: 0,
                rejected: 0,
            });

            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {


                if (abortController.signal.aborted) {
                    io.emit("process-cancelled", {
                        reason: "Process cancelled by user",
                        partialResults: result
                    });
                    break;
                }
                const currentBatch = emails.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
                const batchResult: PhoneNumberResult = {
                    phoneNumberRegistred: [],
                    phoneNumberRejected: [],
                    totalPhoneNumber: [],
                };

                const activePromises = new Set<Promise<void>>();

                for (const [index, email] of currentBatch.entries()) {

                    if (abortController.signal.aborted) {
                        throw new Error("Process cancelled");
                    }
                    if (index > 0 && config.delayBetweenNumbers > 0) {
                        await new Promise(resolve => setTimeout(resolve, config.delayBetweenNumbers));
                    }

                    if (activePromises.size >= this.CONCURRENCY_LIMIT) {
                        await Promise.race(activePromises);
                    }

                    const promise = this.checkMailboxExists(email)
                        .then(exists => {
                            if (exists) {
                                batchResult.phoneNumberRegistred.push(email);
                            } else {
                                batchResult.phoneNumberRejected.push(email);
                            }
                            batchResult.totalPhoneNumber.push(email);
                        })
                        .catch(() => {
                            batchResult.phoneNumberRejected.push(email);
                            batchResult.totalPhoneNumber.push(email);
                        })
                        .finally(() => {
                            activePromises.delete(promise);
                        });

                    activePromises.add(promise);
                }

                // Wait for remaining promises to finish
                await Promise.all(activePromises);

                // Merge batch result
                result.phoneNumberRegistred.push(...batchResult.phoneNumberRegistred);
                result.phoneNumberRejected.push(...batchResult.phoneNumberRejected);
                result.totalPhoneNumber.push(...batchResult.totalPhoneNumber);

                const elapsedMs = Date.now() - startTime;
                const batchesRemaining = totalBatches - (batchIndex + 1);
                const avgTimePerBatch = elapsedMs / (batchIndex + 1);
                const etaMs = avgTimePerBatch * batchesRemaining;
                const etaSeconds = Math.round(etaMs / 1000);
                const etaString = this.formatETA(etaSeconds);

                io.emit("progress", {
                    progress: Math.round(((batchIndex + 1) / totalBatches) * 100),
                    batchesCompleted: batchIndex + 1,
                    totalBatches,
                    registered: result.phoneNumberRegistred.length,
                    rejected: result.phoneNumberRejected.length,
                    eta: etaString,
                    etaSeconds,
                });

                io.emit("data-updated", {
                    phoneNumberRegistred: result.phoneNumberRegistred,
                    phoneNumberRejected: result.phoneNumberRejected,
                    totalPhoneNumber: result.totalPhoneNumber,
                    progress: Math.round(((batchIndex + 1) / totalBatches) * 100),
                });

                if (batchIndex < totalBatches - 1 && config.delayBetweenBatches > 0) {
                    await new Promise(resolve => setTimeout(resolve, config.delayBetweenBatches));
                }
            }

            io.emit("progress", {
                progress: 100,
                batchesCompleted: totalBatches,
                totalBatches,
                registered: result.phoneNumberRegistred.length,
                rejected: result.phoneNumberRejected.length,
                eta: "Completed",
                etaSeconds: 0,
            });

            return result;
        } catch (criticalError) {
            if (abortController.signal.aborted) {
                io.emit("process-cancelled", {
                    reason: "Process cancelled",
                    partialResults: result
                });
                return result;
            }
            return result;
        } finally {
            // Clean up
            this.activeOperations.delete(operationId);
            this.currentOperationId = null;
        }
    }

    private static formatETA(seconds: number): string {
        if (seconds <= 0) return "Completed";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return [hours > 0 ? `${hours}h` : "", minutes > 0 ? `${minutes}m` : "", `${secs}s`]
            .filter(Boolean)
            .join(" ");
    }


    static cancelCurrentOperation(): boolean {
        if (!this.currentOperationId) return false;
        console.log("cancel the process");

        const controller = this.activeOperations.get(this.currentOperationId);
        if (controller) {
            controller.abort();
            this.activeOperations.delete(this.currentOperationId);
            this.currentOperationId = null;
            return true;
        }
        return false;
    }
    
    /**
     * Saves the current email accounts to the JSON file
     * @private
     */
    private static saveAccounts(): void {
        try {
            fs.writeFileSync(this.accountsFile, JSON.stringify(this.emailAccounts), 'utf8');
        } catch (error) {
            console.error('Error saving email accounts:', error);
        }
    }
    
    /**
     * Adds a new email account
     * @param accountData The account data to add
     * @returns The added account
     */
    static addAccount(accountData: Omit<EmailAccount, 'id' | 'active' | 'sentToday' | 'lastUsed'>): EmailAccount {
        const newAccount: EmailAccount = {
            ...accountData,
            id: uuidv4(),
            active: true,
            sentToday: 0,
            lastUsed: null,
            dailyLimit: accountData.dailyLimit || this.emailSettings.dailyLimit
        };
        
        this.emailAccounts.push(newAccount);
        this.saveAccounts();
        
        return newAccount;
    }
    
    /**
     * Gets all email accounts
     * @returns Array of email accounts
     */
    static getAccounts(): EmailAccount[] {
        return this.emailAccounts.map(account => ({
            ...account,
            password: '••••••••' // Hide password in response
        }));
    }
    
    /**
     * Updates an existing email account
     * @param id The account ID
     * @param accountData The updated account data
     * @returns The updated account or null if not found
     */
    static updateAccount(id: string, accountData: Partial<EmailAccount>): EmailAccount | null {
        const index = this.emailAccounts.findIndex(account => account.id === id);
        if (index === -1) return null;
        
        // Don't allow updating the ID
        const { id: _, ...updateData } = accountData;
        
        this.emailAccounts[index] = {
            ...this.emailAccounts[index],
            ...updateData
        };
        
        this.saveAccounts();
        return this.emailAccounts[index];
    }
    
    /**
     * Deletes an email account
     * @param id The account ID to delete
     * @returns True if deleted, false if not found
     */
    static deleteAccount(id: string): boolean {
        const initialLength = this.emailAccounts.length;
        this.emailAccounts = this.emailAccounts.filter(account => account.id !== id);
        
        if (this.emailAccounts.length !== initialLength) {
            this.saveAccounts();
            return true;
        }
        
        return false;
    }
    
    /**
     * Updates the email settings
     * @param settings The new settings
     * @returns The updated settings
     */
    static updateSettings(settings: Partial<EmailSettings>): EmailSettings {
        this.emailSettings = {
            ...this.emailSettings,
            ...settings
        };
        
        try {
            const settingsFile = path.join(this.dataDir, 'email-settings.json');
            fs.writeFileSync(settingsFile, JSON.stringify(this.emailSettings), 'utf8');
        } catch (error) {
            console.error('Error saving email settings:', error);
        }
        
        return this.emailSettings;
    }
    
    /**
     * Gets the current email settings
     * @returns The current email settings
     */
    static getSettings(): EmailSettings {
        return this.emailSettings;
    }

    /**
     * Generates an array of realistic-looking random emails.
     * @param {number} count - Number of emails to generate.
     * @returns {string[]} Array of generated emails.
     */
    static generate(count, culture, gender): string[] {
        const emails: string[] = [];
        for (let i = 0; i < count; i++) {
            emails.push(EmailFormats.generateName(culture, gender));
        }
        return emails;
    }
    
    /**
     * Creates a nodemailer transport for an email account
     * @param account The email account to create a transport for
     * @returns A nodemailer transport
     */
    private static createTransport(account: EmailAccount) {
        const securityOptions: { [key: string]: boolean } = {};
        
        if (account.security === 'tls') {
            securityOptions.secure = true;
        } else if (account.security === 'ssl') {
            securityOptions.secure = true;
        }
        
        return nodemailer.createTransport({
            host: account.smtpHost,
            port: parseInt(account.smtpPort, 10),
            ...securityOptions,
            auth: {
                user: account.email,
                pass: account.password
            },
            tls: {
                rejectUnauthorized: false // Allow self-signed certificates
            }
        });
    }
    
    /**
     * Tests an email account connection
     * @param account The account to test
     * @returns True if connection successful, false otherwise
     */
    static async testAccount(account: EmailAccount): Promise<boolean> {
        try {
            const transport = this.createTransport(account);
            await transport.verify();
            return true;
        } catch (error) {
            console.error('Email account verification failed:', error);
            return false;
        }
    }
    
    /**
     * Resets the daily sent count for all accounts
     * Should be called daily at midnight
     */
    static resetDailyCounts(): void {
        this.emailAccounts = this.emailAccounts.map(account => ({
            ...account,
            sentToday: 0
        }));
        this.saveAccounts();
    }
    
    /**
     * Sends a test email
     * @param accountId The account ID to use
     * @param testEmail The email address to send to
     * @returns Success status and message
     */
    static async sendTestEmail(accountId: string, testEmail: string): Promise<{success: boolean, message: string}> {
        const account = this.emailAccounts.find(acc => acc.id === accountId);
        if (!account) {
            return { success: false, message: 'Account not found' };
        }
        
        try {
            const transport = this.createTransport(account);
            
            await transport.sendMail({
                from: `${account.name} <${account.email}>`,
                to: testEmail,
                subject: 'Test Email',
                text: 'This is a test email to verify your email account configuration.',
                html: '<p>This is a test email to verify your email account configuration.</p>'
            });
            
            return { success: true, message: 'Test email sent successfully' };
        } catch (error) {
            console.error('Error sending test email:', error);
            return { 
                success: false, 
                message: `Failed to send test email: ${error instanceof Error ? error.message : String(error)}` 
            };
        }
    }


    static async checkMX(domain: string): Promise<boolean> {
        try {
            if (this.mxCache.has(domain)) return true;

            const mxRecords = await dns.resolveMx(domain);
            if (mxRecords.length > 0) {
                this.mxCache.set(domain, mxRecords);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }
    
    /**
     * Sends a bulk email campaign
     * @param campaign The campaign details
     * @param io Socket.io instance for progress updates
     * @returns Operation ID for tracking/cancellation
     */
    static async sendBulkEmail(campaign: EmailCampaign, io): Promise<string> {
        // Validate campaign data
        if (!campaign.subject || !campaign.content || !campaign.senders || !campaign.recipients || 
            campaign.senders.length === 0 || campaign.recipients.length === 0) {
            throw new Error('Invalid campaign data');
        }
        
        // Get selected accounts
        const selectedAccounts = this.emailAccounts.filter(
            account => account.active && campaign.senders.includes(account.id)
        );
        
        if (selectedAccounts.length === 0) {
            throw new Error('No valid sender accounts selected');
        }
        
        // Create a unique operation ID
        const operationId = uuidv4();
        const controller = new AbortController();
        this.activeSendingOperations.set(operationId, controller);
        
        // Start the sending process asynchronously
        this.processBulkEmailCampaign(operationId, campaign, selectedAccounts, io, controller.signal);
        
        return operationId;
    }
    
    /**
     * Processes a bulk email campaign with rate limiting and account rotation
     * @private
     */
    private static async processBulkEmailCampaign(
        operationId: string,
        campaign: EmailCampaign,
        accounts: EmailAccount[],
        io,
        signal: AbortSignal
    ): Promise<void> {
        const recipients = [...campaign.recipients];
        const totalEmails = recipients.length;
        let sentCount = 0;
        let failedCount = 0;
        let currentAccountIndex = 0;
        let lastProgressUpdate = Date.now();
        const startTime = Date.now();
        
        // No tracking pixels or link tracking
        let emailContent = campaign.content;
        
        // Function to get the next available account
        const getNextAccount = (): EmailAccount | null => {
            // Try to find an account that hasn't reached its daily limit
            for (let i = 0; i < accounts.length; i++) {
                const index = (currentAccountIndex + i) % accounts.length;
                const account = accounts[index];
                
                if (account.sentToday < account.dailyLimit) {
                    currentAccountIndex = (index + 1) % accounts.length;
                    return account;
                }
            }
            
            return null; // All accounts have reached their daily limit
        };
        
        // Send progress update to client
        const sendProgressUpdate = () => {
            const now = Date.now();
            const elapsedMs = now - startTime;
            const emailsPerMs = sentCount / elapsedMs;
            const remainingEmails = totalEmails - sentCount - failedCount;
            const estimatedRemainingMs = emailsPerMs > 0 ? remainingEmails / emailsPerMs : 0;
            
            const progress = {
                total: totalEmails,
                sent: sentCount,
                failed: failedCount,
                remaining: remainingEmails,
                progress: ((sentCount + failedCount) / totalEmails) * 100,
                eta: this.formatETA(estimatedRemainingMs),
                accounts: accounts.map(acc => ({
                    id: acc.id,
                    name: acc.name,
                    email: acc.email,
                    sentToday: acc.sentToday,
                    dailyLimit: acc.dailyLimit
                }))
            };
            
            io.emit('email-sending-progress', { operationId, ...progress });
            lastProgressUpdate = now;
        };
        
        try {
            // Process emails until all are sent or operation is cancelled
            while (recipients.length > 0 && !signal.aborted) {
                // Get next available account
                const account = getNextAccount();
                
                if (!account) {
                    // All accounts have reached their daily limit
                    io.emit('email-sending-error', { 
                        operationId, 
                        error: 'All accounts have reached their daily sending limit' 
                    });
                    break;
                }
                
                // Get next recipient
                const recipient = recipients.shift();
                if (!recipient) continue;
                
                try {
                    // No tracking personalization needed
                    const personalizedContent = emailContent;
                    
                    // Send the email
                    const transport = this.createTransport(account);
                    await transport.sendMail({
                        from: `${account.name} <${account.email}>`,
                        to: recipient,
                        subject: campaign.subject,
                        html: personalizedContent,
                        attachments: campaign.attachments
                    });
                    
                    // Update account stats
                    account.sentToday++;
                    account.lastUsed = new Date();
                    sentCount++;
                    
                    // Save updated account data periodically
                    if (sentCount % 10 === 0) {
                        this.saveAccounts();
                    }
                    
                } catch (error) {
                    console.error(`Failed to send email to ${recipient}:`, error);
                    failedCount++;
                }
                
                // Send progress update if enough time has passed
                if (Date.now() - lastProgressUpdate > 1000) {
                    sendProgressUpdate();
                }
                
                // Apply delay between emails if configured
                if (this.emailSettings.delayBetween > 0 && recipients.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, this.emailSettings.delayBetween * 1000));
                }
            }
            
            // Final progress update
            sendProgressUpdate();
            
            // Save final account data
            this.saveAccounts();
            
            // Clean up
            this.activeSendingOperations.delete(operationId);
            
            // Send completion event if not aborted
            if (!signal.aborted) {
                io.emit('email-sending-complete', { 
                    operationId,
                    total: totalEmails,
                    sent: sentCount,
                    failed: failedCount
                });
            }
            
        } catch (error) {
            console.error('Error in bulk email sending:', error);
            io.emit('email-sending-error', { 
                operationId, 
                error: error instanceof Error ? error.message : String(error) 
            });
            
            // Clean up
            this.activeSendingOperations.delete(operationId);
        }
    }
    
    /**
     * Cancels an ongoing email sending operation
     * @param operationId The operation ID to cancel
     * @returns True if cancelled, false if not found
     */
    static cancelEmailSending(operationId: string): boolean {
        const controller = this.activeSendingOperations.get(operationId);
        if (controller) {
            controller.abort();
            this.activeSendingOperations.delete(operationId);
            return true;
        }
        return false;
    }

}

export default EmailController;
