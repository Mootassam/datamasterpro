import { Request, Response } from "express";
import { Server } from "socket.io";
import multer, { Multer } from "multer";
import MTProto from "@mtproto/core";
import path from 'path';
import os from 'os';
import fs from 'fs';
import streamifier from "streamifier";
import csvParser from "csv-parser";
import { Readable } from 'stream';
import schedule from 'node-schedule';

const upload: Multer = multer({ storage: multer.memoryStorage() });

// const API_ID = 29214492;
// const API_HASH = "c69d0e6e1d0714b5d95416208632243e";



const API_ID = 26506516;
const API_HASH = "ce72b09466a68871d91acb7ac87c9f76";

interface VerificationConfig {
  batchSize: number;
  delayBetweenNumbers: number;
  delayBetweenBatches: number;
  selectedAccounts?: string[];
}

interface PhoneNumberResult {
  phoneNumberRegistred: string[];
  phoneNumberRejected: string[];
  totalPhoneNumber: string[];
}

interface MessageResult {
  messagesSent: string[];
  messagesFailed: string[];
  totalMessages: string[];
}

interface GroupMember {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  isBot: boolean;
}

interface GroupInfo {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isAdmin: boolean;
  profilePicUrl?: string;
  access_hash?: string | number; // Add access_hash to the interface
}

interface ScheduledMessage {
  id: string;
  accountId: string;
  phoneNumbers: string[];
  message: string;
  config: any;
  scheduledTime: Date;
  status: 'scheduled' | 'running' | 'completed' | 'cancelled';
  result?: MessageResult;
}

interface TelegramAccount {
  id: string;
  phoneNumber: string;
  name?: string;
  profilePicUrl?: string;
  connected: boolean;
  mtproto?: MTProto;
  authKey?: string;
  dcId?: number;
  serverAddress?: string;
  port?: number;
}

class TelegramController {
  private static accounts: Map<string, TelegramAccount> = new Map();
  private static verificationProcess: NodeJS.Timeout | null = null;
  private static scheduledMessages: ScheduledMessage[] = [];

  private static getSessionPath(phoneNumber: string): string {
    let sessionPath: string;
    
    if ((process as any).pkg) {
      const homeDir = os.homedir();
      sessionPath = path.join(homeDir, '.telegram-toolkit', 'sessions', `session-${phoneNumber}`);
    } else {
      sessionPath = path.join(__dirname, '..', 'telegram_auth', `session-${phoneNumber}`);
    }

    if (!fs.existsSync(path.dirname(sessionPath))) {
      fs.mkdirSync(path.dirname(sessionPath), { recursive: true });
    }

    return sessionPath;
  }

  private static async initializeAccount(phoneNumber: string, io: Server): Promise<TelegramAccount> {
    const id = phoneNumber.replace(/\D/g, '');
    const sessionPath = this.getSessionPath(id);
    
    let authKey: string | undefined;
    let dcId: number | undefined;
    let serverAddress: string | undefined;
    let port: number | undefined;

    if (fs.existsSync(`${sessionPath}.json`)) {
      try {
        const sessionData = fs.readFileSync(`${sessionPath}.json`, 'utf8');
        if (sessionData && sessionData.trim() !== '') {
          const session = JSON.parse(sessionData);
          authKey = session.authKey;
          dcId = session.dcId;
          serverAddress = session.serverAddress;
          port = session.port;
        }
      } catch (error) {
        console.warn('Error reading session file, creating new session');
      }
    }

    try {
      const mtproto = new MTProto({
        api_id: API_ID,
        api_hash: API_HASH,
        test: false,
        storageOptions: {
          path: sessionPath + '.json'
        }
      });
      
      // Add setDefaultDc method to MTProto instance
      if (!mtproto.setDefaultDc) {
        mtproto.setDefaultDc = async function(dcId: number) {
          // @ts-ignore - Accessing internal properties
          if (this.storage && this.storage.set) {
            // @ts-ignore - Accessing internal properties
            await this.storage.set('dc', dcId);
          }
          return true;
        };
      }

      const account: TelegramAccount = {
        id,
        phoneNumber,
        connected: false,
        mtproto,
        authKey,
        dcId,
        serverAddress,
        port
      };

      this.accounts.set(id, account);
      return account;
    } catch (error) {
      this.displayError(error, io);
      throw error;
    }
  }

  static async getConnectedAccounts(): Promise<TelegramAccount[]> {
    return Array.from(this.accounts.values())
      .filter(account => account.connected)
      .map(({ mtproto, authKey, ...account }) => account);
  }

  static async getAccountById(accountId: string): Promise<TelegramAccount | undefined> {
    return this.accounts.get(accountId);
  }

  static async logout(accountId: string, io: Server): Promise<void> {
    const account = this.accounts.get(accountId);
    if (!account) return;

    try {
      if (account.mtproto && account.connected) {
        await account.mtproto.call('auth.logOut');
      }

      const sessionPath = this.getSessionPath(account.id);
      if (fs.existsSync(`${sessionPath}.json`)) {
        fs.unlinkSync(`${sessionPath}.json`);
      }

      this.accounts.delete(accountId);

      io.emit("logout-success", {
        accountId: accountId,
        message: "Logged out successfully"
      });
    } catch (error) {
      this.displayError(error, io);
    }
  }

  static async logoutAll(io: Server): Promise<void> {
    const logoutPromises = Array.from(this.accounts.keys()).map(accountId => 
      this.logout(accountId, io).catch(console.error)
    );

    await Promise.allSettled(logoutPromises);
    io.emit("success", { message: "All accounts logged out successfully" });
  }

  static async login(req: Request, io: Server): Promise<{ phoneCodeHash: string, accountId: string }> {
    const { phoneNumber } = req.body;
    if (!phoneNumber) throw new Error("Phone number is required");

    try {
      const account = await this.initializeAccount(phoneNumber, io);
      const mtproto = account.mtproto!;

      const result = await this.callWithDcMigration(mtproto, 'auth.sendCode', {
        phone_number: phoneNumber,
        settings: {
          _: 'codeSettings',
          allow_flashcall: false,
          current_number: true,
          allow_app_hash: true,
        },
      });

      io.emit("login-code-sent", {
        accountId: account.id,
        phoneNumber: account.phoneNumber,
        timestamp: new Date().toISOString()
      });

      return {
        phoneCodeHash: result.phone_code_hash,
        accountId: account.id
      };
    } catch (error) {
      this.displayError(error, io);
      throw error;
    }
  }

  static async confirmOTP(req: Request, io: Server): Promise<void> {
    const { accountId, phoneCode, phoneCodeHash } = req.body;
    if (!accountId || !phoneCode || !phoneCodeHash) {
      throw new Error("Account ID, phone code, and phone code hash are required");
    }

    const account = this.accounts.get(accountId);
    if (!account || !account.mtproto) {
      throw new Error(`Account ${accountId} not found or not initialized`);
    }

    try {
      const mtproto = account.mtproto;
      let signInResult;

      try {
        signInResult = await this.callWithDcMigration(mtproto, 'auth.signIn', {
          phone_number: account.phoneNumber,
          phone_code_hash: phoneCodeHash,
          phone_code: phoneCode
        });
      } catch (error: any) {
        if (error.error_message === 'SESSION_PASSWORD_NEEDED') {
          io.emit("2fa-required", {
            accountId: account.id,
            phoneNumber: account.phoneNumber
          });
          return;
        }
        throw error;
      }

      const user = signInResult.user;
      account.name = user.first_name || user.username || account.phoneNumber;
      account.connected = true;

      io.emit("client-connect", {
        accountId: account.id,
        phoneNumber: account.phoneNumber,
        name: account.name,
        timestamp: new Date().toISOString()
      });
      
      // Call onAccountConnected to check for paused operations
      this.onAccountConnected(account.id, io);

      io.emit("success", {
        message: "Login successful",
        accountId: account.id,
        phoneNumber: account.phoneNumber,
        name: account.name
      });
    } catch (error) {
      this.displayError(error, io);
      throw error;
    }
  }

  static async confirm2FA(req: Request, io: Server): Promise<void> {
    const { accountId, password } = req.body;
    if (!accountId || !password) {
      throw new Error("Account ID and password are required");
    }

    const account = this.accounts.get(accountId);
    if (!account || !account.mtproto) {
      throw new Error(`Account ${accountId} not found or not initialized`);
    }

    try {
      const mtproto = account.mtproto;
      const passwordInfo = await this.callWithDcMigration(mtproto, 'account.getPassword', {});

      const { srp_id, current_algo, srp_B } = passwordInfo;
      const { salt1, salt2, g, p } = current_algo;

      const srpParams = await this.calculateSRP({
        g,
        p,
        salt1,
        salt2,
        srp_B,
        password
      });

      const checkPasswordResult = await this.callWithDcMigration(mtproto, 'auth.checkPassword', {
        password: {
          _: 'inputCheckPasswordSRP',
          srp_id,
          A: srpParams.A,
          M1: srpParams.M1
        }
      });

      const user = checkPasswordResult.user;
      account.name = user.first_name || user.username || account.phoneNumber;
      account.connected = true;

      io.emit("client-connect", {
        accountId: account.id,
        phoneNumber: account.phoneNumber,
        name: account.name,
        timestamp: new Date().toISOString()
      });
      
      // Call onAccountConnected to check for paused operations
      this.onAccountConnected(account.id, io);

      io.emit("success", {
        message: "2FA confirmed successfully",
        accountId: account.id,
        phoneNumber: account.phoneNumber,
        name: account.name
      });
    } catch (error) {
      this.displayError(error, io);
      throw error;
    }
  }

