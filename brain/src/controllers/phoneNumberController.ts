
import { Request, Response } from "express";
import { Server } from "socket.io";
import multer, { Multer } from "multer";
// Replace the crypto import with this:
if (!globalThis.crypto) {
  const { Crypto } = require('@peculiar/webcrypto');
  globalThis.crypto = new Crypto();
}


// Set up crypto for both environments

import { makeWASocket, useMultiFileAuthState, DisconnectReason, WASocket, downloadMediaMessage } from '@whiskeysockets/baileys';
import PhoneNumberGenerator from "../utils/phoneNumberGenerator";
import Error400 from "../errors/Error400";
import streamifier from "streamifier";
import csvParser from "csv-parser";
import { Readable } from 'stream';
import path from 'path';
import os from 'os';
import fs from 'fs';
// Configure multer with memory storage
const upload: Multer = multer({ storage: multer.memoryStorage() });

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
  number: string;
  message: string;
  status: 'success' | 'failed';
  sentAt?: string;
  attemptedAt?: string;
  error?: string;
  actualDelay: string;
  accountUsed?: string;
}

interface WhatsAppAccount {
  id: string;
  phoneNumber: string;
  name?: string;
  profilePicUrl?: string;
  status?: string;
  connected: boolean;
  socket?: WASocket;
  lastUsed?: Date;
}

interface GroupInfo {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isAdmin: boolean;
  profilePicUrl?: string;
}

interface GroupMember {
  id: string;
  phoneNumber: string;
  name?: string;
  isAdmin: boolean;
}

// Connection pool for Baileys sockets
const CONNECTION_TIMEOUT = 30000;

class PhoneNumberController {
  private static accounts: Map<string, WhatsAppAccount> = new Map();
  private static activeOperations = new Map<string, AbortController>();
  private static currentOperationId: string | null = null;


  // Add at top of class
private static getSessionPath(index: number): string {
  let sessionPath: string;
  
  if ((process as any).pkg) {
    // For packaged executable
    const homeDir = os.homedir();
    sessionPath = path.join(homeDir, '.whatsapp-toolkit', 'sessions', `session-${index}`);
  } else {
    // For development
    sessionPath = path.join(__dirname, '..', 'baileys_auth', `session-${index}`);
  }

  // Ensure directory exists
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  return sessionPath;
}




