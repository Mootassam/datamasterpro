import { createAsyncThunk } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import * as TelegramServices from "./telegramServices";
import {
  setTelegramAccounts,
  setTelegramGroups,
  setPhoneNumbers,
  setRegisteredNumbers,
  setRejectedNumbers,
  setScheduledMessages,
  addScheduledMessage,
  updateScheduledMessage,
  removeScheduledMessage,
  setVerificationConfig,
  setVerificationInProgress,
  setMessagingInProgress,
  setCurrentOperation,
  setTelegramLoading,
  setTelegramError,
  resetTelegramError
} from "./telegramReducer";
import { Errors } from "../../modules/shared/errors";

// Account management actions
export const fetchTelegramAccounts = createAsyncThunk(
  "telegram/fetchAccounts",
  async (_, { dispatch }) => {
    try {
      dispatch(setTelegramLoading(true));
      const accounts = await TelegramServices.getTelegramAccounts();
      dispatch(setTelegramAccounts(accounts));
      return accounts;
    } catch (error :any) {
      Errors.handle(error);
      dispatch(setTelegramError(error.message || "Failed to fetch Telegram accounts"));
      throw error;
    } finally {
      dispatch(setTelegramLoading(false));
    }
  }
);

export const loginTelegram = createAsyncThunk(
  "telegram/login",
  async (phoneNumber: string, { dispatch }) => {
    try {
      dispatch(setTelegramLoading(true));
      const result = await TelegramServices.telegramLogin(phoneNumber);
      return result;
    } catch (error :any) {
      Errors.handle(error);
      dispatch(setTelegramError(error.message || "Failed to login to Telegram"));
      throw error;
    } finally {
      dispatch(setTelegramLoading(false));
    }
  }
);

export const confirmTelegramOTP = createAsyncThunk(
  "telegram/confirmOTP",
  async (
    { accountId, phoneCode, phoneCodeHash }: { accountId: string; phoneCode: string; phoneCodeHash: string },
    { dispatch }
  ) => {
    try {
      dispatch(setTelegramLoading(true));
      const result = await TelegramServices.confirmOTP(accountId, phoneCode, phoneCodeHash);
      await dispatch(fetchTelegramAccounts());
      return result;
    } catch (error :any) {
      Errors.handle(error);
      dispatch(setTelegramError(error.message || "Failed to confirm OTP"));
      throw error;
    } finally {
      dispatch(setTelegramLoading(false));
    }
  }
);

export const confirmTelegram2FA = createAsyncThunk(
  "telegram/confirm2FA",
  async (
    { accountId, password }: { accountId: string; password: string },
    { dispatch }
  ) => {
    try {
      dispatch(setTelegramLoading(true));
      const result = await TelegramServices.confirm2FA(accountId, password);
      await dispatch(fetchTelegramAccounts());
      return result;
    } catch (error :any) {
      Errors.handle(error);
      dispatch(setTelegramError(error.message || "Failed to confirm 2FA"));
      throw error;
    } finally {
      dispatch(setTelegramLoading(false));
    }
  }
);

export const logoutTelegram = createAsyncThunk(
  "telegram/logout",
  async (accountId: string, { dispatch }) => {
    try {
      dispatch(setTelegramLoading(true));
      await TelegramServices.telegramLogout(accountId);
      await dispatch(fetchTelegramAccounts());
      return true;
    } catch (error :any) {
      Errors.handle(error);
      dispatch(setTelegramError(error.message || "Failed to logout from Telegram"));
      throw error;
    } finally {
      dispatch(setTelegramLoading(false));
    }
  }
);

export const logoutAllTelegram = createAsyncThunk(
  "telegram/logoutAll",
  async (_, { dispatch }) => {
    try {
      dispatch(setTelegramLoading(true));
      await TelegramServices.telegramLogoutAll();
      dispatch(setTelegramAccounts([]));
      return true;
    } catch (error :any) {
      Errors.handle(error);
      dispatch(setTelegramError(error.message || "Failed to logout from all Telegram accounts"));
      throw error;
    } finally {
      dispatch(setTelegramLoading(false));
    }
  }
);

// Phone number verification actions
export const verifyTelegramNumbers = createAsyncThunk(
  "telegram/verifyNumbers",
  async (
    { numbers, config }: { numbers: string[]; config: any },
    { dispatch }
  ) => {
    try {
      dispatch(setTelegramLoading(true));
      dispatch(setVerificationInProgress(true));
      dispatch(setCurrentOperation("Verifying phone numbers"));
      dispatch(setVerificationConfig(config));
      dispatch(setPhoneNumbers(numbers));
      
      const result = await TelegramServices.verifyPhoneNumbers(numbers, config);
      
      dispatch(setRegisteredNumbers(result.phoneNumberRegistred || []));
      dispatch(setRejectedNumbers(result.phoneNumberRejected || []));
      
      return result;
    } catch (error :any) {
      Errors.handle(error);
      dispatch(setTelegramError(error.message || "Failed to verify phone numbers"));
      throw error;
    } finally {
      dispatch(setTelegramLoading(false));
      dispatch(setVerificationInProgress(false));
      dispatch(setCurrentOperation(null));
    }
  }
);