  static async cancelAccountConnection(accountId: string, io: Server): Promise<void> {
    const account = this.accounts.get(accountId);
    if (!account) return;

    this.accounts.delete(accountId);
    io.emit("client-disconnect", {
      accountId: accountId,
      phoneNumber: account.phoneNumber,
      timestamp: new Date().toISOString()
    });
  }

  static async cancelCurrentOperation(): Promise<void> {
    if (this.verificationProcess) {
      clearTimeout(this.verificationProcess);
      this.verificationProcess = null;
    }
  }
static async saveUsers(req: Request, io: Server, existingResult?: PhoneNumberResult, existingProcessedNumbers?: Set<string>): Promise<PhoneNumberResult> {
    const { phoneNumbers, config } = req.body;
    const selectedAccounts = config.selectedAccounts || [];
    
    const usersArray = Array.isArray(phoneNumbers) ? phoneNumbers : [];
    const result: PhoneNumberResult = existingResult || {
      phoneNumberRegistred: [],
      phoneNumberRejected: [],
      totalPhoneNumber: []
    };

    // Generate a unique operation ID for this verification process
    const operationId = `op-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    if (usersArray.length === 0 || selectedAccounts.length === 0) {
      io.emit("display-error", {
        code: 400,
        message: "Phone numbers and accounts required",
        action: "provide_data"
      });
      return result;
    }

    // Track which phone numbers have been processed
    const processedPhoneNumbers = existingProcessedNumbers || new Set<string>();
    // Track the current position in the phone numbers array
    let currentPosition = 0;

    try {
      // Load and validate accounts
      const validAccounts: TelegramAccount[] = [];
      for (const accountId of selectedAccounts) {
        const account = await this.getAccountById(accountId);
        if (account && account.mtproto && account.connected) {
          validAccounts.push(account);
        }
      }

      if (validAccounts.length === 0) {
        io.emit("display-error", {
          code: 400,
          message: "No valid accounts selected",
          action: "select_accounts"
        });
        return result;
      }

      const startTime = Date.now();
      const batchSize = config.batchSize || 25;
      const totalBatches = Math.ceil(usersArray.length / batchSize);

      io.emit("progress", {
        progress: 0,
        batchesCompleted: 0,
        totalBatches,
        registered: 0,
        rejected: 0,
      });

      // Send initial account status update
      this.emitAccountsStatus(validAccounts, io);
      
      // Process batches with account rotation and flood wait handling
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        // Find an available account (not in flood wait)
        let account = this.findAvailableAccount(validAccounts);
        
        // If all accounts are in flood wait, wait for the one with the shortest remaining time
        if (!account) {
          // Send updated account status
          this.emitAccountsStatus(validAccounts, io);
          
          let minWaitTime = Infinity;
          let accountWithMinWait = null;
          
          for (const acc of validAccounts) {
            const waitTime = this.getFloodWaitTimeRemaining(acc.id);
            if (waitTime < minWaitTime) {
              minWaitTime = waitTime;
              accountWithMinWait = acc;
            }
          }
          
          if (accountWithMinWait) {
            // Notify that we're waiting for an account to become available
            io.emit("verification-paused", {
              message: `All accounts are rate limited. Waiting for ${this.formatETA(minWaitTime)} before continuing...`,
              waitTime: minWaitTime,
              nextAvailableAccount: {
                id: accountWithMinWait.id,
                phoneNumber: accountWithMinWait.phoneNumber,
                availableAt: new Date(Date.now() + minWaitTime * 1000).toISOString()
              }
            });
            
            // Wait for the account with the shortest wait time
            await new Promise(resolve => setTimeout(resolve, minWaitTime * 1000 + 1000)); // Add 1 second buffer
            account = accountWithMinWait;
            
            // Send updated account status after wait
            this.emitAccountsStatus(validAccounts, io);
          } else {
            throw new Error("No accounts available and no accounts in flood wait. This should never happen.");
          }
        }
        
        // Get the current batch of phone numbers
        const currentBatch = usersArray.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
        const batchResult: PhoneNumberResult = {
          phoneNumberRegistred: [],
          phoneNumberRejected: [],
          totalPhoneNumber: []
        };

        // Process each phone number in the batch
        for (let i = 0; i < currentBatch.length; i++) {
          const phoneNumber = currentBatch[i];
          
          // Skip already processed numbers
          if (processedPhoneNumbers.has(phoneNumber)) {
            continue;
          }
          
          try {
            // Apply delay between numbers if configured
            if (i > 0 && config.delayBetweenNumbers > 0) {
              await new Promise(resolve => setTimeout(resolve, config.delayBetweenNumbers));
            }

            // Check if the current account is still available (not in flood wait)
             if (this.isAccountInFloodWait(account.id)) {
               // Send updated account status
               this.emitAccountsStatus(validAccounts, io);
               
               // Find another available account
               const newAccount = this.findAvailableAccount(validAccounts);
               
               if (newAccount) {
                 io.emit("account-switched", {
                   oldAccountId: account.id,
                   oldAccountPhone: account.phoneNumber,
                   newAccountId: newAccount.id,
                   newAccountPhone: newAccount.phoneNumber,
                   reason: "flood_wait",
                   waitTime: this.getFloodWaitTimeRemaining(account.id),
                   formattedWaitTime: this.formatETA(this.getFloodWaitTimeRemaining(account.id)),
                   timestamp: new Date().toISOString()
                 });
                 account = newAccount;
               } else {
                 // If no accounts are available, save the current operation state for later resumption
                 const waitTime = this.getFloodWaitTimeRemaining(account.id);
                 
                 // Save the remaining phone numbers and current progress for resumption
                 const remainingPhoneNumbers = usersArray.filter(num => !processedPhoneNumbers.has(num));
                 
                 // Store the operation for later resumption
                 this.pausedOperations.set(operationId, {
                   phoneNumbers: remainingPhoneNumbers,
                   processedNumbers: processedPhoneNumbers,
                   config,
                   result,
                   timestamp: new Date()
                 });
                 
                 io.emit("verification-paused", {
                   message: `All accounts are rate limited. Waiting for ${this.formatETA(waitTime)} before continuing...`,
                   waitTime,
                   nextAvailableAccount: {
                     id: account.id,
                     phoneNumber: account.phoneNumber,
                     availableAt: new Date(Date.now() + waitTime * 1000).toISOString()
                   },
                   operationId,
                   timestamp: new Date().toISOString(),
                   batchProgress: {
                     current: batchIndex + 1,
                     total: totalBatches,
                     processed: processedPhoneNumbers.size,
                     remaining: remainingPhoneNumbers.length
                   }
                 });
                 
                 await new Promise(resolve => setTimeout(resolve, waitTime * 1000 + 1000)); // Add 1 second buffer
                 
                 // Send updated account status after wait
                 this.emitAccountsStatus(validAccounts, io);
               }
             }

            const mtproto = account.mtproto!;
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            
            // Always add to total numbers
            batchResult.totalPhoneNumber.push(phoneNumber);
            
            // Validate the phone number before attempting verification
            const validationResult = await this.isValidPhoneNumber(cleanPhone, account, io);
            
            if (!validationResult.isValid) {
              console.log(`Phone number ${cleanPhone} validation failed: ${validationResult.error}`);
              batchResult.phoneNumberRejected.push(phoneNumber);
              
              // Emit validation error
              io.emit("number-validation-failed", {
                phoneNumber: cleanPhone,
                error: validationResult.error,
                errorCode: validationResult.errorCode,
                timestamp: new Date().toISOString()
              });
              
              // Mark as processed and continue to next number
              processedPhoneNumbers.add(phoneNumber);
              continue;
            }
            
            // Import contact to check registration
            // console.log(`Attempting to import contact for ${cleanPhone} using account ${account.id}...`);
            const clientId = Date.now();
            const importResult = await this.callWithDcMigration(mtproto, 'contacts.importContacts', {
              contacts: [{
                _: 'inputPhoneContact',
                client_id: clientId,
                phone: cleanPhone,
                first_name: 'Check',
                last_name: 'User'
              }]
            }, 0, account.id, io);
            
            // Mark this phone number as processed
            processedPhoneNumbers.add(phoneNumber);
            
            // Log the raw import result for debugging
            console.log(`Raw import result for ${phoneNumber}:`, JSON.stringify(importResult, null, 2));

            // Determine if the phone number is registered on Telegram
            // Multiple checks to ensure accurate detection:
            // 1. Check if users array contains entries (registered users)
            // 2. Check if imported array contains entries with valid user_id
            // 3. Verify that retry_contacts is empty (no failed imports)
            // 4. Ensure the imported contact has a valid user_id that matches a user in the users array
            
            let isRegistered = false;
            
            if (importResult.users && importResult.users.length > 0 && 
                importResult.imported && importResult.imported.length > 0) {
                
                // Get the imported contact
                const importedContact = importResult.imported[0];
                
                // Check if the imported contact has a valid user_id
                if (importedContact && importedContact.user_id) {
                    // Find the corresponding user in the users array
                    const matchingUser = importResult.users.find(user => user.id === importedContact.user_id);
                    
                    // If we found a matching user, the number is registered
                    isRegistered = !!matchingUser;
                }
            }

            // Log the import result for debugging
            console.log(`Import result for ${phoneNumber}:`, JSON.stringify({
              imported: importResult.imported?.length || 0,
              users: importResult.users?.length || 0,
              retryContacts: importResult.retry_contacts?.length || 0
            }));
            
            if (isRegistered) {
              console.log(`Phone number ${phoneNumber} is registered on Telegram`);
              batchResult.phoneNumberRegistred.push(phoneNumber);
              
              // Emit real-time update for registered number
              io.emit("number-verified", {
                phoneNumber,
                status: "registered",
                timestamp: new Date().toISOString(),
                accountId: account.id
              });
            } else {
              // console.log(`Phone number ${phoneNumber} is NOT registered on Telegram`);
              batchResult.phoneNumberRejected.push(phoneNumber);
              
              // Emit real-time update for rejected number
              io.emit("number-verified", {
                phoneNumber,
                status: "not_registered",
                timestamp: new Date().toISOString(),
                accountId: account.id
              });
            }

            // Cleanup: Delete imported contact if it was added
            try {
              if (isRegistered) {
                // Find the user object for the imported contact
                const importedContact = importResult.imported[0];
                const user = importResult.users.find(u => 
                  u && u.id === importedContact.user_id && u.access_hash
                );

                if (user) {
                  await this.callWithDcMigration(mtproto, 'contacts.deleteContacts', {
                    id: [{
                      _: 'inputUser',
                      user_id: user.id,
                      access_hash: user.access_hash
                    }]
                  }, 0, account.id, io);
                }
              }
            } catch (cleanupError) {
              console.warn(`Cleanup failed for ${phoneNumber}:`, cleanupError);
              // Cleanup failure doesn't affect verification result
            }
          } catch (error:any) {
            // Check if this is a FLOOD_WAIT error
            if (error.message && error.message.includes('FLOOD_WAIT_ACCOUNT_ROTATION')) {
              // This error is thrown by callWithDcMigration when a FLOOD_WAIT occurs
              // The account has already been marked as in flood wait
              console.log(`Account ${account.id} is in flood wait. Will retry ${phoneNumber} with another account.`);
              
              // Find another available account
              const newAccount = this.findAvailableAccount(validAccounts);
              
              if (newAccount) {
                // Notify frontend about account switch
                io.emit("account-switched", {
                  oldAccountId: account.id,
                  oldAccountPhone: account.phoneNumber,
                  newAccountId: newAccount.id,
                  newAccountPhone: newAccount.phoneNumber,
                  reason: "flood_wait",
                  waitTime: this.getFloodWaitTimeRemaining(account.id),
                  formattedWaitTime: this.formatETA(this.getFloodWaitTimeRemaining(account.id)),
                  timestamp: new Date().toISOString()
                });
                
                // Switch to new account
                account = newAccount;
              } else {
                // If no accounts are available, save the current operation state for later resumption
                const minWaitTime = this.getMinimumFloodWaitTime(validAccounts);
                const accountWithMinWait = this.getAccountWithMinimumFloodWait(validAccounts);
                
                // Save the remaining phone numbers and current progress for resumption
                const remainingPhoneNumbers = usersArray.filter(num => !processedPhoneNumbers.has(num));
                
                // Store the operation for later resumption
                this.pausedOperations.set(operationId, {
                  phoneNumbers: remainingPhoneNumbers,
                  processedNumbers: processedPhoneNumbers,
                  config,
                  result,
                  timestamp: new Date()
                });
                
                // Start a countdown for the account with minimum flood wait time
                if (accountWithMinWait) {
                  this.startFloodWaitCountdown(accountWithMinWait.id, io);
                }
                
                io.emit("verification-paused", {
                  message: `All accounts are rate limited. Waiting for ${this.formatETA(minWaitTime)} before continuing or add a new account to resume immediately.`,
                  waitTime: minWaitTime,
                  nextAvailableAccount: accountWithMinWait ? {
                    id: accountWithMinWait.id,
                    phoneNumber: accountWithMinWait.phoneNumber,
                    availableAt: new Date(Date.now() + minWaitTime * 1000).toISOString()
                  } : null,
                  operationId,
                  timestamp: new Date().toISOString(),
                  batchProgress: {
                    current: batchIndex + 1,
                    total: totalBatches,
                    processed: processedPhoneNumbers.size,
                    remaining: remainingPhoneNumbers.length
                  },
                  floodedAccounts: validAccounts.filter(acc => this.isAccountInFloodWait(acc.id)).map(acc => ({
                    id: acc.id,
                    phoneNumber: acc.phoneNumber,
                    waitTimeSeconds: this.getFloodWaitTimeRemaining(acc.id),
                    formattedWaitTime: this.formatETA(this.getFloodWaitTimeRemaining(acc.id))
                  }))
                });
                
                // Return partial results - the operation will be resumed when an account becomes available
                return {
                  phoneNumberRegistred: [...new Set(result.phoneNumberRegistred)],
                  phoneNumberRejected: [...new Set(result.phoneNumberRejected)],
                  totalPhoneNumber: [...new Set(result.totalPhoneNumber)]
                };
              }
              
              // Don't mark this phone number as processed so it will be retried
              i--; // Retry this index
              continue;
            }
            
            console.error(`Error processing ${phoneNumber}:`, error);
            // Log detailed error information
            const errorMessage = error instanceof Error ? error.message : String(error);
            io.emit("verification-error", {
              phoneNumber,
              error: errorMessage,
              timestamp: new Date().toISOString(),
              accountId: account.id
            });
            // Mark this phone number as processed to avoid infinite retries on permanent errors
            processedPhoneNumbers.add(phoneNumber);
            // Any error means the number is rejected
            batchResult.phoneNumberRejected.push(phoneNumber);
          }
        }

        // Aggregate batch results
        result.phoneNumberRegistred.push(...batchResult.phoneNumberRegistred);
        result.phoneNumberRejected.push(...batchResult.phoneNumberRejected);
        result.totalPhoneNumber.push(...batchResult.totalPhoneNumber);

        const progress = Math.round(((batchIndex + 1) / totalBatches) * 100);
        const now = Date.now();
        const elapsedMs = now - startTime;
        const batchesRemaining = totalBatches - (batchIndex + 1);
        const avgTimePerBatch = elapsedMs / (batchIndex + 1);
        const etaMs = avgTimePerBatch * batchesRemaining;
        const etaSeconds = Math.round(etaMs / 1000);

        io.emit("progress", {
          progress,
          batchesCompleted: batchIndex + 1,
          totalBatches,
          registered: result.phoneNumberRegistred.length,
          rejected: result.phoneNumberRejected.length,
          eta: this.formatETA(etaSeconds),
          etaSeconds,
          currentAccount: account.id
        });

        io.emit("data-updated", {
          phoneNumberRegistred: result.phoneNumberRegistred,
          phoneNumberRejected: result.phoneNumberRejected,
          totalPhoneNumber: result.totalPhoneNumber,
          progress
        });

        if (batchIndex < totalBatches - 1 && config.delayBetweenBatches > 0) {
          await new Promise(resolve => setTimeout(resolve, config.delayBetweenBatches));
        }
        
        // Check if any accounts are available for the next batch
        if (batchIndex < totalBatches - 1) {
          const nextAccount = this.findAvailableAccount(validAccounts);
          if (!nextAccount) {
            // If no accounts are available, find the one with the shortest wait time
            let minWaitTime = Infinity;
            let accountWithMinWait = null;
            
            for (const acc of validAccounts) {
              const waitTime = this.getFloodWaitTimeRemaining(acc.id);
              if (waitTime < minWaitTime) {
                minWaitTime = waitTime;
                accountWithMinWait = acc;
              }
            }
            
            if (accountWithMinWait && minWaitTime > 0) {
              // Notify that we're waiting for an account to become available
              io.emit("verification-paused", {
                message: `All accounts are rate limited. Waiting for ${this.formatETA(minWaitTime)} before continuing with the next batch...`,
                waitTime: minWaitTime,
                batchesCompleted: batchIndex + 1,
                totalBatches
              });
              
              // Wait for the account with the shortest wait time
              await new Promise(resolve => setTimeout(resolve, minWaitTime * 1000 + 1000)); // Add 1 second buffer
            }
          }
        }
      }

      // Final validation of results
      console.log('Final verification results:', {
        registered: result.phoneNumberRegistred.length,
        rejected: result.phoneNumberRejected.length,
        total: result.totalPhoneNumber.length,
        processed: processedPhoneNumbers.size
      });
      
      // Check if all phone numbers were processed
      const unprocessedNumbers = usersArray.filter(phone => !processedPhoneNumbers.has(phone));
      if (unprocessedNumbers.length > 0) {
        console.warn(`Warning: ${unprocessedNumbers.length} phone numbers were not processed:`);
        console.warn(unprocessedNumbers.slice(0, 10).join(', ') + (unprocessedNumbers.length > 10 ? '...' : ''));
      }
      
      // Ensure no duplicates in the result arrays
      result.phoneNumberRegistred = [...new Set(result.phoneNumberRegistred)];
      result.phoneNumberRejected = [...new Set(result.phoneNumberRejected)];
      result.totalPhoneNumber = [...new Set(result.totalPhoneNumber)];
      
      // Sanity check: ensure the sum of registered and rejected equals total
      const totalProcessed = result.phoneNumberRegistred.length + result.phoneNumberRejected.length;
      if (totalProcessed !== result.totalPhoneNumber.length) {
        console.warn(`Result count mismatch: registered (${result.phoneNumberRegistred.length}) + rejected (${result.phoneNumberRejected.length}) != total (${result.totalPhoneNumber.length})`);
      }
      
      // Check for accounts in flood wait
      const floodedAccounts = validAccounts.filter(acc => this.isAccountInFloodWait(acc.id));
      if (floodedAccounts.length > 0) {
        console.warn(`Warning: ${floodedAccounts.length} accounts are still in flood wait:`);
 
        for (const acc of floodedAccounts) {
          const waitTime = this.getFloodWaitTimeRemaining(acc.id);
          console.warn(`- Account ${acc.id} (${acc.phoneNumber}): ${waitTime} seconds remaining (${this.formatETA(waitTime)})`);
        }
      }
      
      io.emit("progress", {
        progress: 100,
        batchesCompleted: totalBatches,
        totalBatches,
        registered: result.phoneNumberRegistred.length,
        rejected: result.phoneNumberRejected.length,
        eta: "Completed",
        etaSeconds: 0
      });
      
      // Send final results to client
      io.emit("verification-complete", {
        registered: result.phoneNumberRegistred.length,
        rejected: result.phoneNumberRejected.length,
        total: result.totalPhoneNumber.length,
        processed: processedPhoneNumbers.size,
        unprocessed: unprocessedNumbers.length,
        floodedAccounts: floodedAccounts.map(acc => ({
          id: acc.id,
          phoneNumber: acc.phoneNumber,
          waitTimeSeconds: this.getFloodWaitTimeRemaining(acc.id),
          formattedWaitTime: this.formatETA(this.getFloodWaitTimeRemaining(acc.id))
        })),
        timestamp: new Date().toISOString()
      });

      // Send final account status update
      this.emitAccountsStatus(validAccounts, io);
      
      // Schedule a follow-up account status update after 1 minute to show updated flood wait times
      setTimeout(() => {
        this.emitAccountsStatus(validAccounts, io);
      }, 60000);

      return result;
    } catch (error) {
      // Provide detailed error information
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('SaveUsers operation failed:', error);
      
      // Check if any phone numbers were processed successfully
      const processedCount = processedPhoneNumbers.size;
      const totalCount = usersArray.length;
      const successRate = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;
      
      // console.log(`Verification process interrupted. Progress: ${successRate}% (${processedCount}/${totalCount} numbers processed)`);
      
      // Check for accounts in flood wait
      const floodedAccounts = validAccounts ? validAccounts.filter(acc => this.isAccountInFloodWait(acc.id)) : [];
      if (floodedAccounts.length > 0) {
        console.warn(`${floodedAccounts.length} accounts are in flood wait:`);
        for (const acc of floodedAccounts) {
          const waitTime = this.getFloodWaitTimeRemaining(acc.id);
          console.warn(`- Account ${acc.id} (${acc.phoneNumber}): ${waitTime} seconds remaining (${this.formatETA(waitTime)})`);
        }
        
        // If all accounts are in flood wait, save the operation for later resumption
        if (floodedAccounts.length === validAccounts.length) {
          const remainingPhoneNumbers = usersArray.filter(num => !processedPhoneNumbers.has(num));
          
          // Store the operation for later resumption
          this.pausedOperations.set(operationId, {
            phoneNumbers: remainingPhoneNumbers,
            processedNumbers: processedPhoneNumbers,
            config,
            result,
            timestamp: new Date()
          });
          
          // Find account with shortest wait time
          let minWaitTime = Infinity;
          let accountWithMinWait = null;
          
          for (const acc of validAccounts) {
            const waitTime = this.getFloodWaitTimeRemaining(acc.id);
            if (waitTime < minWaitTime) {
              minWaitTime = waitTime;
              accountWithMinWait = acc;
            }
          }
          
          if (accountWithMinWait) {
            io.emit("verification-paused", {
              message: `All accounts are rate limited. Waiting for ${this.formatETA(minWaitTime)} before continuing...`,
              waitTime: minWaitTime,
              nextAvailableAccount: {
                id: accountWithMinWait.id,
                phoneNumber: accountWithMinWait.phoneNumber,
                availableAt: new Date(Date.now() + minWaitTime * 1000).toISOString()
              },
              operationId,
              timestamp: new Date().toISOString(),
              batchProgress: {
                processed: processedCount,
                total: totalCount,
                successRate: successRate
              }
            });
          }
        }
      }
      
      io.emit("operation-failed", {
        operation: "saveUsers",
        error: errorMessage,
        timestamp: new Date().toISOString(),
        progress: {
          processed: processedCount,
          total: totalCount,
          successRate: successRate
        },
        operationId,
        floodedAccounts: floodedAccounts ? floodedAccounts.map(acc => ({
          id: acc.id,
          phoneNumber: acc.phoneNumber,
          waitTimeSeconds: this.getFloodWaitTimeRemaining(acc.id),
          formattedWaitTime: this.formatETA(this.getFloodWaitTimeRemaining(acc.id))
        })) : []
      });
      
      // Include partial results in the return value
      result.phoneNumberRegistred = [...new Set(result.phoneNumberRegistred)];
      result.phoneNumberRejected = [...new Set(result.phoneNumberRejected)];
      result.totalPhoneNumber = [...new Set(result.totalPhoneNumber)];
      
      // Send account status update even in error case
      if (validAccounts && validAccounts.length > 0) {
        this.emitAccountsStatus(validAccounts, io);
        
        // Schedule a follow-up account status update after 1 minute
        setTimeout(() => {
// Skip emitting account status if validAccounts is not defined
if (validAccounts && Array.isArray(validAccounts)) {
// Skip emitting account status if validAccounts is not defined
if (typeof validAccounts !== 'undefined') {
  this.emitAccountsStatus(validAccounts, io);
}
}
        }, 60000);
      }
      
      this.displayError(error, io);
      return result;
    }
  }

  static async getGroups(req: Request): Promise<GroupInfo[]> {
    const { accountId } = req.body;
    if (!accountId) throw new Error("Account ID required");

    const account = await this.getAccountById(accountId);
    if (!account || !account.mtproto || !account.connected) {
      throw new Error(`Account ${accountId} not available`);
    }

    try {
      const mtproto = account.mtproto;
      const groups: GroupInfo[] = [];

      const dialogs = await this.callWithDcMigration(mtproto, 'messages.getDialogs', {
        offset_date: 0,
        offset_id: 0,
        offset_peer: { _: 'inputPeerEmpty' },
        limit: 100
      });

      for (const chat of dialogs.chats) {
        if (chat._ === 'channel' || chat._ === 'chat') {
          groups.push({
            id: chat.id.toString(),
            name: chat.title || 'Unknown Group',
            description: '',
            memberCount: chat.participants_count || 0,
            isAdmin: !!(chat.admin_rights || chat.creator),
            profilePicUrl: undefined,
            access_hash: chat.access_hash || 0 // Store the access_hash for later use
          });
        }
      }

      return groups;
    } catch (error) {
      console.error(`Group fetch failed: ${error}`);
      throw error;
    }
  }

  static async exportGroupMembers(req: Request, res: Response): Promise<void> {
    const { accountId, groupId, filterType = 'recent', maxMembers = 0 } = req.body;
    
    // Validate required parameters
    if (!accountId) {
      return res.status(400).json({ error: "Account ID is required", code: "MISSING_ACCOUNT_ID" });
    }
    
    if (!groupId) {
      return res.status(400).json({ error: "Group ID is required", code: "MISSING_GROUP_ID" });
    }

    // Get account and validate it's available
    const account = await this.getAccountById(accountId).catch(error => {
      console.error(`Failed to get account ${accountId}:`, error);
      return null;
    });
    
    if (!account) {
      return res.status(404).json({ error: `Account ${accountId} not found`, code: "ACCOUNT_NOT_FOUND" });
    }
    
    if (!account.connected || !account.mtproto) {
      return res.status(400).json({ error: `Account ${accountId} is not connected`, code: "ACCOUNT_NOT_CONNECTED" });
    }
    
    // Set up response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="group_${groupId}_members_${filterType}.csv"`);
    