  static async initializeAccount(io, index: number): Promise<WhatsAppAccount | null> {
    try {
const authFolder = this.getSessionPath(index);
        const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    if (!fs.existsSync(authFolder)) {
      fs.mkdirSync(authFolder, { recursive: true });
    }
const socket = makeWASocket({
  auth: state,
  printQRInTerminal: false,
  // Add browser version emulation
  browser: ["WhatsApp Toolkit", "Chrome", "4.0.0"],
  // Enable retries for initial connection
  connectTimeoutMs: 60_000,
  keepAliveIntervalMs: 30_000,
});

      const accountId = `account-${index}`;
      const account: WhatsAppAccount = {
        id: accountId,
        phoneNumber: "",
        connected: false,
        socket: socket
      };

          this.accounts.set(accountId, account);


      socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          io.emit("scan-qrcode", { qr, accountId });
        }

        if (connection === 'open') {
          try {
            // Get account info once connected
            const phoneNumber = socket.user?.id?.split(':')[0] || "";
            account.phoneNumber = phoneNumber;
            account.connected = true;

            // Try to get profile picture and status
            try {
              account.profilePicUrl = await socket.profilePictureUrl(socket.user?.id || "");
            } catch (err) {
              console.log(`Could not get profile picture for ${accountId}`);
            }

            try {
              const status = await socket.fetchStatus(socket.user?.id || "");
              account.status = status?.toString() || "";
            } catch (err) {
              console.log(`Could not get status for ${accountId}`);
            }

            // Update the account in the map
            this.accounts.set(accountId, account);

            io.emit("client-connect", {
              accountId,
              phoneNumber: account.phoneNumber,
              profilePicUrl: account.profilePicUrl,
              status: account.status,
              connected: true
            });

            console.log(`✅ WhatsApp client #${index} connected with number ${phoneNumber}`);
          } catch (error) {
            console.error(`Error getting account info for ${accountId}:`, error);
          }
        }

        if (connection === 'close') {

            if ((lastDisconnect?.error as any)?.message?.includes('Zero-length key')) {
    console.error(`🛑 Crypto error detected for ${accountId}. Resetting session...`);
    
    // Delete corrupted session
    try {
      if (fs.existsSync(authFolder)) {
        fs.rmSync(authFolder, { recursive: true, force: true });
      }
    } catch (err) {
      console.error('Error deleting auth folder:', err);
    }
    
    // Reinitialize after delay
    setTimeout(() => this.initializeAccount(io, index), 3000);
    return;
  }


          const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;

          account.connected = false;
          this.accounts.set(accountId, account);

          io.emit("client-disconnect", {
            accountId,
            reason: shouldReconnect ? "DISCONNECTED" : "LOGOUT",
            connect: false,
            timestamp: new Date().toISOString()
          });

          if (shouldReconnect) {
            console.log(`Reconnecting ${accountId}...`);
            setTimeout(() => this.initializeAccount(io, index), 5000);
          } else {
            // Remove from accounts if logged out
            this.accounts.delete(accountId);
            // Delete auth files
            try {
              if (fs.existsSync(authFolder)) {
                fs.rmSync(authFolder, { recursive: true, force: true });
              }
            } catch (err) {
              console.error(`Error deleting auth folder for ${accountId}:`, err);
            }
          }
        }
      });

      socket.ev.on('creds.update', saveCreds);

      return account;
    } catch (error) {
      console.error(`Error initializing account ${index}:`, error);
      io.emit("display-error", {
        message: `Failed to initialize WhatsApp client #${index}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        actionRequired: false,
        isFatal: false
      });
      return null;
    }
  }

  static async getConnectedAccounts(): Promise<WhatsAppAccount[]> {
    const connectedAccounts: WhatsAppAccount[] = [];

    for (const account of this.accounts.values()) {
      if (account.connected) {
        connectedAccounts.push({
          id: account.id,
          phoneNumber: account.phoneNumber,
          name: account.name,
          profilePicUrl: account.profilePicUrl,
          status: account.status,
          connected: account.connected,
          lastUsed: account.lastUsed
        });
      }
    }

    return connectedAccounts;
  }




  static async logout(req: Request, io): Promise<void> {
    try {
      const { accountId } = req.body;

      if (!accountId) {
        throw new Error400("Account ID is required");
      }

      const account = this.accounts.get(accountId);
      if (!account || !account.connected || !account.socket) {
        io.emit("display-error", {
          message: `⚠️ Account ${accountId} is not connected.`,
          actionRequired: false,
          isFatal: false
        });
        return;
      }

      console.log(`🚪 Starting logout process for account ${accountId}...`);

      try {
        await account.socket.logout();
            const authFolder = this.getSessionPath(accountId.split('-')[1]);
    if (fs.existsSync(authFolder)) {
      fs.rmSync(authFolder, { recursive: true, force: true });
    }
        this.accounts.delete(accountId);

        io.emit("client-disconnect", {
          accountId,
          reason: "LOGOUT",
          connect: false,
          timestamp: new Date().toISOString(),
          isFatal: false
        });

        console.log(`✅ Logout completed for account ${accountId}`);

        io.emit("success", {
          success: true,
          message: `Account ${accountId} logged out successfully`
        });
      } catch (error) {
        console.error(`Error logging out account ${accountId}:`, error);
        io.emit("display-error", {
          message: `Error logging out account ${accountId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          actionRequired: false,
          isFatal: false
        });


      }
    } catch (error) {
      console.error("Logout process failed:", error);
      io.emit("display-error", {
        type: "LOGOUT_FAILED",
        message: error instanceof Error ? error.message : "Logout failed",
        isRecoverable: true
      });

      io.emit("display-error", {
        success: false,
        message: error instanceof Error ? error.message : "Logout failed"
      });
    }
  }

  static async logoutAll(io): Promise<void> {
    try {
      if (this.accounts.size === 0) {
        io.emit("display-error", {
          message: "⚠️ No connected accounts to logout.",
          actionRequired: false,
          isFatal: false
        });

        io.emit("success", {
          success: true,
          message: "No connected accounts to logout"
        });
        return;
      }

      console.log("🚪 Starting logout process for all accounts...");

      const logoutPromises: Promise<any>[] = [];
      const accountIds: string[] = [];

      for (const [accountId, account] of this.accounts.entries()) {
        if (account.connected && account.socket) {
          accountIds.push(accountId);
          logoutPromises.push(
            account.socket.logout().catch(err => {
              console.error(`Error logging out account ${accountId}:`, err);
              return { accountId, success: false, error: err };
            })
          );
        }
      }

      await Promise.allSettled(logoutPromises);

      // Clear all accounts
      this.accounts.clear();

      for (const accountId of accountIds) {
        io.emit("client-disconnect", {
          accountId,
          reason: "LOGOUT",
          connect: false,
          timestamp: new Date().toISOString(),
          isFatal: false
        });
      }

      console.log("✅ Logout completed for all accounts");

      io.emit("success", {
        success: true,
        message: `${accountIds.length} accounts logged out successfully`
      });
    } catch (error) {
      console.error("Mass logout process failed:", error);
      io.emit("display-error", {
        type: "LOGOUT_ALL_FAILED",
        message: error instanceof Error ? error.message : "Mass logout failed",
        isRecoverable: true
      });

      io.emit("display-error", {
        success: false,
        message: error instanceof Error ? error.message : "Mass logout failed"
      });
    }
  }

  static async login(io: any, req: Request, res: Response,): Promise<void> {
    try {
      // Find the next available index
      let nextIndex = 0;
      const existingIndices = new Set<number>();

      for (const accountId of this.accounts.keys()) {
        const match = accountId.match(/account-(\d+)/);
        if (match) {
          existingIndices.add(parseInt(match[1]));
        }
      }

      while (existingIndices.has(nextIndex)) {
        nextIndex++;
      }

      console.log(`🔐 Starting login via QR code for account-${nextIndex}...`);
      const account = await this.initializeAccount(io, nextIndex);

      if (account) {
        io.emit("success", {
          success: true,
          message: `Login process started for account-${nextIndex}`,
          accountId: account.id
        });
      } else {
        io.emit("display-error", {
          success: false,
          message: "Failed to initialize login process"
        });
      }
    } catch (error) {
      console.error("Login process failed:", error);
      io.emit("display-error", {
        message: error instanceof Error ? error.message : "Login failed",
        actionRequired: true,
        isFatal: true
      });


    }
  }



    static async getAccountById(accountId: string): Promise<WhatsAppAccount | null> {
    const account = this.accounts.get(accountId);
    return account && account.connected ? account : null;
  }