// Group management actions
export const fetchTelegramGroups = createAsyncThunk(
  "telegram/fetchGroups",
  async (accountId: string, { dispatch }) => {
    try {
      dispatch(setTelegramLoading(true));
      const groups = await TelegramServices.getTelegramGroups(accountId);
      dispatch(setTelegramGroups(groups));
      return groups;
    } catch (error :any) {
      Errors.handle(error);
      dispatch(setTelegramError(error.message || "Failed to fetch Telegram groups"));
      throw error;
    } finally {
      dispatch(setTelegramLoading(false));
    }
  }
);

export const exportTelegramGroupMembers = createAsyncThunk(
  "telegram/exportGroupMembers",
  async (
    { accountId, groupId }: { accountId: string; groupId: string },
    { dispatch }
  ) => {
    try {
      dispatch(setTelegramLoading(true));
      const data = await TelegramServices.exportGroupMembers(accountId, groupId);
      TelegramServices.downloadCSV(data, `group_members_${groupId}.csv`);
      return true;
    } catch (error :any) {
      Errors.handle(error);
      dispatch(setTelegramError(error.message || "Failed to export group members"));
      throw error;
    } finally {
      dispatch(setTelegramLoading(false));
    }
  }
);

// File upload actions
export const uploadTelegramCSV = createAsyncThunk(
  "telegram/uploadCSV",
  async (file: File, { dispatch }) => {
    try {
      dispatch(setTelegramLoading(true));
      const result = await TelegramServices.uploadCSVFile(file);
      dispatch(setPhoneNumbers(result.phoneNumbers || []));
      return result;
    } catch (error :any) {
      Errors.handle(error);
      dispatch(setTelegramError(error.message || "Failed to upload CSV file"));
      throw error;
    } finally {
      dispatch(setTelegramLoading(false));
    }
  }
);

// Messaging actions
export const sendTelegramMessages = createAsyncThunk(
  "telegram/sendMessages",
  async (
    { 
      accountId, 
      phoneNumbers, 
      message, 
      config,
      scheduleTime = null 
    }: { 
      accountId: string; 
      phoneNumbers: string[]; 
      message: string; 
      config: any;
      scheduleTime?: Date | null;
    },
    { dispatch }
  ) => {
    try {
      dispatch(setTelegramLoading(true));
      
      // If scheduled for future
      if (scheduleTime && scheduleTime > new Date()) {
        const scheduledMessage = {
          id: uuidv4(),
          accountId,
          phoneNumbers,
          message,
          config,
          scheduledTime: scheduleTime,
          status: 'scheduled' as const
        };
        
        dispatch(addScheduledMessage(scheduledMessage));
        return scheduledMessage;
      }
      
      // Send immediately
      dispatch(setMessagingInProgress(true));
      dispatch(setCurrentOperation("Sending messages"));
      
      const result = await TelegramServices.sendTelegramMessages(
        accountId,
        phoneNumbers,
        message,
        config
      );
      
      return result;
    } catch (error :any) {
      Errors.handle(error);
      dispatch(setTelegramError(error.message || "Failed to send messages"));
      throw error;
    } finally {
      dispatch(setTelegramLoading(false));
      dispatch(setMessagingInProgress(false));
      dispatch(setCurrentOperation(null));
    }
  }
);

export const cancelTelegramMessage = createAsyncThunk(
  "telegram/cancelMessage",
  async (messageId: string, { dispatch, getState }) => {
    try {
      dispatch(setTelegramLoading(true));
      
      // For scheduled messages that haven't started yet
      const state = getState() as any;
      const message = state.telegram.scheduledMessages.find(msg => msg.id === messageId);
      
      if (message && message.status === 'scheduled') {
        dispatch(removeScheduledMessage(messageId));
        return true;
      }
      
      // For messages being processed by the server
      await TelegramServices.cancelScheduledMessage(messageId);
      dispatch(updateScheduledMessage({ 
        id: messageId, 
        updates: { status: 'cancelled' } 
      }));
      
      return true;
    } catch (error :any) {
      Errors.handle(error);
      dispatch(setTelegramError(error.message || "Failed to cancel message"));
      throw error;
    } finally {
      dispatch(setTelegramLoading(false));
    }
  }
);

export const fetchScheduledMessages = createAsyncThunk(
  "telegram/fetchScheduledMessages",
  async (_, { dispatch }) => {
    try {
      dispatch(setTelegramLoading(true));
      const messages = await TelegramServices.getScheduledMessages();
      dispatch(setScheduledMessages(messages));
      return messages;
    } catch (error :any) {
      Errors.handle(error);
      dispatch(setTelegramError(error.message || "Failed to fetch scheduled messages"));
      throw error;
    } finally {
      dispatch(setTelegramLoading(false));
    }
  }
);

// Operation management actions
export const cancelTelegramOperation = createAsyncThunk(
  "telegram/cancelOperation",
  async (_, { dispatch }) => {
    try {
      dispatch(setTelegramLoading(true));
      await TelegramServices.cancelCurrentOperation();
      dispatch(setVerificationInProgress(false));
      dispatch(setMessagingInProgress(false));
      dispatch(setCurrentOperation(null));
      return true;
    } catch (error :any) {
      Errors.handle(error);
      dispatch(setTelegramError(error.message || "Failed to cancel operation"));
      throw error;
    } finally {
      dispatch(setTelegramLoading(false));
    }
  }
);

// Error handling actions
export const clearTelegramError = () => (dispatch) => {
  dispatch(resetTelegramError());
};