    // Handle potential errors gracefully
    req.on('close', () => {
      console.log(`Client disconnected during export of group ${groupId}`);
    });

    try {
      const startTime = Date.now();
      const mtproto = account.mtproto;
      
      // First, get the group information to retrieve the access_hash
      const groups = await this.getGroups({ body: { accountId } } as Request);
      const group = groups.find(g => g.id === groupId);
      
      if (!group) {
        throw new Error(`Group ${groupId} not found`);
      }
      
      const access_hash = group.access_hash || 0;
      console.log(`Exporting members from group ${groupId} with access_hash ${access_hash}`);
      
      // Determine the filter type based on the request
      let participantFilter: any = { _: 'channelParticipantsRecent' };
      let useMultipleFilters = false;
      
      // For large groups, we might need to try different filter strategies
      if (group.memberCount) {
const memberCount = parseInt(group.memberCount.toString());
        if (memberCount > 10000) {
          console.log(`Large group detected (${group.memberCount} members), using optimized fetching strategy`);
          useMultipleFilters = filterType === 'recent';
        }
        
        // For extremely large groups, use even more aggressive strategies
        if (memberCount > 25000) {
          console.log(`Extremely large group detected (${group.memberCount} members), using aggressive fetching strategy`);
          // Force multi-filter regardless of filter type for very large groups
          useMultipleFilters = true;
        }
      }
      
      switch (filterType) {
        case 'admins':
          participantFilter = { _: 'channelParticipantsAdmins' };
          break;
        case 'bots':
          participantFilter = { _: 'channelParticipantsBots' };
          break;
        case 'banned':
          participantFilter = { _: 'channelParticipantsBanned' };
          break;
        case 'contacts':
          participantFilter = { _: 'channelParticipantsContacts' };
          break;
        case 'recent':
        default:
          participantFilter = { _: 'channelParticipantsRecent' };
          break;
      }
      
      // Set up response headers for CSV download
      // res.setHeader('Content-Type', 'text/csv');
      // res.setHeader('Content-Disposition', `attachment; filename="group_${groupId}_members_${filterType}.csv"`);
      
      // Write CSV header
      res.write('Phone Number,First Name,Last Name,Username\n');
      
      // Send initial progress information
      res.write('# Export started, retrieving members...\n');
      
      // Implement pagination to fetch all members
      const batchSize = 200; // Maximum allowed by Telegram API
      let offset = 0;
      let totalMembers = 0;
      let hasMoreMembers = true;
      let emptyResultCount = 0;
      const maxRetries = 5; // Increased for better resilience
      
      // Respect maxMembers parameter if set (0 means no limit)
      const memberLimit = maxMembers > 0 ? maxMembers : Number.MAX_SAFE_INTEGER;
      
      // Get total member count if available
      const estimatedMemberCount = group.memberCount || 'unknown';
      console.log(`Starting member export with batch size ${batchSize}, estimated total: ${estimatedMemberCount}`);
      
      // For tracking unique users to avoid duplicates when using multiple filters
      const processedUserIds = new Set<string>();
      
      // Define filter strategies for large groups
      let filterStrategies;
      
      if (useMultipleFilters) {
        // For extremely large groups (>25000), use more aggressive strategies
        if (group.memberCount && parseInt(group.memberCount) > 25000) {
          filterStrategies = [
            { name: 'recent', filter: { _: 'channelParticipantsRecent' } },
            // Use multiple search queries with different starting letters to get better coverage
            { name: 'search_a', filter: { _: 'channelParticipantsSearch', q: 'a' } },
            { name: 'search_e', filter: { _: 'channelParticipantsSearch', q: 'e' } },
            { name: 'search_i', filter: { _: 'channelParticipantsSearch', q: 'i' } },
            { name: 'search_o', filter: { _: 'channelParticipantsSearch', q: 'o' } },
            { name: 'search_u', filter: { _: 'channelParticipantsSearch', q: 'u' } },
            { name: 'search_empty', filter: { _: 'channelParticipantsSearch', q: '' } },
            { name: 'contacts', filter: { _: 'channelParticipantsContacts' } },
            { name: 'admins', filter: { _: 'channelParticipantsAdmins' } }
          ];
        } else {
          // Standard multi-filter strategy for large groups
          filterStrategies = [
            { name: 'recent', filter: { _: 'channelParticipantsRecent' } },
            { name: 'search', filter: { _: 'channelParticipantsSearch', q: '' } }, // Empty search gets all members
            { name: 'contacts', filter: { _: 'channelParticipantsContacts' } }
          ];
        }
      } else {
        // Single filter strategy
        filterStrategies = [{ name: filterType, filter: participantFilter }];
      }
      
      // Track consecutive empty batches across all filter strategies
      let consecutiveEmptyBatches = 0;
      const maxConsecutiveEmptyBatches = 5;
      
      // Continue fetching until we've retrieved all members
      for (const strategy of filterStrategies) {
        if (!hasMoreMembers) break;
        
        console.log(`Using filter strategy: ${strategy.name}`);
        let strategyOffset = 0;
        let strategyHasMore = true;
        let strategyEmptyCount = 0;
        
        while (strategyHasMore && hasMoreMembers) {
          console.log(`Fetching members batch with ${strategy.name} filter at offset ${strategyOffset}`);
          
          let participants;
          let retryCount = 0;
          let success = false;
          
          // Implement retry logic
          while (retryCount < maxRetries && !success) {
            try {
              participants = await this.callWithDcMigration(mtproto, 'channels.getParticipants', {
                channel: {
                  _: 'inputChannel',
                  channel_id: parseInt(groupId),
                  access_hash: access_hash
                },
                filter: strategy.filter,
                offset: strategyOffset,
                limit: batchSize,
                hash: 0
              });
              success = true;
            } catch (error) {
              retryCount++;
              console.error(`Retry ${retryCount}/${maxRetries} failed:`, error.message);
              
              // If it's a FLOOD_WAIT error, wait the specified time before retrying
              if (error.message?.includes('FLOOD_WAIT')) {
                const waitSeconds = parseInt(error.message.match(/\d+/)?.[0] || '5', 10);
                const waitTime = Math.min(waitSeconds * 1000, 30000); // Cap at 30 seconds
                console.log(`Rate limited, waiting ${waitTime/1000} seconds before retry`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
              } else if (retryCount >= maxRetries) {
                // If we've exhausted retries, try next strategy
                console.log(`Failed with ${strategy.name} strategy after ${maxRetries} retries, trying next strategy`);
                strategyHasMore = false;
                break;
              } else {
                // For other errors, use exponential backoff
                const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
                console.log(`Backing off for ${backoffTime/1000} seconds before retry`);
                await new Promise(resolve => setTimeout(resolve, backoffTime));
              }
            }
          }
          
          // If we couldn't get participants after retries, move to next strategy
          if (!success) {
            continue;
          }
        
            if (!participants || !participants.users || participants.users.length === 0) {
              strategyEmptyCount++;
              consecutiveEmptyBatches++;
              console.log(`Received empty result with ${strategy.name} filter (${strategyEmptyCount}/3)`);
              
              // If we get 3 empty results in a row with this strategy, move to next strategy
              if (strategyEmptyCount >= 3) {
                strategyHasMore = false;
                console.log(`Received multiple empty results with ${strategy.name} filter, trying next strategy`);
                continue;
              }
              
              // If we get too many consecutive empty batches across all strategies, stop
              if (consecutiveEmptyBatches >= maxConsecutiveEmptyBatches) {
                hasMoreMembers = false;
                console.log(`Received ${consecutiveEmptyBatches} consecutive empty results across strategies, stopping fetch`);
                break;
              }
              
              // Skip this batch and continue to the next offset
              strategyOffset += batchSize;
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            
            // Reset empty result counters if we got results
            strategyEmptyCount = 0;
            consecutiveEmptyBatches = 0;
            
            // Process this batch of members, filtering out duplicates
            const newMembers: GroupMember[] = [];
            
            for (const user of participants.users) {
              // Skip bots
              if (user.bot) continue;
              
              // Skip already processed users (for multi-filter strategy)
              if (processedUserIds.has(user.id.toString())) continue;
              
              // Add to processed set
              processedUserIds.add(user.id.toString());
              
              // Add to new members list
              newMembers.push({
                id: user.id.toString(),
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username,
                phone: user.phone || '',
                isBot: false
              });
            }
            
            // If we didn't find any new members in this batch, increment empty count
            if (newMembers.length === 0) {
              strategyEmptyCount++;
              console.log(`No new members found with ${strategy.name} filter at offset ${strategyOffset}`);
              
              // If we get 3 empty results in a row with this strategy, move to next strategy
              if (strategyEmptyCount >= 3) {
                strategyHasMore = false;
                console.log(`No new members found with ${strategy.name} filter after multiple attempts, trying next strategy`);
                continue;
              }
            }
            
            // Write this batch to the CSV response
            if (newMembers.length > 0) {
              const batchContent = newMembers.map(m => 
                `${m.phone},"${m.firstName?.replace(/"/g, '""') || ''}","${m.lastName?.replace(/"/g, '""') || ''}",${m.username || ''}`
              ).join('\n');
              
              res.write(batchContent + '\n');
              
              // Update counters
              totalMembers += newMembers.length;
              
              // Check if we've reached the member limit
              if (totalMembers >= memberLimit) {
                console.log(`Reached specified member limit (${memberLimit}), stopping fetch`);
                hasMoreMembers = false;
                break;
              }
              
              // Calculate and log progress percentage if we know the total count
              if (estimatedMemberCount !== 'unknown') {
                const progress = Math.min(100, Math.round((totalMembers / parseInt(estimatedMemberCount)) * 100));
                console.log(`Progress: ${progress}% (${totalMembers}/${estimatedMemberCount})`);
                
                // Send progress update to client every 1000 members or when progress changes significantly
                if (totalMembers % 1000 === 0 || totalMembers % 5000 === 0) {
                  res.write(`# Progress: ${progress}% (${totalMembers}/${estimatedMemberCount})\n`);
                }
                
                // Check if we've reached the estimated total (with a small margin of error)
                if (totalMembers >= parseInt(estimatedMemberCount) * 0.98) {
                  hasMoreMembers = false;
                  console.log(`Reached estimated member count (${totalMembers}/${estimatedMemberCount}), stopping fetch`);
                  break;
                }
              } else {
                // If we don't know the total, just report the current count
                if (totalMembers % 1000 === 0 || totalMembers % 5000 === 0) {
                  res.write(`# Retrieved ${totalMembers} members so far...\n`);
                }
              }
              
              console.log(`Retrieved ${newMembers.length} new members with ${strategy.name} filter, total so far: ${totalMembers}`);
            }
            
            // Increment offset for next batch
            strategyOffset += batchSize;
            
            // Adaptive delay based on batch size to avoid rate limits
            const delayMs = Math.min(500 + (participants.users.length / 10), 2000);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            
            // For very large groups, periodically take longer breaks to avoid rate limits
            if (strategyOffset % (batchSize * 10) === 0) {
              console.log(`Taking a longer break after ${strategyOffset} offset to avoid rate limits`);
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
      }
      
      // Calculate coverage percentage
      let coveragePercentage = 100;
      if (estimatedMemberCount !== 'unknown') {
        coveragePercentage = Math.round((totalMembers / parseInt(estimatedMemberCount)) * 100);
      }
      
      // Send completion message with statistics
      res.write(`# Export completed: ${totalMembers} members exported from group ${groupId}\n`);
      
      // Include limit information if a limit was applied
      if (maxMembers > 0 && totalMembers >= maxMembers) {
        res.write(`# Note: Export stopped after reaching specified limit of ${maxMembers} members\n`);
      }
      
      res.write(`# Coverage: ${coveragePercentage}% of estimated ${estimatedMemberCount} members\n`);
      res.write(`# Unique members found: ${processedUserIds.size}\n`);
      res.write(`# Duration: ${((Date.now() - startTime) / 1000).toFixed(2)} seconds\n`);
      res.end();
      
      console.log(`Successfully exported ${totalMembers} members from group ${groupId}`);
      
      // Log detailed information for monitoring
      console.log({
        event: 'group_export_completed',
        groupId,
        accountId,
        filterType,
        totalMembers,
        uniqueMembers: processedUserIds.size,
        estimatedMemberCount,
        coveragePercentage,
        filtersUsed: filterStrategies.map(s => s.name).join(','),
        memberLimitApplied: maxMembers > 0 ? maxMembers : 'none',
        limitReached: maxMembers > 0 && totalMembers >= maxMembers,
        duration: `${((Date.now() - startTime) / 1000).toFixed(2)} seconds`
      });

  } }catch (error) {
    console.error(`Member export failed:`, error);
    
    // Provide more detailed error information
    let errorMessage = "Export failed";
    let statusCode = 500;
    
    if (error && typeof error === 'object' && error.message?.includes('FLOOD_WAIT')) {
      const waitTime = error.message.match(/\d+/)?.[0] || 'unknown';
      errorMessage = `Rate limited by Telegram. Please try again after ${waitTime} seconds.`;
      statusCode = 429; // Too Many Requests
    } else if (error && typeof error === 'object') {
      if (error.message?.includes('CHANNEL_INVALID')) {
        errorMessage = "Invalid channel or you don't have access to this group.";
        statusCode = 403; // Forbidden
      } else if (error.message?.includes('AUTH_KEY_UNREGISTERED')) {
        errorMessage = "Account session expired. Please reconnect the account.";
        statusCode = 401; // Unauthorized
      } else if (error.message?.includes('PEER_ID_INVALID')) {
        errorMessage = "Invalid group ID or the account doesn't have access to this group.";
        statusCode = 400; // Bad Request
      } else if (error.message?.includes('CHAT_ADMIN_REQUIRED')) {
        errorMessage = "Admin privileges required to access this group's members.";
        statusCode = 403; // Forbidden
      } else if (error.message?.includes('USER_PRIVACY_RESTRICTED')) {
        errorMessage = "Some members couldn't be retrieved due to privacy settings.";
        statusCode = 206; // Partial Content
      }
    }
    
    // If we've already started sending CSV data, add error as a comment in the CSV
    if (res.headersSent) {
      try {
        // Add detailed error information as CSV comments
        res.write(`\n# ERROR: ${errorMessage}\n`);
        res.write(`# ERROR_CODE: ${statusCode}\n`);
        res.write(`# MEMBERS_EXPORTED_BEFORE_ERROR: ${totalMembers}\n`);
        res.write(`# PARTIAL_EXPORT: true\n`);
        res.write(`# TROUBLESHOOTING: Please check your Telegram account permissions and try again later.\n`);
        res.end();
        return;
      } catch (writeError) {
        console.error('Failed to write error to response:', writeError);
      }
    }
    
    // If headers haven't been sent yet, return a proper JSON error response
    res.status(statusCode).json({
      error: errorMessage,
      code: statusCode,
      details: error && typeof error === 'object' ? error.message : 'Unknown error',
      partialExport: false
    });
  }
}


  static async processCSVFile(file: Express.Multer.File | { buffer: Buffer }): Promise<string[]> {
    if (!file || !file.buffer) {
      throw new Error('Invalid file or missing buffer');
    }

    try {
      return new Promise((resolve, reject) => {
        const phoneNumbers: string[] = [];
        const invalidEntries: {row: number, value: string}[] = [];
        let rowCount = 0;
        
        const stream = streamifier.createReadStream(file.buffer);
        
        stream
          .pipe(csvParser())
          .on('data', (row: any) => {
            rowCount++;
            // Get the first column value, regardless of column name
            const phoneNumber = Object.values(row)[0]?.toString().trim();
            
            // Basic phone number validation (can be enhanced)
            if (phoneNumber) {
              // Remove any non-digit characters for consistency
              const cleanedNumber = phoneNumber.replace(/\D/g, '');
              
              // Only add if it has a reasonable length for a phone number
              if (cleanedNumber.length >= 7 && cleanedNumber.length <= 15) {
                phoneNumbers.push(cleanedNumber);
              } else {
                invalidEntries.push({row: rowCount, value: phoneNumber});
              }
            }
          })
          .on('end', () => {
            console.log(`CSV processing complete: ${phoneNumbers.length} valid numbers found, ${invalidEntries.length} invalid entries skipped`);
            if (invalidEntries.length > 0) {
              console.warn('Invalid entries found:', invalidEntries.slice(0, 10));
            }
            resolve(phoneNumbers);
          })
          .on('error', (error) => {
            console.error('Error parsing CSV:', error);
            reject(new Error(`CSV parsing failed: ${error && typeof error === 'object' ? error.message : 'Unknown error'}`));
          });
      });
    } catch (error) {
      console.error('Error processing CSV file:', error);
      throw new Error(`Failed to process CSV file: ${error && typeof error === 'object' ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extracts error code from Telegram error messages
   * @param errorMessage The error message to parse
   * @returns The extracted error code or null if none found
   */
  static extractErrorCode(errorMessage: string): string | null {
    // Common Telegram error patterns
    const errorPatterns = [
      { pattern: /FLOOD_WAIT_(\d+)/i, code: 'FLOOD_WAIT' },
      { pattern: /PHONE_NUMBER_INVALID/i, code: 'PHONE_NUMBER_INVALID' },
      { pattern: /PHONE_NUMBER_BANNED/i, code: 'PHONE_NUMBER_BANNED' },
      { pattern: /PHONE_NUMBER_UNOCCUPIED/i, code: 'PHONE_NUMBER_UNOCCUPIED' },
      { pattern: /API_ID_INVALID/i, code: 'API_ID_INVALID' },
      { pattern: /API_ID_PUBLISHED_FLOOD/i, code: 'API_ID_PUBLISHED_FLOOD' },
      { pattern: /ACCESS_TOKEN_INVALID/i, code: 'ACCESS_TOKEN_INVALID' },
      { pattern: /AUTH_KEY_UNREGISTERED/i, code: 'AUTH_KEY_UNREGISTERED' },
      { pattern: /AUTH_KEY_INVALID/i, code: 'AUTH_KEY_INVALID' },
      { pattern: /USER_DEACTIVATED/i, code: 'USER_DEACTIVATED' },
      { pattern: /SESSION_REVOKED/i, code: 'SESSION_REVOKED' },
      { pattern: /SESSION_EXPIRED/i, code: 'SESSION_EXPIRED' },
      { pattern: /TIMEOUT/i, code: 'TIMEOUT' },
      { pattern: /NETWORK_ERROR/i, code: 'NETWORK_ERROR' }
    ];

    for (const { pattern, code } of errorPatterns) {
      if (pattern.test(errorMessage)) {
        return code;
      }
    }

    // If no specific pattern matches, try to extract any uppercase error code format
    const genericErrorMatch = errorMessage.match(/([A-Z_]+)(?:_\d+)?/);
    if (genericErrorMatch) {
      return genericErrorMatch[0];
    }

    return null;
  }

  // Check if a phone number is valid for Telegram verification
  static async isValidPhoneNumber(phoneNumber: string, account: TelegramAccount, io?: Server): Promise<{
    isValid: boolean;
    error?: string;
    errorCode?: string;
  }> {
    if (!account || !account.mtproto || !account.connected) {
      return { isValid: false, error: 'Account not connected', errorCode: 'ACCOUNT_NOT_CONNECTED' };
    }

    try {
      // Clean the phone number
      const cleanedNumber = phoneNumber.replace(/\D/g, '');
      
      // Check if the number has a reasonable length
      if (cleanedNumber.length < 7 || cleanedNumber.length > 15) {
        return { isValid: false, error: 'Invalid phone number format', errorCode: 'PHONE_NUMBER_INVALID' };
      }

      // Try to get contact info for this number to check if it's valid
      const result = await account.mtproto.call('contacts.resolvePhone', {
        phone: cleanedNumber
      }).catch(error => {
        // If we get a specific error about the phone number, it's still a valid format
        // but might not be registered or might be banned
        if (error && typeof error === 'object') {
          const errorMessage = error.message || '';
const errorCode = this.extractErrorCode(errorMessage) || 'UNKNOWN_ERROR';
          
          // These errors indicate the number format is valid but has other issues
          if (['PHONE_NUMBER_BANNED', 'PHONE_NUMBER_FLOOD', 'PHONE_NUMBER_INVALID'].includes(errorCode)) {
            return { error: errorMessage, errorCode };
          }
        }
        throw error;
      });

      // If we got a result, the number is valid and registered
      if (result && !result.error) {
        return { isValid: true };
      }
      
      // If we got a specific error from the API call
      if (result && result.error) {
        return { 
          isValid: false, 
          error: result.error, 
          errorCode: result.errorCode || 'UNKNOWN_ERROR' 
        };
      }

      // Default case - we couldn't verify
      return { isValid: true }; // Assume valid if we couldn't definitively determine it's invalid
    } catch (error) {
      console.error(`Error validating phone number ${phoneNumber}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = this.extractErrorCode(errorMessage);
      
      return { 
        isValid: false, 
        error: errorMessage,
        errorCode: errorCode || 'UNKNOWN_ERROR'
      };
    }
  }


  static async sendBulkMessages(req: Request, io: Server): Promise<MessageResult> {

    return this.sendMessages(req, io);
  }

  static async sendMessages(req: Request, io: Server): Promise<MessageResult> {
    const { accountId, phoneNumbers, message, config } = req.body;
    const result: MessageResult = {
      messagesSent: [],
      messagesFailed: [],
      totalMessages: []
    };

    if (!accountId || !phoneNumbers?.length || !message) {
      io.emit("display-error", {
        code: 400,
        message: "Missing required parameters",
        action: "provide_data"
      });
      return result;
    }

    const account = await this.getAccountById(accountId);
    if (!account || !account.mtproto || !account.connected) {
      io.emit("display-error", {
        code: 400,
        message: "Account not connected",
        action: "login"
      });
      return result;
    }

    try {
      const mtproto = account.mtproto;
      const batchSize = config?.batchSize || 25;
      const totalBatches = Math.ceil(phoneNumbers.length / batchSize);
      const delayBetweenMessages = config?.delayBetweenMessages || 1000;
      const delayBetweenBatches = config?.delayBetweenBatches || 5000;
      const scheduledTime = config?.scheduledTime ? new Date(config.scheduledTime) : null;

      if (scheduledTime && scheduledTime > new Date()) {
        const scheduledMessage: ScheduledMessage = {
          id: Date.now().toString(),
          accountId,
          phoneNumbers,
          message,
          config,
          scheduledTime,
          status: 'scheduled'
        };

        this.scheduledMessages.push(scheduledMessage);
        
        schedule.scheduleJob(scheduledTime, async () => {
          const index = this.scheduledMessages.findIndex(msg => msg.id === scheduledMessage.id);
          if (index !== -1) {
            this.scheduledMessages[index].status = 'running';
            const sendResult = await this.sendMessages(req, io);
            this.scheduledMessages[index].status = 'completed';
            this.scheduledMessages[index].result = sendResult;
          }
        });

        io.emit("message-scheduled", {
          id: scheduledMessage.id,
          scheduledTime,
          phoneNumbers: phoneNumbers.length,
          message: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        });

        return result;
      }

      io.emit("progress", {
        progress: 0,
        batchesCompleted: 0,
        totalBatches,
        sent: 0,
        failed: 0,
      });

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const currentBatch = phoneNumbers.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);

        for (const [index, phoneNumber] of currentBatch.entries()) {
          try {
            if (index > 0 && delayBetweenMessages > 0) {
              await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
            }

            const resolveResult = await mtproto.call('contacts.resolvePhone', {
              phone: phoneNumber.replace(/\D/g, '')
            }).catch(() => null);

            if (!resolveResult?.users?.length) {
              throw new Error('User not found');
            }

            const user = resolveResult.users[0];
            await mtproto.call('messages.sendMessage', {
              peer: {
                _: 'inputPeerUser',
                user_id: user.id,
                access_hash: user.access_hash
              },
              message,
              random_id: Math.floor(Math.random() * 1000000000)
            });

            result.messagesSent.push(phoneNumber);
          } catch (error) {
            result.messagesFailed.push(phoneNumber);
          }
          result.totalMessages.push(phoneNumber);
        }

        const progress = Math.round(((batchIndex + 1) / totalBatches) * 100);
        io.emit("progress", {
          progress,
          batchesCompleted: batchIndex + 1,
          totalBatches,
          sent: result.messagesSent.length,
          failed: result.messagesFailed.length,
        });

        io.emit("data-updated", {
          messagesSent: result.messagesSent,
          messagesFailed: result.messagesFailed,
          totalMessages: result.totalMessages,
          progress
        });

        if (batchIndex < totalBatches - 1 && delayBetweenBatches > 0) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }

      io.emit("progress", {
        progress: 100,
        batchesCompleted: totalBatches,
        totalBatches,
        sent: result.messagesSent.length,
        failed: result.messagesFailed.length,
        eta: "Completed"
      });

      return result;
    } catch (error) {
      this.displayError(error, io);
      return result;
    }
  }

  static async getScheduledMessages(): Promise<ScheduledMessage[]> {
    return this.scheduledMessages;
  }

  static async cancelScheduledMessage(req: Request, io: Server): Promise<boolean> {
    const { messageId } = req.body;
    if (!messageId) throw new Error("Message ID required");

    const index = this.scheduledMessages.findIndex(msg => msg.id === messageId);
    if (index === -1) return false;

    const jobs = schedule.scheduledJobs;
    for (const jobName in jobs) {
      if (jobName.includes(messageId)) {
        jobs[jobName].cancel();
        break;
      }
    }

    this.scheduledMessages.splice(index, 1);
    return true;
  }

  static getUploadMiddleware() {
    return upload.single('file');
  }

  // ========== HELPER METHODS ========== //
  private static saveSession(account: TelegramAccount): void {
    console.log(`Session saved for account ${account.id}`);
  }

  private static async calculateSRP(params: any): Promise<{ A: string, M1: string }> {
    return {
      A: 'dummy_A_value',
      M1: 'dummy_M1_value'
    };
  }

  private static formatETA(seconds: number): string {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m ${seconds % 60}s`;
  }
  
  // Emit account status updates to the client
  private static emitAccountsStatus(accounts: TelegramAccount[], io: Server): void {
    const accountsStatus = accounts.map(account => {
      const isInFloodWait = this.isAccountInFloodWait(account.id);
      const waitTimeRemaining = isInFloodWait ? this.getFloodWaitTimeRemaining(account.id) : 0;
      
      return {
        id: account.id,
        phoneNumber: account.phoneNumber,
        name: account.name,
        status: isInFloodWait ? 'flood_wait' : (account.connected ? 'connected' : 'disconnected'),
        waitTimeSeconds: waitTimeRemaining,
        formattedWaitTime: isInFloodWait ? this.formatETA(waitTimeRemaining) : null,
        availableAt: isInFloodWait ? new Date(Date.now() + waitTimeRemaining * 1000).toISOString() : null
      };
    });
    
    io.emit('accounts-status-update', {
      accounts: accountsStatus,
      timestamp: new Date().toISOString(),
      availableCount: accountsStatus.filter(acc => acc.status === 'connected').length,
      floodWaitCount: accountsStatus.filter(acc => acc.status === 'flood_wait').length
    });
  }

  // Track flood wait status for accounts
  private static floodWaitStatus: Map<string, { until: Date, waitSeconds: number }> = new Map();
  
  // Track active flood wait countdown intervals
  private static floodWaitIntervals: Map<string, NodeJS.Timeout> = new Map();
  
  // Check if an account is in flood wait
  private static isAccountInFloodWait(accountId: string): boolean {
    const status = this.floodWaitStatus.get(accountId);
    if (!status) return false;
    
    // Check if the flood wait period has expired
    if (new Date() > status.until) {
      this.floodWaitStatus.delete(accountId);
      return false;
    }
    
    return true;
  }
  
  // Check if any account is available (not in flood wait)
  private static isAnyAccountAvailable(accounts: TelegramAccount[]): boolean {
    if (!accounts || accounts.length === 0) return false;
    return accounts.some(acc => !this.isAccountInFloodWait(acc.id));
  }
  
  // Get time remaining for flood wait in seconds
  private static getFloodWaitTimeRemaining(accountId: string): number {
    const status = this.floodWaitStatus.get(accountId);
    if (!status) return 0;
    
    const now = new Date();
    if (now > status.until) return 0;
    
    return Math.ceil((status.until.getTime() - now.getTime()) / 1000);
  }
  
  // Set an account as being in flood wait
  private static setAccountFloodWait(accountId: string, waitSeconds: number, io?: Server): void {
    const until = new Date(Date.now() + waitSeconds * 1000);
    this.floodWaitStatus.set(accountId, { until, waitSeconds });
    
    console.log(`Account ${accountId} is in flood wait for ${waitSeconds} seconds until ${until.toISOString()}`);
    
    // Emit event if io is provided
    if (io) {
      io.emit("account-flood-wait", {
        accountId,
        waitSeconds,
        until: until.toISOString(),
        message: `Account ${accountId} is rate limited. Waiting for ${this.formatETA(waitSeconds)}...`
      });
      
      // Start countdown updates
      this.startFloodWaitCountdown(accountId, io);
      
      // Check if we need to resume any paused operations
      this.checkAndResumeOperations(io);
    }
  }
  
  // Start a countdown for flood wait
  private static startFloodWaitCountdown(accountId: string, io: Server): void {
    const UPDATE_INTERVAL = 1000; // Update every second
    
    // Don't start a new countdown if one is already running for this account
    if (this.floodWaitIntervals.has(accountId)) {
      return;
    }
    
    const intervalId = setInterval(() => {
      const remainingSeconds = this.getFloodWaitTimeRemaining(accountId);
      
      if (remainingSeconds <= 0) {
        clearInterval(intervalId);
        this.floodWaitStatus.delete(accountId);
        this.floodWaitIntervals.delete(accountId);
        
        io.emit("account-flood-wait-complete", {
          accountId,
          message: `Account ${accountId} is no longer rate limited and can be used again.`
        });
        
        // Check if we can resume operations now that an account is available
        setTimeout(() => {
          this.checkAndResumeOperations(io);
        }, 1000); // Small delay to ensure account status is updated
        
        return;
      }
      
      io.emit("account-flood-wait-update", {
        accountId,
        remainingSeconds,
        formattedTime: this.formatETA(remainingSeconds)
      });
    }, UPDATE_INTERVAL);
    
    // Store the interval ID so we can clear it if needed
    this.floodWaitIntervals.set(accountId, intervalId);
  }
  
  // Track paused operations that need to be resumed when accounts become available
  private static pausedOperations: Map<string, {
    phoneNumbers: string[],
    processedNumbers: Set<string>,
    config: any,
    result: PhoneNumberResult,
    timestamp: Date
  }> = new Map();
  
  // Check if any paused operations can be resumed
  private static checkAndResumeOperations(io: Server): void {
    if (this.pausedOperations.size === 0) return;
    
    // Get all accounts
    const accounts = Array.from(this.accounts.values());
    
    // Check if any account is available
    const availableAccount = this.findAvailableAccount(accounts);
    if (!availableAccount) return;
    
    // Get the oldest paused operation
    let oldestTimestamp = new Date();
    let oldestOperationId = '';
    
    this.pausedOperations.forEach((operation, id) => {
      if (operation.timestamp < oldestTimestamp) {
        oldestTimestamp = operation.timestamp;
        oldestOperationId = id;
      }
    });
    
    if (!oldestOperationId) return;
    
    // Get the paused operation
    const operation = this.pausedOperations.get(oldestOperationId);
    if (!operation) return;
    
    // Remove from paused operations
    this.pausedOperations.delete(oldestOperationId);
    
    // Notify that we're resuming the operation
    io.emit("operation-resuming", {
      message: "An account is now available. Resuming verification process...",
      timestamp: new Date().toISOString()
    });
    
    // Create a mock request object with the remaining phone numbers and config
    const mockReq = {
      body: {
        phoneNumbers: operation.phoneNumbers,
        config: operation.config
      }
    };
    
    // Resume the operation by calling saveUsers again
    this.saveUsers(mockReq as Request, io)
      .then(newResult => {
        // Merge results
        const mergedResult = {
          phoneNumberRegistred: [...operation.result.phoneNumberRegistred, ...newResult.phoneNumberRegistred],
          phoneNumberRejected: [...operation.result.phoneNumberRejected, ...newResult.phoneNumberRejected],
          totalPhoneNumber: [...operation.result.totalPhoneNumber, ...newResult.totalPhoneNumber]
        };
        
        // Emit completion event
        io.emit("verification-complete", {
          result: mergedResult,
          timestamp: new Date().toISOString(),
          message: "Verification process completed successfully"
        });
      })
      .catch(error => {
        console.error("Error resuming operation:", error);
        io.emit("operation-failed", {
          operation: "saveUsers",
          error: error.message || String(error),
          timestamp: new Date().toISOString()
        });
      });
    
    // Filter out already processed numbers
    const remainingNumbers = operation.phoneNumbers.filter(phone => !operation.processedNumbers.has(phone));
    
    if (remainingNumbers.length === 0) {
      // All numbers were processed, just send the final result
      io.emit("verification-complete", {
        registered: operation.result.phoneNumberRegistred.length,
        rejected: operation.result.phoneNumberRejected.length,
        total: operation.result.totalPhoneNumber.length,
        processed: operation.processedNumbers.size,
        unprocessed: 0,
        floodedAccounts: [],
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Start a new verification process with the remaining numbers
    setTimeout(() => {
      // Create a mock request object with the remaining phone numbers and config
      const mockReq = {
        body: {
          phoneNumbers: remainingNumbers,
          config: operation.config
        }
      };
      
      this.saveUsers(mockReq as Request, io, operation.result, operation.processedNumbers)
        .then(newResult => {
          // Merge results
          const mergedResult = {
            phoneNumberRegistred: [...operation.result.phoneNumberRegistred, ...newResult.phoneNumberRegistred],
            phoneNumberRejected: [...operation.result.phoneNumberRejected, ...newResult.phoneNumberRejected],
            totalPhoneNumber: [...operation.result.totalPhoneNumber, ...newResult.totalPhoneNumber]
          };
          
          // Emit completion event
          io.emit("verification-complete", {
            result: mergedResult,
            timestamp: new Date().toISOString(),
            message: "Verification process completed successfully"
          });
        })
        .catch(error => {
          console.error('Error resuming operation:', error);
          io.emit("operation-failed", {
            operation: "saveUsers",
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
            progress: {
              processed: operation.processedNumbers.size,
              total: operation.phoneNumbers.length,
              successRate: Math.round((operation.processedNumbers.size / operation.phoneNumbers.length) * 100)
            },
            floodedAccounts: []
          });
        });
    }, 1000); // Small delay before resuming
  }
  
  /**
   * Called when an account is successfully connected
   * Checks if there are any paused operations that can be resumed
   */
  static onAccountConnected(accountId: string, io: Server): void {
    console.log(`Account ${accountId} connected successfully`);
    
    // Update account status
    const account = this.accounts.get(accountId);
    if (account) {
      account.connected = true;
      account.status = "connected";
      account.lastUsed = new Date();
      
      // Clear any flood wait status for this account
      this.floodWaitStatus.delete(accountId);
      
      // Emit account status update
      io.emit("account-connected", {
        accountId,
        phoneNumber: account.phoneNumber,
        status: "connected",
        timestamp: new Date().toISOString()
      });
      
      // Notify that a new account is available
      if (this.pausedOperations.size > 0) {
        io.emit("account-available", {
          accountId,
          phoneNumber: account.phoneNumber,
          message: "A new account is available. Resuming verification process...",
          timestamp: new Date().toISOString()
        });
      }
      
      // Check if there are any paused operations that can be resumed
      this.checkAndResumeOperations(io);
    }
  }
  
  // Find a non-flooded account from a list of accounts
  private static findAvailableAccount(accounts: TelegramAccount[]): TelegramAccount | null {
    for (const account of accounts) {
      if (!this.isAccountInFloodWait(account.id)) {
        return account;
      }
    }
    return null;
  }
  
  /**
   * Gets the minimum flood wait time across all accounts
   * @param accounts List of accounts to check
   * @returns The minimum flood wait time in seconds
   */
  static getMinimumFloodWaitTime(accounts: TelegramAccount[]): number {
    let minWaitTime = Infinity;
    
    for (const account of accounts) {
      const waitTime = this.getFloodWaitTimeRemaining(account.id);
      if (waitTime < minWaitTime) {
        minWaitTime = waitTime;
      }
    }
    
    return minWaitTime === Infinity ? 0 : minWaitTime;
  }
  
  /**
   * Gets the account with the minimum flood wait time
   * @param accounts List of accounts to check
   * @returns The account with the minimum flood wait time, or null if no accounts are in flood wait
   */
  static getAccountWithMinimumFloodWait(accounts: TelegramAccount[]): TelegramAccount | null {
    let minWaitTime = Infinity;
    let accountWithMinWait = null;
    
    for (const account of accounts) {
      const waitTime = this.getFloodWaitTimeRemaining(account.id);
      if (waitTime < minWaitTime) {
        minWaitTime = waitTime;
        accountWithMinWait = account;
      }
    }
    
    return accountWithMinWait;
  }
  
  private static async callWithDcMigration(mtproto: any, method: string, params: any, retryCount = 0, accountId?: string, io?: Server): Promise<any> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second delay between retries
    
    try {
      console.log(`Calling Telegram API method: ${method}${accountId ? ` with account ${accountId}` : ''}`);
      return await mtproto.call(method, params);
    } catch (error: any) {
      console.error(`Error in Telegram API call ${method}:`, error);
      
      // Handle DC migration errors
      if (error.error_code === 303) {
        const migrationMatch = error.error_message.match(/^(PHONE|NETWORK|USER)_MIGRATE_(\d+)$/);
        if (migrationMatch) {
          const dcId = parseInt(migrationMatch[2]);
          console.log(`Migrating to DC ${dcId}...`);
          await mtproto.setDefaultDc(dcId);
          return await mtproto.call(method, params);
        }
      }
      
      // Handle flood wait errors with improved tracking
      if (error.error_code === 420) {
        const waitMatch = error.error_message.match(/^FLOOD_WAIT_(\d+)$/);
        if (waitMatch) {
          const waitSeconds = parseInt(waitMatch[1]);
          console.log(`Flood wait error, waiting for ${waitSeconds} seconds...`);
          
          // If we have account ID and io, track the flood wait status
          if (accountId && io) {
            this.setAccountFloodWait(accountId, waitSeconds, io);
            
            // Throw a special error that can be caught by the caller
             throw new Error(`FLOOD_WAIT_ACCOUNT_ROTATION: Account ${accountId} is in flood wait for ${waitSeconds} seconds`);
          } else {
            // Legacy behavior if no account tracking is available
            await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
            return this.callWithDcMigration(mtproto, method, params, retryCount, accountId, io);
          }
        }
      }
      
      // Handle network errors with retry logic
      if ((error.error_code === 500 || error.error_code === 503 || error.error_message?.includes('NETWORK')) && retryCount < MAX_RETRIES) {
        const nextRetry = retryCount + 1;
        console.log(`Network error, retrying (${nextRetry}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.callWithDcMigration(mtproto, method, params, nextRetry, accountId, io);
      }
      
      // Rethrow with more context
      const enhancedError = new Error(`Telegram API error in ${method}: ${error.error_message || error.message}`);
      (enhancedError as any).originalError = error;
      throw enhancedError;
    }
  }