static async cancelAccountConnection(accountId, io?: Server): Promise<boolean> {
  const account = this.accounts.get(accountId);
  if (!account || !account.socket) return false;
  const authFolder = this.getSessionPath(accountId.split('-')[1]);
  if (fs.existsSync(authFolder)) {
    fs.rmSync(authFolder, { recursive: true, force: true });
  }
  try {

    
    // 1. Remove ALL event listeners
    account.socket.ev.removeAllListeners('connection.update');
    account.socket.ev.removeAllListeners('creds.update');
    
    // 2. Terminate the connection
    await account.socket.ws.close();
    await account.socket.end(undefined);
    
    // 3. Clean up references
    this.accounts.delete(accountId);
    
    // 4. Delete auth session files
    const authFolder = `baileys_auth/session-${accountId.split('-')[1]}`;
    if (fs.existsSync(authFolder)) {
      fs.rmSync(authFolder, { recursive: true, force: true });
    }
    
    // 5. Notify frontend
    if (io) {
      io.emit("connection-cancelled", { 
        accountId,
        success: true 
      });
    }
    
    return true;
  } catch (error: any) {
    console.error(`Failed to cancel account ${accountId}:`, error);
    if (io) {
      io.emit("connection-cancelled", {
        accountId,
        success: false,
        error: error.message
      });
    }
    return false;
  }
}


  static cancelCurrentOperation(): void {
    if (this.currentOperationId) {
      const abortController = this.activeOperations.get(this.currentOperationId);
      if (abortController) {
        abortController.abort();
        this.activeOperations.delete(this.currentOperationId);
      }
      this.currentOperationId = null;
    }
  }

  static async forceDisconnectAll(io?: Server): Promise<void> {
    try {
      console.log("☢️ Force-disconnecting ALL WhatsApp connections...");

      // 1. Cancel active operations
      if (this.currentOperationId) {
        this.cancelCurrentOperation();
      }

      // 2. Clear all QR code generation processes
      for (const [accountId, account] of this.accounts.entries()) {
        if (account.socket) {
          try {
            // Disconnect the socket without full logout to stop QR generation
            account.socket.ev.removeAllListeners('connection.update');
            account.socket.ev.removeAllListeners('creds.update');
            account.connected = false;
            
            console.log(`Disconnected account ${accountId} to stop QR generation`);
          } catch (err) {
            console.error(`Error disconnecting account ${accountId}:`, err);
          }
        }
      }

      // 3. Notify frontend
      if (io) {
        io.emit("all-clients-disconnected", {
          success: true,
          message: "All connections terminated. QR codes stopped.",
        });
      }

      console.log("💀 ALL CONNECTIONS TERMINATED.");
    } catch (error) {
      console.error("DISCONNECT FAILED:", error);
      if (io) {
        io.emit("display-error", {
          error: "DISCONNECT_FAILED",
          message: "QR codes might still appear. Restart the server.",
        });
      }
    }
  }




  // This is the main function that handles the verification of phone numbers



  static async saveUsers(
    usersArray: string[],
    res: Response,
    io,
    config: VerificationConfig
  ) {
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
      // Check if selected accounts are provided and valid
      const selectedAccounts = config.selectedAccounts || [];
      if (selectedAccounts.length === 0) {
        io.emit("display-error", {
          error: "No Accounts Selected",
          message: "🔒 Please select at least one WhatsApp account for verification.",
          actionRequired: true
        });
        return result;
      }

      // Validate all selected accounts exist and are connected
      const validAccounts: WhatsAppAccount[] = [];
      for (const accountId of selectedAccounts) {
        const account = await this.getAccountById(accountId);
        if (account && account.socket) {
          validAccounts.push(account);
        } else {
          io.emit("display-error", {
            error: "Invalid Account",
            message: `🔒 Account ${accountId} is not connected. Please select valid accounts.`,
            actionRequired: true
          });
          return result;
        }
      }

      if (validAccounts.length === 0) {
        io.emit("display-error", {
          error: "No Valid Accounts",
          message: "🔒 None of the selected accounts are valid. Please login first.",
          actionRequired: true
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

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        if (abortController.signal.aborted) {
          io.emit("process-cancelled", {
            reason: "Process cancelled by user",
            partialResults: result
          });
          break;
        }

        // Select account for this batch using round-robin
        const accountIndex = batchIndex % validAccounts.length;
        const account = validAccounts[accountIndex];
        account.lastUsed = new Date();

        io.emit("batch-account-selected", {
          batchIndex,
          accountId: account.id,
          phoneNumber: account.phoneNumber
        });

        const currentBatch = usersArray.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
        const batchResult: PhoneNumberResult = {
          phoneNumberRegistred: [],
          phoneNumberRejected: [],
          totalPhoneNumber: []
        };

        for (const [index, phoneNumber] of currentBatch.entries()) {
          if (abortController.signal.aborted) break;

          try {
            if (index > 0 && config.delayBetweenNumbers > 0) {
              await new Promise(resolve => setTimeout(resolve, config.delayBetweenNumbers));
            }

            const results = await account.socket!.onWhatsApp(`${phoneNumber.replace(/\D/g, '')}@s.whatsapp.net`);
            const [exists] = Array.isArray(results) ? results : [];

            if (exists?.exists) {
              batchResult.phoneNumberRegistred.push(phoneNumber);
            } else {
              batchResult.phoneNumberRejected.push(phoneNumber);
            }
            batchResult.totalPhoneNumber.push(phoneNumber);

          } catch (error) {
            console.error(`Error processing ${phoneNumber} with account ${account.id}:`, error);
            batchResult.phoneNumberRejected.push(phoneNumber);
            batchResult.totalPhoneNumber.push(phoneNumber);
          }
        }

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
        const etaString = this.formatETA(etaSeconds);

        io.emit("progress", {
          progress,
          batchesCompleted: batchIndex + 1,
          totalBatches,
          registered: result.phoneNumberRegistred.length,
          rejected: result.phoneNumberRejected.length,
          eta: etaString,
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

      return result;

    } catch (error) {
      console.error("CRITICAL ERROR:", error);
      const processedCount = result.totalPhoneNumber.length;
      if (processedCount < usersArray.length) {
        const unprocessed = usersArray.slice(processedCount);
        result.phoneNumberRejected.push(...unprocessed);
        result.totalPhoneNumber.push(...unprocessed);
      }

      io.emit("display-error", {
        error: "System Error",
        message: "⚙️ Temporary system issue. Please try again later.",
        actionRequired: false
      });

      return result;
    } finally {
      this.activeOperations.delete(operationId);
      this.currentOperationId = null;
    }
  }

  static async sendChat(req: Request, res: Response, io): Promise<void> {
    const { phoneNumbers, messages, time, useRandomDelay, selectedAccounts } = req.body;

    let successfullySent = 0;
    const overallStartTime = Date.now();
    const delayMinutes = time || 1; // Default to 1 minute if not specified

    if (!phoneNumbers?.length || !Array.isArray(phoneNumbers)) {
      throw new Error400("Invalid phone numbers array");
    }
    if (!messages?.length || !Array.isArray(messages) || !messages.every(m => m?.text)) {
      throw new Error400("Messages must be a non-empty array of { text: string } objects");
    }

    // Validate selected accounts
    if (!selectedAccounts?.length || !Array.isArray(selectedAccounts)) {
      io.emit("display-error", {
        error: "No Accounts Selected",
        message: "🔒 Please select at least one WhatsApp account for sending messages.",
        actionRequired: true
      });
      throw new Error400("Please select at least one account for sending messages");
    }

    // Validate all selected accounts exist and are connected
    const validAccounts: WhatsAppAccount[] = [];
    for (const accountId of selectedAccounts) {
      const account = await this.getAccountById(accountId);
      if (account && account.socket) {
        validAccounts.push(account);
      }
    }

    if (validAccounts.length === 0) {
      io.emit("display-error", {
        error: "No Valid Accounts",
        message: "🔒 None of the selected accounts are valid. Please login first.",
        actionRequired: true
      });
      throw new Error400("None of the selected accounts are valid");
    }

    const results: MessageResult[] = [];
    let lastSentTime = 0;

    try {
      io.emit("send-status", {
        status: "started",
        total: phoneNumbers.length,
        delayMinutes: useRandomDelay ? `Random 1-${delayMinutes}` : delayMinutes,
        startedAt: new Date(overallStartTime).toISOString(),
        accounts: validAccounts.map(a => a.id)
      });

      console.log(`[START] Sending to ${phoneNumbers.length} numbers | ` +
        `${useRandomDelay ? `Random delay 1-${delayMinutes} minutes` : `Fixed delay ${delayMinutes} minutes`} | ` +
        `Using ${validAccounts.length} accounts`);

      for (const [index, phoneNumber] of phoneNumbers.entries()) {
        const iterationStart = Date.now();
        const jid = phoneNumber.includes('@s.whatsapp.net')
          ? phoneNumber
          : `${phoneNumber.replace(/\D/g, '')}@s.whatsapp.net`;

        const { text: messageText } = messages[Math.floor(Math.random() * messages.length)];

        // Select account for this message using round-robin
        const accountIndex = index % validAccounts.length;
        const account = validAccounts[accountIndex];
        account.lastUsed = new Date();

        try {
          // Calculate delay for this specific message
          const currentDelayMs = useRandomDelay
            ? (Math.floor(Math.random() * (delayMinutes - 1) + 1) * 60000)
            : (delayMinutes * 60000);

          const timeSinceLast = lastSentTime > 0 ? iterationStart - lastSentTime : 0;
          const remainingDelay = Math.max(0, currentDelayMs - timeSinceLast);

          if (remainingDelay > 0 && index > 0) {
            console.log(`[DELAY] Waiting ${(remainingDelay / 60000).toFixed(2)} minutes before next message`);
            await new Promise(resolve => setTimeout(resolve, remainingDelay));
          }

          await account.socket!.sendMessage(jid, { text: messageText });
          lastSentTime = Date.now();
          successfullySent++;

          results.push({
            number: phoneNumber,
            message: messageText,
            status: "success",
            sentAt: new Date().toISOString(),
            actualDelay: (remainingDelay / 60000).toFixed(2) + ' minutes',
            accountUsed: account.id
          });

          const progressMsg = `[PROGRESS] ${index + 1}/${phoneNumbers.length} | ` +
            `Sent to ${phoneNumber} using account ${account.id} | ` +
            `Delay: ${(currentDelayMs / 60000).toFixed(2)}m`;
          console.log(progressMsg);

          io.emit("send-progress", {
            current: index + 1,
            total: phoneNumbers.length,
            lastNumber: phoneNumber,
            lastMessage: messageText,
            nextMessageIn: index < phoneNumbers.length - 1
              ? `${(currentDelayMs / 60000).toFixed(2)} minutes`
              : "Complete",
            isRandomDelay: useRandomDelay,
            accountUsed: account.id
          });

        } catch (error) {
          const errorMsg = `[ERROR] Failed to send to ${phoneNumber} using account ${account.id}: ` +
            (error instanceof Error ? error.message : "Unknown error");
          console.error(errorMsg);

          results.push({
            number: phoneNumber,
            message: messageText,
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
            attemptedAt: new Date().toISOString(),
            actualDelay: "0 minutes",
            accountUsed: account.id
          });

          io.emit("send-error", {
            number: phoneNumber,
            error: error instanceof Error ? error.message : "Unknown error",
            accountId: account.id
          });
        }
      }

      const totalTimeMinutes = (Date.now() - overallStartTime) / 60000;
      const completionMsg = `[COMPLETE] ${phoneNumbers.length}/${phoneNumbers.length} | ` +
        `Total time: ${totalTimeMinutes.toFixed(2)} minutes | ` +
        `${successfullySent} succeeded | ` +
        `${phoneNumbers.length - successfullySent} failed`;
      console.log(completionMsg);

      io.emit("success", {
        success: true,
        sent: successfullySent,
        failed: phoneNumbers.length - successfullySent,
        config: {
          delayMinutes: useRandomDelay ? `1-${delayMinutes}` : delayMinutes,
          useRandomDelay,
          actualAverageDelay: totalTimeMinutes / Math.max(1, phoneNumbers.length - 1),
          accountsUsed: validAccounts.map(a => a.id)
        },
        timing: {
          startedAt: new Date(overallStartTime).toISOString(),
          completedAt: new Date().toISOString(),
          totalTimeMinutes: totalTimeMinutes.toFixed(2)
        },
        results
      });

    } catch (error) {
      const errorMsg = `[FAILED] Runtime ${((Date.now() - overallStartTime) / 60000).toFixed(2)} minutes | ` +
        (error instanceof Error ? error.message : "Unknown error");
      console.error(errorMsg);

      io.emit("send-status", {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        runtimeMinutes: ((Date.now() - overallStartTime) / 60000).toFixed(2)
      });
      throw error;
    }
  }

  static async getGroups(req: Request): Promise<GroupInfo[]> {

    const accountId = req.body.accountId;


    if (!accountId) {
      throw new Error400("Account ID is required");
    }

    const account = await this.getAccountById(accountId as string);
    if (!account || !account.socket) {
      throw new Error400(`Account ${accountId} not available`);
    }

    try {
      const socket = account.socket;
      const groups = []  as any[]

      // Get all chats
      const chats = await socket.groupFetchAllParticipating();

      for (const [id, chat] of Object.entries(chats)) {
        let profilePicUrl :any;
        try {
          profilePicUrl = await socket.profilePictureUrl(id, 'image').catch((): null => null);
        } catch (err) {
          // Profile pic not available, continue without it
        }

        const groupInfo: GroupInfo = {
          id,
          name: chat.subject || 'Unknown Group',
          description: chat.desc,
          memberCount: Object.keys(chat.participants).length,
          isAdmin: chat.participants.some(p =>
            p.id === socket.user?.id && ['admin', 'superadmin'].includes(p.admin || '')
          ),
          profilePicUrl: profilePicUrl || undefined
        };

        groups.push(groupInfo);
      }

      return groups;
    } catch (error) {
      console.error(`Error fetching groups for account ${accountId}:`, error);
      throw new Error(`Failed to fetch groups: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async exportGroupMembers(req: Request, res: Response): Promise<void> {
    const { accountId, groupId } = req.body;

    if (!accountId || !groupId) {
      throw new Error400("Account ID and Group ID are required");
    }

    const account = await this.getAccountById(accountId);
    if (!account || !account.socket) {
      throw new Error400(`Account ${accountId} not available`);
    }

    try {
      const socket = account.socket;

      // Get group metadata
      const metadata = await socket.groupMetadata(groupId);
      if (!metadata) {
        throw new Error400(`Group ${groupId} not found`);
      }

      const members: GroupMember[] = [];

      for (const participant of metadata.participants) {
        const phoneNumber = participant.id.split('@')[0];
        let name = '';

        // Try to get contact name if available
        try {
         await socket.getBusinessProfile(participant.id);
        
        } catch (err) {
          // Contact info not available, continue without it
        }

        members.push({
          id: participant.id,
          phoneNumber,
          name,
          isAdmin: ['admin', 'superadmin'].includes(participant.admin || '')
        });
      }

      // Set CSV headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${metadata.subject.replace(/[^a-z0-9]/gi, '_')}_members.csv"`);

      // Create CSV content
      const csvHeader = 'Phone Number,Name,Is Admin\n';
      const csvRows = members.map(member =>
        `${member.phoneNumber},"${member.name?.replace(/"/g, '""') || ''}",${member.isAdmin ? 'Yes' : 'No'}`
      );

      // Stream CSV to response
      const csvContent = csvHeader + csvRows.join('\n');
      res.send(csvContent);

    } catch (error) {
      console.error(`Error exporting group members for group ${groupId} with account ${accountId}:`, error);
      throw new Error(`Failed to export group members: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async cleanup(): Promise<void> {
    const logoutPromises = [];

    for (const [accountId, account] of this.accounts.entries()) {
      if (account.connected && account.socket) {
        // logoutPromises.push(
        //   Promise.resolve(account.socket.logout()).catch(err => {
        //     console.error(`Error logging out account ${accountId} during cleanup:`, err);
        //   })
        // );
      }
    }

    await Promise.allSettled(logoutPromises);
    this.accounts.clear();
  }

  private static formatETA(seconds: number): string {
    if (seconds <= 0) return "Completed";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours > 0 ? `${hours}h` : "",
      minutes > 0 ? `${minutes}m` : "",
      `${secs}s`
    ].filter(Boolean).join(" ");
  }

 



  // CSV handling methods
  static async downloadCSV(req: Request, res: Response): Promise<void> {
    const { phoneNumbers } = req.body;
    if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
      throw new Error400("Invalid phone numbers data")
    }

    try {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=phone_numbers.csv");

      const transformStream = new Readable({
        read() { }
      });

      transformStream.push("phone_number\n");

      const BATCH_SIZE = 1000;
      let currentBatch: string[] = [];

      for (const number of phoneNumbers) {
        if (!number) continue;
        currentBatch.push(`${number}\n`);
        if (currentBatch.length >= BATCH_SIZE) {
          transformStream.push(currentBatch.join(''));
          currentBatch = [];
        }
      }

      if (currentBatch.length > 0) {
        transformStream.push(currentBatch.join(''));
      }

      transformStream.push(null);
      transformStream.pipe(res)
        .on('error', (error) => {
          console.error('Stream error:', error);
          if (!res.headersSent) {
            throw new Error("CSV generation failed")
          }
        });

    } catch (error) {
      console.error("Error creating CSV:", error);
      if (!res.headersSent) {
        throw new Error("Failed to generate CSV")
      }
    }
  }

  static async uploadCSV(req, res: Response, io): Promise<{
    newNumbers: string[];
    duplicateNumbers: string[];
    invalidNumbers: string[];
  }> {
    return new Promise((resolve, reject) => {
      upload.single("csvFile")(req, res, async (err: any) => {
        if (err) {
          console.error("Upload error:", err);
          return reject(err);
        }

        if (!req.file) return reject(new Error("No file uploaded"));

        const PHONE_REGEX = /^\+?[\d\s\-\(\)]{10,15}$/;
        const seenNumbers = new Set<string>();
        const newNumbers: string[] = [];
        const duplicateNumbers: string[] = [];
        const invalidNumbers: string[] = [];
        let totalProcessed = 0;

        try {
          const stream = streamifier.createReadStream(req.file.buffer);

          stream
            .pipe(csvParser())
            .on("data", (row) => {
              const value = Object.values(row)[0];
              const number = typeof value === 'string' ? value.trim() : '';

              if (!number) return;
              totalProcessed++;

              if (!PHONE_REGEX.test(number)) {
                invalidNumbers.push(number);
                return;
              }

              if (seenNumbers.has(number)) {
                duplicateNumbers.push(number);
              } else {
                seenNumbers.add(number);
                newNumbers.push(number);
              }

              if (totalProcessed % 1000 === 0) {
                io.emit("file-progress", {
                  progress: Math.floor((totalProcessed / (totalProcessed + 1)) * 100),
                  stats: {
                    processed: totalProcessed,
                    new: newNumbers.length,
                    duplicates: duplicateNumbers.length,
                    invalid: invalidNumbers.length,
                  },
                });
              }
            })
            .on("end", () => {
              io.emit("file-progress", {
                progress: 100,
                stats: {
                  processed: totalProcessed,
                  new: newNumbers.length,
                  duplicates: duplicateNumbers.length,
                  invalid: invalidNumbers.length,
                },
              });

              resolve({
                newNumbers,
                duplicateNumbers,
                invalidNumbers
              });
            })
            .on("error", (error) => {
              console.error("CSV stream error:", error);
              reject(error);
            });

        } catch (error) {
          console.error("Processing error:", error);
          reject(error);
        }
      });
    });
  }

  // Generate the phone Numbers 
  static async generatePhoneNumbers(req: Request): Promise<any> {
    try {
      const phoneNumbers = await PhoneNumberGenerator.generatePhoneNumbers(req);
      return phoneNumbers;
    } catch (error) {
      console.error("Error generating phone numbers:", error);
      throw error; // rethrow to be caught by the calling function
    }
  }


  
  static async phoneDetail(req: Request, res: Response, io) {
    // Get all connected accounts
    const connectedAccounts = Array.from(this.accounts.values())
      .filter(account => account.connected && account.socket);

    if (connectedAccounts.length === 0) {
      throw new Error400("No connected WhatsApp accounts available");
    }

    // Select a random connected account
    const randomAccount = connectedAccounts[
      Math.floor(Math.random() * connectedAccounts.length)
    ];

    const rawNumber = req.params.id;
    const sanitizedNumber = rawNumber.replace(/\D/g, '');
    const jid = `${sanitizedNumber}@s.whatsapp.net`;

    try {
      // Check if number exists on WhatsApp
      if (!randomAccount.socket) {
        throw new Error400('WhatsApp socket not available');
      }
      const results = await randomAccount.socket.onWhatsApp(jid);
      const [result] = Array.isArray(results) ? results : [];

      if (!result?.exists) {
        throw new Error400(`Number ${rawNumber} is not registered on WhatsApp`);
      }

      // Fetch additional details in parallel
      const [profile, status, business] = await Promise.all([
         randomAccount.socket.profilePictureUrl(jid, "image").catch(() => null),
        randomAccount.socket.fetchStatus(jid).catch(() => null),
        randomAccount.socket.getBusinessProfile(jid).catch(() => null)
      ]);

      return {
        profilePicUrl: profile,
        about: status || null,  // More consistent null handling
        name: '',    // Name not available in result type
        sanitizedNumber,
        business: !!business,
        verifiedByAccount: randomAccount.phoneNumber  // Show which account was used
      };

    } catch (error) {
      console.error(`Failed to check number ${rawNumber} using account ${randomAccount.id}:`, error);
      throw new Error400(
        error instanceof Error ? error.message :
          "Failed to fetch WhatsApp number details"
      );
    }
  }

}

export default PhoneNumberController;
