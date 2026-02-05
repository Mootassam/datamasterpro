import { Request, Response } from "express";
import { Server } from "socket.io";
import multer, { Multer } from "multer";
import MTProto, { getSRPParams } from "@mtproto/core";
import path from 'path';
import os from 'os';
import fs from 'fs';
import streamifier from "streamifier";
import csvParser from "csv-parser";
import { Readable } from 'stream';
import schedule from 'node-schedule';
const upload: Multer = multer({ storage: multer.memoryStorage() });
const API_ID = 29214492;
const API_HASH = "c69d0e6e1d0714b5d95416208632243e";
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
  type?: string; // 'channel' or 'chat'
  username?: string; // public @username if available
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
  private static scheduledMessages: ScheduledMessage[] = [];
    private static activeOperations = new Map<string, AbortController>();
    private static currentOperationId: string | null = null;
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
      } catch (error :any) {
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
    } catch (error :any) {
      this.displayError(error, io);
      throw error;
    }
  }
  static async joinGroup(req: Request, io: Server): Promise<any> {
    const { accountId, inviteLink } = req.body;
   
    if (!accountId || !inviteLink) {
      throw new Error("Account ID and invite link are required");
    }
    const account = await this.getAccountById(accountId);
    if (!account || !account.mtproto || !account.connected) {
      throw new Error("Account not connected");
    }
    try {
      const mtproto = account.mtproto;
      let result;
      // Handle t.me/joinchat/ or t.me/+ links (Private links)
      if (inviteLink.includes('joinchat') || inviteLink.includes('+')) {
         const hash = inviteLink.split('+')[1] || inviteLink.split('joinchat/')[1];
         result = await this.callWithDcMigration(mtproto, 'messages.importChatInvite', {
            hash: hash
         }, 0, account.id, io);
      } else {
         // Handle public usernames (t.me/username or @username)
         let username = inviteLink.split('/').pop();
         if (username.startsWith('@')) username = username.substring(1);
        
         result = await this.callWithDcMigration(mtproto, 'contacts.resolveUsername', {
            username: username
         }, 0, account.id, io);
        
         // If resolved, we might need to join if not already a member
         if (result.chats && result.chats.length > 0) {
             const chat = result.chats[0];
             const inputChannel = {
                 _: 'inputChannel',
                 channel_id: chat.id,
                 access_hash: chat.access_hash
             };
            
             try {
                 await this.callWithDcMigration(mtproto, 'channels.joinChannel', {
                    channel: inputChannel
                 }, 0, account.id, io);
             } catch (e: any) {
                 // If already a member, ignore
                 if (!e.message?.includes('USER_ALREADY_PARTICIPANT')) {
                     throw e;
                 }
             }
             // Return the chat info
             return chat;
         }
      }
      return result;
    } catch (error: any) {
      this.displayError(error, io);
      throw error;
    }
  }
  static async getDialogFilters(req: Request, io: Server): Promise<any> {
      const { accountId } = req.body;
      const account = await this.getAccountById(accountId);
      if (!account || !account.mtproto || !account.connected) {
        throw new Error("Account not connected");
      }
      try {
          const result = await this.callWithDcMigration(account.mtproto, 'messages.getDialogFilters', {}, 0, account.id, io);
          return result;
      } catch (error: any) {
          this.displayError(error, io);
          throw error;
      }
  }
  static async scrapeMembers(req: Request, io: Server): Promise<any> {
    const { accountId, inviteLink } = req.body;
   
    try {
        // First join/resolve the group
        const chat = await this.joinGroup(req, io);
       
        // Get account
        const account = await this.getAccountById(accountId);
        if (!account || !account.mtproto) throw new Error("Account error");
       
        const mtproto = account.mtproto;
       
        let members: GroupMember[] = [];
        
        if (chat._ === 'chat') {
            // For basic chats
            const fullChatResult = await this.callWithDcMigration(mtproto, 'messages.getFullChat', {
                chat_id: chat.id
            }, 0, account.id, io);
            
            const fullChat = fullChatResult.fullChat;
            const users = fullChatResult.users;
            
            members = fullChat.participants.participants
                .map((p: any) => {
                    const user = users.find((u: any) => u.id === p.user_id);
                    if (!user || user.bot) return null;
                    return {
                        id: user.id.toString(),
                        firstName: user.first_name,
                        lastName: user.last_name,
                        username: user.username,
                        phone: user.phone,
                        isBot: false
                    };
                })
                .filter(Boolean);
        } else {
            // For channels/supergroups
            const inputChannel = {
                _: 'inputChannel',
                channel_id: chat.id,
                access_hash: chat.access_hash
            };
           
            const result = await this.callWithDcMigration(mtproto, 'channels.getParticipants', {
                channel: inputChannel,
                filter: { _: 'channelParticipantsRecent' },
                offset: 0,
                limit: 200,
                hash: 0
            }, 0, account.id, io);
           
            members = result.users
                .filter((u: any) => !u.bot)
                .map((u: any) => ({
                    id: u.id.toString(),
                    firstName: u.first_name,
                    lastName: u.last_name,
                    username: u.username,
                    phone: u.phone,
                    isBot: false
                }));
        }
       
        return {
            group: {
                id: chat.id.toString(),
                name: chat.title,
                username: chat.username,
                memberCount: chat.participants_count || members.length,
                access_hash: chat.access_hash,
                type: chat._
            },
            members
        };
       
    } catch (error: any) {
        this.displayError(error, io);
        throw error;
    }
  }
  static async autoDiscoverGroups(req: Request, io: Server): Promise<any> {
    const { accountId, keywords, limit = 20 } = req.body;
   
    const account = await this.getAccountById(accountId);
    if (!account || !account.mtproto || !account.connected) {
      throw new Error("Account not connected");
    }
    try {
      const mtproto = account.mtproto;
      const results: any[] = [];
     
      const keywordsList = Array.isArray(keywords) ? keywords : [keywords];
     
      for (const keyword of keywordsList) {
          const searchResult = await this.callWithDcMigration(mtproto, 'contacts.search', {
              q: keyword,
              limit: limit
          }, 0, account.id, io);
         
          if (searchResult.chats) {
              for (const chat of searchResult.chats) {
                  if (chat._ === 'channel' || chat._ === 'chat') {
                      results.push({
                          id: String(chat.id),
                          title: chat.title,
                          username: chat.username,
                          members: chat.participants_count,
                          type: chat._,
                          access_hash: chat.access_hash
                      });
                  }
              }
          }
      }
     
      // Remove duplicates
      const uniqueResults = results.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
     
      return uniqueResults;
    } catch (error: any) {
      this.displayError(error, io);
      throw error;
    }
  }
  static async discoverPublicGroupsOrChannels(req: Request, io: Server): Promise<any> {
    const { accountId, keyword, limit = 1000, settings } = req.body;
    const onlyChannels = settings?.onlyChannels === true;
    const onlyGroups = settings?.onlyGroups === true;
    
    const account = await this.getAccountById(accountId);
    if (!account || !account.mtproto || !account.connected) {
      throw new Error("Account not connected");
    }
    try {
      const mtproto = account.mtproto;
      const q = String(keyword || '').trim();
      if (!q) throw new Error("Keyword is required");
      
      const searchResult = await this.callWithDcMigration(mtproto, 'contacts.search', {
        q,
        limit
      }, 0, account.id, io);
      
      const items: any[] = [];
      if (searchResult?.chats?.length) {
        for (const chat of searchResult.chats) {
          const type = chat._; // 'channel' or 'chat'
          if (onlyChannels && type !== 'channel') continue;
          if (onlyGroups && type !== 'chat') continue;
          
          items.push({
            id: String(chat.id),
            title: chat.title,
            username: chat.username,
            type,
            members: chat.participants_count,
            access_hash: chat.access_hash
          });
        }
      }
      // Deduplicate by id
      const unique = items.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      return unique;
    } catch (error: any) {
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
    } catch (error :any) {
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
    } catch (error :any) {
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
      io.emit("success", {
        message: "Login successful",
        accountId: account.id,
        phoneNumber: account.phoneNumber,
        name: account.name
      });
    } catch (error :any) {
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
      const srpParams = await getSRPParams({
        g,
        p,
        salt1,
        salt2,
        gB: srp_B,
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
      io.emit("success", {
        message: "2FA confirmed successfully",
        accountId: account.id,
        phoneNumber: account.phoneNumber,
        name: account.name
      });
    } catch (error :any) {
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
static async saveUsers(req: Request, io: Server): Promise<PhoneNumberResult> {
  const { phoneNumbers, config } = req.body;
  const selectedAccounts = config.selectedAccounts || [];
    let validAccounts: TelegramAccount[] = [];
  // Create unique operation ID and abort controller
  const operationId = Math.random().toString(36).substring(2, 15);
  this.currentOperationId = operationId;
  const abortController = new AbortController();
  this.activeOperations.set(operationId, abortController);
  const usersArray = Array.isArray(phoneNumbers) ? phoneNumbers : [];
  const result: PhoneNumberResult = {
    phoneNumberRegistred: [],
    phoneNumberRejected: [],
    totalPhoneNumber: []
  };
  if (usersArray.length === 0 || selectedAccounts.length === 0) {
    io.emit("display-error", {
      code: 400,
      message: "Phone numbers and accounts required",
      action: "provide_data"
    });
    return result;
  }
  const processedPhoneNumbers = new Set<string>();
  let cancellationEmitted = false;
  try {
    // Load and validate accounts
    const validAccounts: TelegramAccount[] = [];
    for (const accountId of selectedAccounts) {
      // Check cancellation before each account validation
      if (abortController.signal.aborted && !cancellationEmitted) {
        io.emit("process-cancelled", {
          reason: "Process cancelled by user",
          partialResults: result
        });
        cancellationEmitted = true;
        break;
      }
     
      const account = await this.getAccountById(accountId);
      if (account && account.mtproto && account.connected) {
        validAccounts.push(account);
      }
    }
    // Handle cancellation during account validation
    if (abortController.signal.aborted && !cancellationEmitted) {
      io.emit("process-cancelled", {
        reason: "Process cancelled by user",
        partialResults: result
      });
      cancellationEmitted = true;
    }
    if (cancellationEmitted) return result;
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
    this.emitAccountsStatus(validAccounts, io);
   
    // Process batches
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      // PRIMARY CANCELLATION CHECKPOINT - Before each batch
      if (abortController.signal.aborted && !cancellationEmitted) {
        io.emit("process-cancelled", {
          reason: "Process cancelled by user",
          partialResults: result
        });
        cancellationEmitted = true;
        break;
      }
      if (cancellationEmitted) break;
     
      // Find available account
      let account = this.findAvailableAccount(validAccounts);
     
      // Handle flood wait
      if (!account) {
        this.emitAccountsStatus(validAccounts, io);
       
        let minWaitTime = Infinity;
        let accountWithMinWait ;
       
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
              id: accountWithMinWait?.id || '',
              phoneNumber: accountWithMinWait?.phoneNumber || '',
              availableAt: new Date(Date.now() + minWaitTime * 1000).toISOString()
            }
          });
         
          // Wait with cancellation check
          await new Promise(resolve => setTimeout(resolve, minWaitTime * 1000 + 1000));
         
          // Check cancellation after waiting
          if (abortController.signal.aborted && !cancellationEmitted) {
            io.emit("process-cancelled", {
              reason: "Process cancelled by user",
              partialResults: result
            });
            cancellationEmitted = true;
            break;
          }
          if (cancellationEmitted) break;
         
          account = accountWithMinWait;
          this.emitAccountsStatus(validAccounts, io);
        } else {
          throw new Error("No accounts available");
        }
      }
     
      // Process phone numbers in batch
      const currentBatch = usersArray.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize).filter(phone => !processedPhoneNumbers.has(phone));
      if (currentBatch.length === 0) continue;
      
      const batchResult: PhoneNumberResult = {
        phoneNumberRegistred: [],
        phoneNumberRejected: [],
        totalPhoneNumber: []
      };
      
      let batchProcessed = false;
      while (!batchProcessed) {
        // SECONDARY CANCELLATION CHECKPOINT
        if (abortController.signal.aborted && !cancellationEmitted) {
          io.emit("process-cancelled", {
            reason: "Process cancelled by user",
            partialResults: result
          });
          cancellationEmitted = true;
          break;
        }
        if (cancellationEmitted) break;
        
        // Account availability check
        if (account && this.isAccountInFloodWait(account.id)) {
          this.emitAccountsStatus(validAccounts, io);
          const newAccount = this.findAvailableAccount(validAccounts);
          
          if (newAccount) {
            io.emit("account-switched", {
              oldAccountId: account?.id || '',
              oldAccountPhone: account?.phoneNumber,
              newAccountId: newAccount.id,
              newAccountPhone: newAccount.phoneNumber,
              reason: "flood_wait",
              waitTime: account?.id ? this.getFloodWaitTimeRemaining(account.id) : 0,
              formattedWaitTime: account ? this.formatETA(this.getFloodWaitTimeRemaining(account.id)) : '0s',
              timestamp: new Date().toISOString()
            });
            account = newAccount;
          } else {
            const waitTime = this.getFloodWaitTimeRemaining(account.id);
            io.emit("verification-paused", {
              message: `All accounts are rate limited. Waiting for ${this.formatETA(waitTime)} before continuing...`,
              waitTime,
              nextAvailableAccount: {
                id: account.id,
                phoneNumber: account.phoneNumber,
                availableAt: new Date(Date.now() + waitTime * 1000).toISOString()
              },
              timestamp: new Date().toISOString()
            });
            
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000 + 1000));
            
            // Check cancellation after flood wait
            if (abortController.signal.aborted && !cancellationEmitted) {
              io.emit("process-cancelled", {
                reason: "Process cancelled by user",
                partialResults: result
              });
              cancellationEmitted = true;
              break;
            }
            if (cancellationEmitted) break;
            
            this.emitAccountsStatus(validAccounts, io);
          }
        }
        
        if (!account || !account.mtproto) {
          throw new Error('Account or MTProto instance not available');
        }
        
        const mtproto = account.mtproto;
        
        try {
          const clientIdToPhone = new Map<number, string>();
          const contacts = currentBatch.map((phoneNumber, idx) => {
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            const clientId = Date.now() + idx;
            clientIdToPhone.set(clientId, phoneNumber);
            return {
              _: 'inputPhoneContact',
              client_id: clientId,
              phone: cleanPhone,
              first_name: 'Check',
              last_name: 'User'
            };
          });
          
          const importResult = await this.callWithDcMigration(mtproto, 'contacts.importContacts', {
            contacts
          }, 0, account.id, io);
          
          const processedInBatch: string[] = [];
          
          for (const imp of importResult.imported) {
            const phoneNumber = clientIdToPhone.get(imp.client_id);
            if (phoneNumber) {
              const user = importResult.users.find((u: any) => u.id === imp.user_id);
              if (user) {
                batchResult.phoneNumberRegistred.push(phoneNumber);
                io.emit("number-verified", {
                  phoneNumber,
                  status: "registered",
                  timestamp: new Date().toISOString(),
                  accountId: account.id
                });
                processedInBatch.push(phoneNumber);
                processedPhoneNumbers.add(phoneNumber);
              }
            }
          }
          
          for (const phoneNumber of currentBatch) {
            if (!processedInBatch.includes(phoneNumber)) {
              batchResult.phoneNumberRejected.push(phoneNumber);
              io.emit("number-verified", {
                phoneNumber,
                status: "not_registered",
                timestamp: new Date().toISOString(),
                accountId: account.id
              });
              processedPhoneNumbers.add(phoneNumber);
            }
          }
          
          batchResult.totalPhoneNumber.push(...currentBatch);
          
          // Cleanup
          const toDelete = importResult.users
            .filter((u: any) => u.access_hash)
            .map((u: any) => ({
              _: 'inputUser',
              user_id: u.id,
              access_hash: u.access_hash
            }));
          
          if (toDelete.length > 0) {
            await this.callWithDcMigration(mtproto, 'contacts.deleteContacts', {
              id: toDelete
            }, 0, account.id, io);
          }
          
          batchProcessed = true;
          
        } catch (error: any) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          if (errorMessage.includes('FLOOD_WAIT_ACCOUNT_ROTATION')) {
            // Continue to switch account
            continue;
          } else {
            console.error(`Error processing batch ${batchIndex}:`, error);
            io.emit("verification-error", {
              batchIndex,
              error: errorMessage,
              timestamp: new Date().toISOString(),
              accountId: account?.id
            });
            // Mark all as rejected on error
            batchResult.phoneNumberRejected.push(...currentBatch);
            batchResult.totalPhoneNumber.push(...currentBatch);
            currentBatch.forEach(phone => processedPhoneNumbers.add(phone));
            batchProcessed = true;
          }
        }
      }
      
      // Break if cancellation occurred
      if (cancellationEmitted) break;
      
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
        currentAccount: account?.id
      });
      
      io.emit("data-updated", {
        phoneNumberRegistred: result.phoneNumberRegistred,
        phoneNumberRejected: result.phoneNumberRejected,
        totalPhoneNumber: result.totalPhoneNumber,
        progress
      });
      
      // TERTIARY CANCELLATION CHECKPOINT - Before batch delay
      if (abortController.signal.aborted && !cancellationEmitted) {
        io.emit("process-cancelled", {
          reason: "Process cancelled by user",
          partialResults: result
        });
        cancellationEmitted = true;
        break;
      }
      if (cancellationEmitted) break;
      
      if (batchIndex < totalBatches - 1 && config.delayBetweenBatches > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delayBetweenBatches));
        
        // Check cancellation after batch delay
        if (abortController.signal.aborted && !cancellationEmitted) {
          io.emit("process-cancelled", {
            reason: "Process cancelled by user",
            partialResults: result
          });
          cancellationEmitted = true;
          break;
        }
        if (cancellationEmitted) break;
      }
      
      // Check if any accounts are available for the next batch
      if (batchIndex < totalBatches - 1) {
        const nextAccount = this.findAvailableAccount(validAccounts);
        if (!nextAccount) {
          let minWaitTime = Infinity;
          let accountWithMinWait ;
          
          for (const acc of validAccounts) {
            const waitTime = this.getFloodWaitTimeRemaining(acc.id);
            if (waitTime < minWaitTime) {
              minWaitTime = waitTime;
              accountWithMinWait = acc;
            }
          }
          
          if (accountWithMinWait && minWaitTime > 0) {
            io.emit("verification-paused", {
              message: `All accounts are rate limited. Waiting for ${this.formatETA(minWaitTime)} before continuing with the next batch...`,
              waitTime: minWaitTime,
              batchesCompleted: batchIndex + 1,
              totalBatches
            });
            
            await new Promise(resolve => setTimeout(resolve, minWaitTime * 1000 + 1000));
            
            // Check cancellation after waiting
            if (abortController.signal.aborted && !cancellationEmitted) {
              io.emit("process-cancelled", {
                reason: "Process cancelled by user",
                partialResults: result
              });
              cancellationEmitted = true;
              break;
            }
            if (cancellationEmitted) break;
          }
        }
      }
    }
    
    // Only run completion logic if not cancelled
    if (!cancellationEmitted) {
      // Final validation of results
      console.log('Final verification results:', {
        registered: result.phoneNumberRegistred.length,
        rejected: result.phoneNumberRejected.length,
        total: result.totalPhoneNumber.length,
        processed: processedPhoneNumbers.size
      });
      
      const unprocessedNumbers = usersArray.filter(phone => !processedPhoneNumbers.has(phone));
      if (unprocessedNumbers.length > 0) {
        console.warn(`Warning: ${unprocessedNumbers.length} phone numbers were not processed:`);
        console.warn(unprocessedNumbers.slice(0, 10).join(', ') + (unprocessedNumbers.length > 10 ? '...' : ''));
      }
      
      result.phoneNumberRegistred = [...new Set(result.phoneNumberRegistred)];
      result.phoneNumberRejected = [...new Set(result.phoneNumberRejected)];
      result.totalPhoneNumber = [...new Set(result.totalPhoneNumber)];
      
      const totalProcessed = result.phoneNumberRegistred.length + result.phoneNumberRejected.length;
      if (totalProcessed !== result.totalPhoneNumber.length) {
        console.warn(`Result count mismatch: registered (${result.phoneNumberRegistred.length}) + rejected (${result.phoneNumberRejected.length}) != total (${result.totalPhoneNumber.length})`);
      }
      
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
      
      this.emitAccountsStatus(validAccounts, io);
      
      setTimeout(() => {
        this.emitAccountsStatus(validAccounts, io);
      }, 60000);
    }
    return result;
  } catch (error:any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('SaveUsers operation failed:', error);
    
    const processedCount = processedPhoneNumbers.size;
    const totalCount = usersArray.length;
    const successRate = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;
    
    let floodedAccounts = Array.from(this.accounts.values()).filter(acc => this.isAccountInFloodWait(acc.id));
    
    io.emit("operation-failed", {
      operation: "saveUsers",
      error: errorMessage,
      timestamp: new Date().toISOString(),
      progress: {
        processed: processedCount,
        total: totalCount,
        successRate: successRate
      },
      floodedAccounts: floodedAccounts.map(acc => ({
        id: acc.id,
        phoneNumber: acc.phoneNumber,
        waitTimeSeconds: this.getFloodWaitTimeRemaining(acc.id),
        formattedWaitTime: this.formatETA(this.getFloodWaitTimeRemaining(acc.id))
      }))
    });
    
    result.phoneNumberRegistred = [...new Set(result.phoneNumberRegistred)];
    result.phoneNumberRejected = [...new Set(result.phoneNumberRejected)];
    result.totalPhoneNumber = [...new Set(result.totalPhoneNumber)];
    
    if (validAccounts && result.totalPhoneNumber.length > 0) {
      this.emitAccountsStatus(validAccounts, io);
      setTimeout(() => {
        this.emitAccountsStatus(validAccounts, io);
      }, 60000);
    }
    
    return result;
  } finally {
    this.activeOperations.delete(operationId);
    this.currentOperationId = null;
  }
}
  static async importMembersToGroup(req: Request, io: Server): Promise<any> {
    const { accountId, groupId, members, config } = req.body;
    const delayBetweenBatches = config?.delayBetweenBatches || 2000;
    const batchSize = config?.batchSize || 10; // Optimized batch size for channels
    
    if (!accountId || !groupId || !members || !Array.isArray(members)) {
      throw new Error("Missing required parameters: accountId, groupId, members (array)");
    }
    const account = await this.getAccountById(accountId);
    if (!account || !account.mtproto || !account.connected) {
      throw new Error("Account not connected");
    }
    const mtproto = account.mtproto;
    // Get Group Info
    const groups = await this.getGroups({ body: { accountId } } as Request);
    const group = groups.find(g => g.id === groupId);
    
    if (!group) throw new Error("Group not found");
    
    const operationId = Math.random().toString(36).substring(2, 15);
    this.currentOperationId = operationId;
    const abortController = new AbortController();
    this.activeOperations.set(operationId, abortController);
    let cancellationEmitted = false;
    
    io.emit("import-progress", {
        accountId,
        groupId,
        total: members.length,
        processed: 0,
        added: 0,
        failed: 0,
        status: 'starting',
        operationId
    });
    
    const result: { added: string[], failed: any[] } = { added: [], failed: [] };
    let processed = 0;
    
    try {
      if (group.type === 'channel') {
        // Batch import for channels
        let batchUsers: any[] = [];
        let batchTargets: string[] = [];
        
        for (const member of members) {
          if (abortController.signal.aborted && !cancellationEmitted) {
            io.emit("import-progress", {
                accountId,
                groupId,
                status: 'cancelled',
                message: "Import cancelled by user",
                processed,
                total: members.length
            });
            cancellationEmitted = true;
            break;
          }
          if (cancellationEmitted) break;
          
          try {
            let target = member.trim();
            if (target.includes(',')) {
              const parts = target.split(',').map(p => p.trim());
              target = parts.find(p => p.startsWith('@') || p.startsWith('+') || /^\d+$/.test(p)) || parts[0];
            }
            target = target.replace(/^"|"$/g, '');
            
            const isPhone = target.startsWith('+') || /^\d+$/.test(target);
            let user;
            
            if (isPhone) {
              const cleanPhone = target.replace(/\D/g, '');
              const resolveResult = await this.callWithDcMigration(mtproto, 'contacts.resolvePhone', {
                phone: cleanPhone
              }, 0, account.id, io);
              
              if (!resolveResult.users || resolveResult.users.length === 0) {
                throw new Error("User not found");
              }
              user = resolveResult.users[0];
            } else {
              let username = target;
              if (username.startsWith('@')) username = username.substring(1);
              
              const resolveResult = await this.callWithDcMigration(mtproto, 'contacts.resolveUsername', {
                username
              }, 0, account.id, io);
              
              if (!resolveResult.users || resolveResult.users.length === 0) {
                throw new Error("User not found");
              }
              user = resolveResult.users[0];
            }
            
            const inputUser = {
              _: 'inputUser',
              user_id: user.id,
              access_hash: user.access_hash
            };
            
            batchUsers.push(inputUser);
            batchTargets.push(target);
            
            if (batchUsers.length === batchSize || processed + batchUsers.length === members.length) {
              try {
                await this.callWithDcMigration(mtproto, 'channels.inviteToChannel', {
                  channel: {
                    _: 'inputChannel',
                    channel_id: group.id,
                    access_hash: group.access_hash
                  },
                  users: batchUsers
                }, 0, account.id, io);
                
                result.added.push(...batchTargets);
              } catch (batchErr: any) {
                // If batch fails, add all to failed
                batchTargets.forEach(t => result.failed.push({ member: t, error: batchErr.message }));
              }
              
              processed += batchUsers.length;
              
              io.emit("import-progress", {
                accountId,
                groupId,
                total: members.length,
                processed,
                added: result.added.length,
                failed: result.failed.length,
                status: 'processing'
              });
              
              batchUsers = [];
              batchTargets = [];
              
              await new Promise(r => setTimeout(r, delayBetweenBatches));
            }
          } catch (err: any) {
            result.failed.push({ member, error: err.message });
            processed++;
            
            io.emit("import-progress", {
              accountId,
              groupId,
              total: members.length,
              processed,
              added: result.added.length,
              failed: result.failed.length,
              status: 'processing'
            });
            
            await new Promise(r => setTimeout(r, delayBetweenBatches));
          }
        }
      } else {
        // One by one for basic chats
        for (const member of members) {
          if (abortController.signal.aborted && !cancellationEmitted) {
            io.emit("import-progress", {
                accountId,
                groupId,
                status: 'cancelled',
                message: "Import cancelled by user",
                processed,
                total: members.length
            });
            cancellationEmitted = true;
            break;
          }
          if (cancellationEmitted) break;
          
          try {
            let target = member.trim();
            if (target.includes(',')) {
              const parts = target.split(',').map(p => p.trim());
              target = parts.find(p => p.startsWith('@') || p.startsWith('+') || /^\d+$/.test(p)) || parts[0];
            }
            target = target.replace(/^"|"$/g, '');
            
            const isPhone = target.startsWith('+') || /^\d+$/.test(target);
            let user;
            
            if (isPhone) {
              const cleanPhone = target.replace(/\D/g, '');
              const resolveResult = await this.callWithDcMigration(mtproto, 'contacts.resolvePhone', {
                phone: cleanPhone
              }, 0, account.id, io);
              
              if (!resolveResult.users || resolveResult.users.length === 0) {
                throw new Error("User not found");
              }
              user = resolveResult.users[0];
            } else {
              let username = target;
              if (username.startsWith('@')) username = username.substring(1);
              
              const resolveResult = await this.callWithDcMigration(mtproto, 'contacts.resolveUsername', {
                username
              }, 0, account.id, io);
              
              if (!resolveResult.users || resolveResult.users.length === 0) {
                throw new Error("User not found");
              }
              user = resolveResult.users[0];
            }
            
            const inputUser = {
              _: 'inputUser',
              user_id: user.id,
              access_hash: user.access_hash
            };
            
            await this.callWithDcMigration(mtproto, 'messages.addChatUser', {
              chat_id: group.id,
              user_id: inputUser,
              fwd_limit: 100
            }, 0, account.id, io);
            
            result.added.push(target);
          } catch (err: any) {
            const errorMessage = err.message || "Unknown error";
            result.failed.push({ member, error: errorMessage });
            
            if (errorMessage.includes('FLOOD_WAIT') || errorMessage.includes('PEER_FLOOD')) {
              const seconds = parseInt(errorMessage.match(/\d+/)?.[0] || "60");
              io.emit("import-progress", {
                accountId,
                groupId,
                status: 'paused',
                message: `Flood wait: ${seconds}s`,
                processed,
                total: members.length
              });
              
              const waitStart = Date.now();
              while (Date.now() - waitStart < seconds * 1000) {
                if (abortController.signal.aborted) break;
                await new Promise(r => setTimeout(r, 1000));
              }
              
              if (abortController.signal.aborted) continue;
            }
          }
          
          processed++;
          
          io.emit("import-progress", {
            accountId,
            groupId,
            total: members.length,
            processed,
            added: result.added.length,
            failed: result.failed.length,
            status: 'processing'
          });
          
          await new Promise(r => setTimeout(r, delayBetweenBatches));
        }
      }
    } catch (err: any) {
      io.emit("import-progress", {
        accountId,
        groupId,
        status: 'error',
        message: err.message,
        processed,
        total: members.length
      });
    } finally {
      this.activeOperations.delete(operationId);
      if (this.currentOperationId === operationId) {
        this.currentOperationId = null;
      }
      
      if (!cancellationEmitted) {
        io.emit("import-progress", {
          accountId,
          groupId,
          total: members.length,
          processed: members.length,
          added: result.added.length,
          failed: result.failed.length,
          status: 'completed'
        });
      }
    }
    
    return result;
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
            access_hash: chat.access_hash || 0,
            type: chat._,
            username: chat.username
          });
        }
      }
      return groups;
    } catch (error :any) {
      console.error(`Group fetch failed: ${error}`);
      throw error;
    }
  }
  static async exportJoinedLinks(req: Request, res: Response): Promise<void> {
    const { accountId } = req.body;
    if (!accountId) {
      res.status(400).json({ error: "Account ID required" });
      return;
    }
    const account = await this.getAccountById(accountId);
    if (!account || !account.mtproto || !account.connected) {
      res.status(400).json({ error: "Account not connected" });
      return;
    }
    const mtproto = account.mtproto;
    const groups = await this.getGroups(req);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="joined_links_${accountId}.txt"`);
    const written = new Set<string>();
    for (const g of groups) {
      try {
        if (g.username) {
          const link = `https://t.me/${g.username}`;
          if (!written.has(link)) {
            res.write(link + '\n');
            written.add(link);
          }
          continue;
        }
        if (g.type === 'chat') {
          try {
            const invite = await this.callWithDcMigration(mtproto, 'messages.exportChatInvite', {
              peer: { _: 'inputPeerChat', chat_id: parseInt(g.id) }
            }, 0, account.id, null as any);
            const link = invite?.link || invite?.invite?.link;
            if (link && !written.has(link)) {
              res.write(link + '\n');
              written.add(link);
            }
          } catch {}
        } else if (g.type === 'channel') {
          try {
            const invite = await this.callWithDcMigration(mtproto, 'channels.exportInvite', {
              channel: { _: 'inputChannel', channel_id: parseInt(g.id), access_hash: g.access_hash }
            }, 0, account.id, null as any);
            const link = invite?.link || invite?.invite?.link;
            if (link && !written.has(link)) {
              res.write(link + '\n');
              written.add(link);
            }
          } catch {}
        }
      } catch {}
    }
    res.end();
  }
 static async exportGroupMembers(req: Request, res: Response, io: Server): Promise<void> {
    const { accountId, groupId, filterType = 'recent', maxMembers = 0, format = 'csv' } = req.body;
    const operationId = `export-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    let totalMembers = 0;
    let lastEmitTime = 0;
    // Validate required parameters
    if (!accountId) {
        res.status(400).json({ error: "Account ID is required", code: "MISSING_ACCOUNT_ID" });
        return;
    }
   
    if (!groupId) {
        res.status(400).json({ error: "Group ID is required", code: "MISSING_GROUP_ID" });
        return;
    }
    // Emit initial event
    if (io) {
        io.emit('telegram-export-progress', {
            operationId,
            status: 'started',
            accountId,
            groupId,
            progress: 0,
            currentCount: 0,
            total: 'unknown',
            message: `Export started for group ${groupId}`
        });
    }
    // Get account and validate it's available
    const account = await this.getAccountById(accountId).catch(error => {
       
        if (io) {
            io.emit('telegram-export-progress', {
                operationId,
                status: 'error',
                accountId,
                groupId,
                error: `Failed to get account: ${error.message}`,
                code: 500,
                message: `Account retrieval failed`
            });
        }
       
        return null;
    });
   
    if (!account) {
        const errorMsg = `Account ${accountId} not found`;
        res.status(404).json({ error: errorMsg, code: "ACCOUNT_NOT_FOUND" });
       
        if (io) {
            io.emit('telegram-export-progress', {
                operationId,
                status: 'error',
                accountId,
                groupId,
                error: errorMsg,
                code: 404,
                message: errorMsg
            });
        }
        return;
    }
   
    if (!account.connected || !account.mtproto) {
        const errorMsg = `Account ${accountId} is not connected`;
        res.status(400).json({ error: errorMsg, code: "ACCOUNT_NOT_CONNECTED" });
       
        if (io) {
            io.emit('telegram-export-progress', {
                operationId,
                status: 'error',
                accountId,
                groupId,
                error: errorMsg,
                code: 400,
                message: errorMsg
            });
        }
        return;
    }
   
    // Set up response headers
    if (format === 'txt') {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="group_${groupId}_members_${filterType}.txt"`);
    } else {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="group_${groupId}_members_${filterType}.csv"`);
    }
    res.write(`# Operation ID: ${operationId}\n`);
   
    // Handle client disconnect
    req.on('close', () => {
       
        if (io) {
            io.emit('telegram-export-progress', {
                operationId,
                status: 'cancelled',
                accountId,
                groupId,
                message: 'Export cancelled by client',
                partialCount: totalMembers
            });
        }
    });
    try {
        const startTime = Date.now();
        const mtproto = account.mtproto;
       
        // Get the group information
        const groups = await this.getGroups({ body: { accountId } } as Request);
        const group = groups.find(g => g.id === groupId);
       
        if (!group) {
            const errorMsg = `Group ${groupId} not found`;
            throw new Error(errorMsg);
        }
       
        const access_hash = group.access_hash || 0;
       
        // Determine the filter type
        let participantFilter: any = { _: 'channelParticipantsRecent' };
        let useMultipleFilters = false;
       
        const memberCount = parseInt(group.memberCount.toString());
        if (memberCount > 10000) {
            useMultipleFilters = true;
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
        // Write CSV header
        res.write('Import Key,Phone,Username,User ID,First Name,Last Name\n');
        res.write('# Export started, retrieving members...\n');
       
        const batchSize = 200;
        let hasMoreMembers = true;
        let emptyResultCount = 0;
        const maxRetries = 5;
       
        const memberLimit = maxMembers > 0 ? maxMembers : Number.MAX_SAFE_INTEGER;
       
        const estimatedMemberCount = group.memberCount || 'unknown';
       
        const processedUserIds = new Set<string>();
       
        let filterStrategies;
       
        if (useMultipleFilters) {
            if (memberCount > 25000) {
                filterStrategies = [
                    { name: 'recent', filter: { _: 'channelParticipantsRecent' } },
                    { name: 'search_a', filter: { _: 'channelParticipantsSearch', q: 'a' } },
                    { name: 'search_e', filter: { _: 'channelParticipantsSearch', q: 'e' } },
                    { name: 'search_i', filter: { _: 'channelParticipantsSearch', q: 'i' } },
                    { name: 'search_o', filter: { _: 'channelParticipantsSearch', q: 'o' } },
                    { name: 'search_u', filter: { _: 'channelParticipantsSearch', q: 'u' } },
                    { name: 'search_s', filter: { _: 'channelParticipantsSearch', q: 's' } },
                    { name: 'search_t', filter: { _: 'channelParticipantsSearch', q: 't' } },
                    { name: 'search_r', filter: { _: 'channelParticipantsSearch', q: 'r' } },
                    { name: 'search_n', filter: { _: 'channelParticipantsSearch', q: 'n' } },
                    { name: 'search_empty', filter: { _: 'channelParticipantsSearch', q: '' } },
                    { name: 'contacts', filter: { _: 'channelParticipantsContacts' } },
                    { name: 'admins', filter: { _: 'channelParticipantsAdmins' } }
                ];
            } else {
                filterStrategies = [
                    { name: 'recent', filter: { _: 'channelParticipantsRecent' } },
                    { name: 'search', filter: { _: 'channelParticipantsSearch', q: '' } },
                    { name: 'contacts', filter: { _: 'channelParticipantsContacts' } }
                ];
            }
        } else {
            filterStrategies = [{ name: filterType, filter: participantFilter }];
        }
       
        let consecutiveEmptyBatches = 0;
        const maxConsecutiveEmptyBatches = 5;
       
        if (group.type === 'chat') {
            // Handle basic chats
            const fullChatResult = await this.callWithDcMigration(mtproto, 'messages.getFullChat', {
                chat_id: parseInt(groupId)
            });
            
            const fullChat = fullChatResult.fullChat;
            const users = fullChatResult.users;
            
            const newMembers: GroupMember[] = fullChat.participants.participants
                .map((p: any) => {
                    const user = users.find((u: any) => u.id === p.user_id);
                    if (!user || user.bot) return null;
                    if (processedUserIds.has(user.id.toString())) return null;
                    processedUserIds.add(user.id.toString());
                    return {
                        id: user.id.toString(),
                        firstName: user.first_name,
                        lastName: user.last_name,
                        username: user.username,
                        phone: user.phone || '',
                        isBot: false
                    };
                })
                .filter(Boolean);
            
            let batchContent = '';
            if (format === 'csv') {
                batchContent = newMembers.map(m => {
                    const importKey = m.phone || (m.username ? `@${m.username}` : m.id);
                    return `${importKey},${m.phone || ''},${m.username || ''},${m.id},"${m.firstName?.replace(/"/g, '""') || ''}","${m.lastName?.replace(/"/g, '""') || ''}"`;
                }).join('\n');
            } else {
                batchContent = newMembers.map(m => m.phone || (m.username ? `@${m.username}` : m.id)).join('\n');
            }
            
            res.write(batchContent + '\n');
            totalMembers = newMembers.length;
        } else {
            // Handle channels
            for (const strategy of filterStrategies) {
                if (io) {
                    io.emit('telegram-export-progress', {
                        operationId,
                        status: 'progress',
                        accountId,
                        groupId,
                        message: `Using strategy: ${strategy.name}`,
                        currentStrategy: strategy.name
                    });
                }
                if (!hasMoreMembers) break;
                
                let strategyOffset = 0;
                let strategyHasMore = true;
                let strategyEmptyCount = 0;
                
                while (strategyHasMore && hasMoreMembers) {
                    let participants;
                    let retryCount = 0;
                    let success = false;
                    
                    while (retryCount < maxRetries && !success) {
                        try {
                            participants = await this.callWithDcMigration(mtproto, 'channels.getParticipants', {
                                channel: {
                                    _: 'inputChannel',
                                    channel_id: parseInt(groupId),
                                    access_hash
                                },
                                filter: strategy.filter,
                                offset: strategyOffset,
                                limit: batchSize,
                                hash: 0
                            });
                            success = true;
                        } catch (error: any) {
                            retryCount++;
                            
                            if (error.message?.includes('FLOOD_WAIT')) {
                                const waitSeconds = parseInt(error.message.match(/\d+/)?.[0] || '5', 10);
                                const waitTime = Math.min(waitSeconds * 1000, 30000);
                                
                                if (io) {
                                    io.emit('telegram-export-progress', {
                                        operationId,
                                        status: 'warning',
                                        accountId,
                                        groupId,
                                        message: `Rate limited: Waiting ${waitSeconds} seconds`,
                                        waitTime: waitSeconds
                                    });
                                }
                                
                                await new Promise(resolve => setTimeout(resolve, waitTime));
                            } else if (retryCount >= maxRetries) {
                                strategyHasMore = false;
                                break;
                            } else {
                                const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
                                await new Promise(resolve => setTimeout(resolve, backoffTime));
                            }
                        }
                    }
                    
                    if (!success) continue;
                    
                    if (!participants || !participants.users || participants.users.length === 0) {
                        strategyEmptyCount++;
                        consecutiveEmptyBatches++;
                        
                        if (strategyEmptyCount >= 3) {
                            strategyHasMore = false;
                            continue;
                        }
                        
                        if (consecutiveEmptyBatches >= maxConsecutiveEmptyBatches) {
                            hasMoreMembers = false;
                            break;
                        }
                        
                        strategyOffset += batchSize;
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        continue;
                    }
                    
                    strategyEmptyCount = 0;
                    consecutiveEmptyBatches = 0;
                    
                    const newMembers: GroupMember[] = [];
                    
                    for (const user of participants.users) {
                        if (user.bot) continue;
                        if (processedUserIds.has(user.id.toString())) continue;
                        processedUserIds.add(user.id.toString());
                        newMembers.push({
                            id: user.id.toString(),
                            firstName: user.first_name,
                            lastName: user.last_name,
                            username: user.username,
                            phone: user.phone || '',
                            isBot: false
                        });
                    }
                    
                    if (newMembers.length === 0) {
                        strategyEmptyCount++;
                        if (strategyEmptyCount >= 3) {
                            strategyHasMore = false;
                            continue;
                        }
                    }
                    
                    if (newMembers.length > 0) {
                        let batchContent = '';
                        if (format === 'csv') {
                            batchContent = newMembers.map(m => {
                                const importKey = m.phone || (m.username ? `@${m.username}` : m.id);
                                return `${importKey},${m.phone || ''},${m.username || ''},${m.id},"${m.firstName?.replace(/"/g, '""') || ''}","${m.lastName?.replace(/"/g, '""') || ''}"`;
                            }).join('\n');
                        } else {
                            batchContent = newMembers.map(m => m.phone || (m.username ? `@${m.username}` : m.id)).join('\n');
                        }
                        
                        res.write(batchContent + '\n');
                        
                        totalMembers += newMembers.length;
                        
                        if (totalMembers >= memberLimit) {
                            hasMoreMembers = false;
                            break;
                        }
                        
                        if (estimatedMemberCount !== 'unknown' && totalMembers >= Number(estimatedMemberCount) * 0.98) {
                            hasMoreMembers = false;
                            break;
                        }
                        
                        const now = Date.now();
                        if (now - lastEmitTime > 1000) {
                            let progressValue = estimatedMemberCount !== 'unknown' ? Math.min(100, Math.round((totalMembers / Number(estimatedMemberCount)) * 100)) : 0;
                            io.emit('telegram-export-progress', {
                                operationId,
                                status: 'progress',
                                accountId,
                                groupId,
                                progress: progressValue,
                                currentCount: totalMembers,
                                total: estimatedMemberCount,
                                batchSize: newMembers.length,
                                message: `Added ${newMembers.length} new members`,
                                currentStrategy: strategy.name
                            });
                            lastEmitTime = now;
                        }
                    }
                    
                    strategyOffset += batchSize;
                    
                    const delayMs = Math.min(500 + (participants.users.length / 10), 2000);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    
                    if (strategyOffset % (batchSize * 10) === 0) {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                }
            }
        }
        
        let coveragePercentage = estimatedMemberCount !== 'unknown' ? Math.round((totalMembers / Number(estimatedMemberCount)) * 100) : 100;
        
        res.write(`# Export completed: ${totalMembers} members exported from group ${groupId}\n`);
        if (maxMembers > 0 && totalMembers >= maxMembers) {
            res.write(`# Note: Export stopped after reaching specified limit of ${maxMembers} members\n`);
        }
        res.write(`# Coverage: ${coveragePercentage}% of estimated ${estimatedMemberCount} members\n`);
        res.write(`# Unique members found: ${processedUserIds.size}\n`);
        res.write(`# Duration: ${((Date.now() - startTime) / 1000).toFixed(2)} seconds\n`);
        res.end();
        
        if (io) {
            io.emit('telegram-export-progress', {
                operationId,
                status: 'completed',
                accountId,
                groupId,
                progress: 100,
                currentCount: totalMembers,
                total: estimatedMemberCount,
                uniqueMembers: processedUserIds.size,
                duration: (Date.now() - startTime) / 1000,
                message: `Export completed: ${totalMembers} members`
            });
        }
    } catch (error: any) {
        let errorMessage = "Export failed";
        let statusCode = 500;
        
        if (error.message?.includes('FLOOD_WAIT')) {
            const waitTime = error.message.match(/\d+/)?.[0] || 'unknown';
            errorMessage = `Rate limited by Telegram. Please try again after ${waitTime} seconds.`;
            statusCode = 429;
        } else if (error.message?.includes('CHANNEL_INVALID')) {
            errorMessage = "Invalid channel or you don't have access to this group.";
            statusCode = 403;
        } // add more
        
        if (io) {
            io.emit('telegram-export-progress', {
                operationId,
                status: 'error',
                accountId,
                groupId,
                error: errorMessage,
                code: statusCode,
                message: `Export failed: ${errorMessage}`,
                partialCount: totalMembers
            });
        }
        
        if (res.headersSent) {
            res.write(`\n# ERROR: ${errorMessage}\n`);
            res.write(`# ERROR_CODE: ${statusCode}\n`);
            res.write(`# MEMBERS_EXPORTED_BEFORE_ERROR: ${totalMembers}\n`);
            res.end();
        } else {
            res.status(statusCode).json({ error: errorMessage });
        }
    }
}
  static async processCSVFile(file: { buffer: Buffer }): Promise<string[]> {
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
            const phoneNumber = Object.values(row)[0]?.toString().trim();
           
            if (phoneNumber) {
              const cleanedNumber = phoneNumber.replace(/\D/g, '');
             
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
    } catch (error :any) {
      console.error('Error processing CSV file:', error);
      throw new Error(`Failed to process CSV file: ${error && typeof error === 'object' ? error.message : 'Unknown error'}`);
    }
  }
  static async joinBulkGroups(req: Request, io: Server): Promise<any> {
    const { accountId, groups, config } = req.body;
    
    if (!accountId || !groups || !Array.isArray(groups)) {
        throw new Error("Account ID and groups array are required");
    }

    const account = await this.getAccountById(accountId);
    if (!account || !account.mtproto || !account.connected) {
        throw new Error("Account not connected");
    }

    const mtproto = account.mtproto;
    const result: { joined: string[], failed: { group: string, error: string }[] } = { joined: [], failed: [] };
    const campaignId = `join-${Date.now()}`;

    io.emit("join-start", { 
        campaignId, 
        total: groups.length,
        message: "Starting bulk join..."
    });

    for (let i = 0; i < groups.length; i++) {
        const groupLink = groups[i].trim();
        if (!groupLink) continue;

        try {
            // Determine if it's a public username or private invite link
            let inputPeer;
            let isInvite = false;
            let cleanLink = groupLink.replace('https://t.me/', '').replace('t.me/', '').replace('@', '');
            
            if (cleanLink.startsWith('+') || groupLink.includes('joinchat')) {
                // Private invite link
                isInvite = true;
                cleanLink = cleanLink.replace('+', '').replace('joinchat/', '');
            }

            if (isInvite) {
                 await this.callWithDcMigration(mtproto, 'messages.importChatInvite', {
                    hash: cleanLink
                }, 0, account.id, io);
            } else {
                 await this.callWithDcMigration(mtproto, 'channels.joinChannel', {
                    channel: {
                        _: 'inputChannel',
                        channel_id: cleanLink, // This usually requires resolving first if it's a username, let's use contacts.resolveUsername
                        access_hash: 0 // Placeholder
                    }
                }, 0, account.id, io).catch(async () => {
                     // Fallback: Resolve username first
                     const resolved = await this.callWithDcMigration(mtproto, 'contacts.resolveUsername', {
                        username: cleanLink
                     }, 0, account.id, io);
                     
                     if (resolved && resolved.chats && resolved.chats.length > 0) {
                         const chat = resolved.chats[0];
                         return await this.callWithDcMigration(mtproto, 'channels.joinChannel', {
                             channel: {
                                 _: 'inputChannel',
                                 channel_id: chat.id,
                                 access_hash: chat.access_hash
                             }
                         }, 0, account.id, io);
                     } else {
                         throw new Error("Could not resolve username");
                     }
                });
            }

            result.joined.push(groupLink);
            
            io.emit("join-progress", {
                campaignId,
                total: groups.length,
                processed: i + 1,
                joined: result.joined.length,
                failed: result.failed.length,
                lastAction: { type: 'success', group: groupLink }
            });

        } catch (e: any) {
            const errorMessage = e.message || "Unknown error";
            result.failed.push({ group: groupLink, error: errorMessage });
            
            io.emit("join-progress", {
                campaignId,
                total: groups.length,
                processed: i + 1,
                joined: result.joined.length,
                failed: result.failed.length,
                lastAction: { type: 'error', group: groupLink, error: errorMessage }
            });

            // Anti-Ban Logic
            if (errorMessage.includes('FLOOD_WAIT')) {
                const floodMatch = errorMessage.match(/FLOOD_WAIT_(\d+)/);
                if (floodMatch) {
                    const seconds = parseInt(floodMatch[1], 10);
                    const waitTime = (seconds + 5) * 1000;
                    
                    io.emit("join-log", { 
                        type: "warning", 
                        message: `Flood wait detected. Pausing for ${seconds + 5} seconds...`, 
                        campaignId 
                    });
                    
                    await new Promise(r => setTimeout(r, waitTime));
                    i--; // Retry
                    continue;
                }
            } else if (errorMessage.includes('PEER_FLOOD') || errorMessage.includes('CHANNELS_TOO_MUCH')) {
                 const waitTime = 5 * 60 * 1000; // 5 minutes
                 io.emit("join-log", { 
                      type: "warning", 
                      message: `Limit reached (${errorMessage}). Pausing for 5 minutes...`, 
                      campaignId 
                 });
                 await new Promise(r => setTimeout(r, waitTime));
                 // For CHANNELS_TOO_MUCH we might want to skip retry or stop, but for now retry
                 if (errorMessage.includes('CHANNELS_TOO_MUCH')) {
                     // Actually if channels too much, retry won't help unless we leave some. 
                     // But maybe it's a temp limit? Usually it means max 500 channels.
                     // Let's just log and continue to next
                     io.emit("join-log", { type: "error", message: "Account reached max channel limit.", campaignId });
                 } else {
                     i--; 
                     continue;
                 }
            }
        }

        // Delay
        const delay = config?.delayBetweenJoins || 10000; // Default 10s for joins
        const randomDelay = config?.randomDelay ? Math.floor(Math.random() * 2000) : 0;
        await new Promise(r => setTimeout(r, delay + randomDelay));
    }

    io.emit("join-complete", { result, campaignId });
    return result;
  }

  static async sendBulkMessages(req: Request, io: Server): Promise<MessageResult> {
    return this.sendMessages(req, io);
  }
  static async sendBulkMessagesToGroups(req: Request, io: Server): Promise<any> {
      const { accountId, groups, message, config } = req.body;
      const file = (req as any).file;
     
      if (!accountId || !groups) {
          throw new Error("Account ID and groups are required");
      }
     
      const account = await this.getAccountById(accountId);
      if (!account || !account.mtproto || !account.connected) {
          throw new Error("Account not connected");
      }

      const groupList = typeof groups === 'string' ? JSON.parse(groups) : groups;
      
      let parsedConfig = config;
      if (typeof config === 'string') {
          try {
              parsedConfig = JSON.parse(config);
          } catch (e) {
              console.error("Failed to parse config:", e);
              parsedConfig = {}; 
          }
      }

      const campaignId = `campaign-${Date.now()}`;

      // Handle Recurrence
      if (parsedConfig.repeatEvery && Number(parsedConfig.repeatEvery) > 0) {
          const repeatHours = Number(parsedConfig.repeatEvery);
          const jobName = `recurring-${campaignId}`;
          
          // Schedule future runs (every X hours)
          schedule.scheduleJob(jobName, `0 0 */${repeatHours} * * *`, async () => {
              console.log(`Running recurring campaign ${jobName}`);
              try {
                  await TelegramController.executeGroupCampaign(account, groupList, message, file, parsedConfig, io, jobName);
              } catch (error) {
                  console.error(`Recurring campaign ${jobName} failed:`, error);
              }
          });
          
          io.emit("campaign-scheduled", {
              jobName,
              repeatEvery: repeatHours,
              message: `Campaign scheduled to repeat every ${repeatHours} hours`
          });
      }

      // Execute immediately
      return await this.executeGroupCampaign(account, groupList, message, file, parsedConfig, io, campaignId);
  }

  private static async executeGroupCampaign(account: TelegramAccount, groupList: any[], message: string, file: any, config: any, io: Server, campaignId?: string): Promise<any> {
      const mtproto = account.mtproto;
      const result: { sent: string[], failed: { id: string, error: string }[] } = { sent: [], failed: [] };
      
      io.emit("campaign-start", { 
          campaignId, 
          total: groupList.length,
          message: "Starting campaign..."
      });
     
      let inputMedia: any = null;
      if (file) {
          try {
              const uploadedFile = await this.uploadFile(mtproto, file, account.id, io);
              inputMedia = {
                  _: 'inputMediaUploadedPhoto',
                  file: uploadedFile,
                  ttl_seconds: 0
              };
          } catch (e: any) {
              console.error("Failed to upload file:", e);
              io.emit("campaign-log", { type: "error", message: `Failed to upload file: ${e.message}`, campaignId });
              // Continue without file? Or abort? 
              // Probably abort if file was intended
              if (!message) throw new Error("Failed to upload file and no text message provided");
          }
      }
     
      for (let i = 0; i < groupList.length; i++) {
          const group = groupList[i];
          // Check for cancellation (if we implement abort controller later)
          
          try {
              const peer = {
                  _: 'inputPeerChannel',
                  channel_id: group.id,
                  access_hash: group.access_hash
              };
             
              if (inputMedia) {
                   await this.callWithDcMigration(mtproto, 'messages.sendMedia', {
                      peer: peer,
                      media: inputMedia,
                      message: message || '',
                      random_id: Math.floor(Math.random() * 1000000000)
                  }, 0, account.id, io);
              } else {
                  await this.callWithDcMigration(mtproto, 'messages.sendMessage', {
                      peer: peer,
                      message: message,
                      random_id: Math.floor(Math.random() * 1000000000)
                  }, 0, account.id, io);
              }
             
              (result.sent as any[]).push(group.id);
              
              // Real-time update
              io.emit("campaign-progress", {
                  campaignId,
                  total: groupList.length,
                  processed: i + 1,
                  sent: result.sent.length,
                  failed: result.failed.length,
                  lastAction: { type: 'success', groupName: group.name || group.title || group.id }
              });
              
          } catch (e: any) {
              const errorMessage = e.message || "Unknown error";
              (result.failed as { id: any; error: string }[]).push({ id: group.id, error: errorMessage });
              
              io.emit("campaign-progress", {
                  campaignId,
                  total: groupList.length,
                  processed: i + 1,
                  sent: result.sent.length,
                  failed: result.failed.length,
                  lastAction: { type: 'error', groupName: group.name || group.title || group.id, error: errorMessage }
              });

              if (errorMessage.includes('FLOOD_WAIT')) {
                  const floodMatch = errorMessage.match(/FLOOD_WAIT_(\d+)/);
                  if (floodMatch) {
                      const seconds = parseInt(floodMatch[1], 10);
                      const waitTime = (seconds + 5) * 1000;
                      
                      io.emit("campaign-log", { 
                          type: "warning", 
                          message: `Flood wait detected. Pausing for ${seconds + 5} seconds to prevent ban...`, 
                          campaignId 
                      });
                      
                      // Wait out the flood limit
                      await new Promise(r => setTimeout(r, waitTime));
                      
                      // Retry this group
                      i--; 
                      continue;
                  }
                  io.emit("campaign-log", { type: "warning", message: `Rate limited on group ${group.name}: ${errorMessage}`, campaignId });
              } else if (errorMessage.includes('PEER_FLOOD')) {
                  const waitTime = 5 * 60 * 1000; // 5 minutes
                  io.emit("campaign-log", { 
                      type: "warning", 
                      message: `Peer Flood (Spam Limit) detected. Pausing for 5 minutes to restore account health...`, 
                      campaignId 
                  });
                  await new Promise(r => setTimeout(r, waitTime));
                  i--; // Retry this group
                  continue;
              }
          }
         
          // Delay
          const delay = config?.delayBetweenMessages !== undefined ? Number(config.delayBetweenMessages) : 2000;
          const randomDelay = config?.randomDelay ? Math.floor(Math.random() * 1000) : 0;
          await new Promise(r => setTimeout(r, delay + randomDelay));
      }
     
      io.emit("campaign-complete", { result, campaignId });
      return result;
  }
  private static async uploadFile(mtproto: any, file: any, accountId: string, io: Server): Promise<any> {
    const CHUNK_SIZE = 512 * 1024; // 512KB
    const totalParts = Math.ceil(file.size / CHUNK_SIZE);
    const fileId = BigInt(Date.now()) + BigInt(Math.floor(Math.random() * 1000000));
   
    for (let i = 0; i < totalParts; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const part = file.buffer.slice(start, end);
       
        await this.callWithDcMigration(mtproto, 'upload.saveFilePart', {
            file_id: fileId.toString(),
            file_part: i,
            bytes: part
        }, 0, accountId, io);
    }
   
    return {
        _: 'inputFile',
        id: fileId.toString(),
        parts: totalParts,
        name: file.originalname,
        md5_checksum: ''
    };
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
          } catch (error :any) {
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
    } catch (error :any) {
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
  // Track flood wait status for each account
  private static floodWaitStatus: Map<string, { until: Date, waitSeconds: number }> = new Map();
 
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
    }
  }
 
  // Start a countdown for flood wait
  private static startFloodWaitCountdown(accountId: string, io: Server): void {
    const UPDATE_INTERVAL = 1000; // Update every second
   
    const intervalId = setInterval(() => {
      const remainingSeconds = this.getFloodWaitTimeRemaining(accountId);
     
      if (remainingSeconds <= 0) {
        clearInterval(intervalId);
        this.floodWaitStatus.delete(accountId);
       
        io.emit("account-flood-wait-complete", {
          accountId,
          message: `Account ${accountId} is no longer rate limited and can be used again.`
        });
        return;
      }
     
      io.emit("account-flood-wait-update", {
        accountId,
        remainingSeconds,
        formattedTime: this.formatETA(remainingSeconds)
      });
    }, UPDATE_INTERVAL);
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