  private static displayError(error: any, io: Server): void {
    let errorCode = 500;
    let errorMessage = 'Unknown error';
    let action = 'retry';

    if (error?.error_message) {
      const errorMappings: Record<string, { code: number, message: string, action: string }> = {
        'AUTH_KEY_INVALID': { code: 401, message: 'Authentication invalid - relogin required', action: 'relogin' },
        'SESSION_PASSWORD_NEEDED': { code: 402, message: 'Two-factor authentication required', action: 'request_2fa' },
        'FLOOD_WAIT': { code: 429, message: 'Too many requests - please wait', action: 'retry_after_wait' },
        'PHONE_NUMBER_INVALID': { code: 400, message: 'Invalid phone number', action: 'correct_input' },
        'PHONE_CODE_INVALID': { code: 400, message: 'Invalid verification code', action: 'retry_with_correct_code' },
        'PHONE_CODE_EXPIRED': { code: 400, message: 'Verification code expired', action: 'request_new_code' },
        'API_ID_INVALID': { code: 400, message: 'Invalid API ID', action: 'check_credentials' }
      };

      if (errorMappings[error.error_message]) {
        ({ code: errorCode, message: errorMessage, action } = errorMappings[error.error_message]);
      } else if (error.error_message.startsWith('FLOOD_WAIT_')) {
        const waitTime = parseInt(error.error_message.split('_').pop() || '0', 10);
        errorMessage = `Too many requests - wait ${waitTime} seconds`;
        action = 'retry_after_wait';
      } else {
        errorMessage = error.error_message;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    io.emit("display-error", {
      code: errorCode,
      message: errorMessage,
      action: action
    });
  }
}

export default TelegramController;