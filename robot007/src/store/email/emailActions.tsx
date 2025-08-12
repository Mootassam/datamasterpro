import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getEmailAccounts,
  addEmailAccount,
  updateEmailAccount,
  deleteEmailAccount,
  sendTestEmail,
  getEmailSettings,
  updateEmailSettings,
  startEmailCampaign,
  cancelEmailCampaign
} from "./emailService";
import { 
  setEmailAccounts, 
  setEmailSettings,
  setEmailLoading,
  setEmailError,
  setCampaignStatus
} from "./emailReducer";
import Errors from "../../modules/shared/error";

// ---------- Types ----------
type BasicResult = { success: boolean; error?: string };
type TestEmailAccountResult = { success: boolean; message?: string; error?: string };

// ---------- Email Account Actions ----------
export const fetchEmailAccounts = createAsyncThunk<BasicResult, void>(
  "email/fetchAccounts",
  async (_, thunkAPI) => {
    try {
      thunkAPI.dispatch(setEmailLoading(true));
      const accounts = await getEmailAccounts();
      thunkAPI.dispatch(setEmailAccounts(accounts));
      thunkAPI.dispatch(setEmailLoading(false));
      return { success: true };
    } catch (error: any) {
      thunkAPI.dispatch(setEmailLoading(false));
      thunkAPI.dispatch(setEmailError(error.message || "Failed to fetch email accounts"));
      Errors.handle(error);
      return { success: false, error: error.message };
    }
  }
);

export const createEmailAccount = createAsyncThunk<BasicResult, any>(
  "email/createAccount",
  async (accountData, thunkAPI) => {
    try {
      thunkAPI.dispatch(setEmailLoading(true));
      await addEmailAccount(accountData);
      const accounts = await getEmailAccounts();
      thunkAPI.dispatch(setEmailAccounts(accounts));
      thunkAPI.dispatch(setEmailLoading(false));
      return { success: true };
    } catch (error: any) {
      thunkAPI.dispatch(setEmailLoading(false));
      thunkAPI.dispatch(setEmailError(error.message || "Failed to create email account"));
      Errors.handle(error);
      return { success: false, error: error.message };
    }
  }
);

export const editEmailAccount = createAsyncThunk<
  BasicResult,
  { accountId: string; accountData: any }
>(
  "email/editAccount",
  async ({ accountId, accountData }, thunkAPI) => {
    try {
      thunkAPI.dispatch(setEmailLoading(true));
      await updateEmailAccount(accountId, accountData);
      const accounts = await getEmailAccounts();
      thunkAPI.dispatch(setEmailAccounts(accounts));
      thunkAPI.dispatch(setEmailLoading(false));
      return { success: true };
    } catch (error: any) {
      thunkAPI.dispatch(setEmailLoading(false));
      thunkAPI.dispatch(setEmailError(error.message || "Failed to update email account"));
      Errors.handle(error);
      return { success: false, error: error.message };
    }
  }
);

export const removeEmailAccount = createAsyncThunk<BasicResult, string>(
  "email/removeAccount",
  async (accountId, thunkAPI) => {
    try {
      thunkAPI.dispatch(setEmailLoading(true));
      await deleteEmailAccount(accountId);
      const accounts = await getEmailAccounts();
      thunkAPI.dispatch(setEmailAccounts(accounts));
      thunkAPI.dispatch(setEmailLoading(false));
      return { success: true };
    } catch (error: any) {
      thunkAPI.dispatch(setEmailLoading(false));
      thunkAPI.dispatch(setEmailError(error.message || "Failed to delete email account"));
      Errors.handle(error);
      return { success: false, error: error.message };
    }
  }
);

export const testEmailAccount = createAsyncThunk<
  TestEmailAccountResult,
  { accountId: string; testEmailAddress: string }
>(
  "email/testAccount",
  async ({ accountId, testEmailAddress }, thunkAPI) => {
    try {
      thunkAPI.dispatch(setEmailLoading(true));
      const result = await sendTestEmail(accountId, testEmailAddress);
      thunkAPI.dispatch(setEmailLoading(false));
      return { success: true, message: result.message };
    } catch (error: any) {
      thunkAPI.dispatch(setEmailLoading(false));
      thunkAPI.dispatch(setEmailError(error.message || "Failed to send test email"));
      Errors.handle(error);
      return { success: false, error: error.message };
    }
  }
);

// ---------- Email Settings Actions ----------
export const fetchEmailSettings = createAsyncThunk<BasicResult, void>(
  "email/fetchSettings",
  async (_, thunkAPI) => {
    try {
      thunkAPI.dispatch(setEmailLoading(true));
      const settings = await getEmailSettings();
      thunkAPI.dispatch(setEmailSettings(settings));
      thunkAPI.dispatch(setEmailLoading(false));
      return { success: true };
    } catch (error: any) {
      thunkAPI.dispatch(setEmailLoading(false));
      thunkAPI.dispatch(setEmailError(error.message || "Failed to fetch email settings"));
      Errors.handle(error);
      return { success: false, error: error.message };
    }
  }
);

export const saveEmailSettings = createAsyncThunk<BasicResult, any>(
  "email/saveSettings",
  async (settingsData, thunkAPI) => {
    try {
      thunkAPI.dispatch(setEmailLoading(true));
      await updateEmailSettings(settingsData);
      const settings = await getEmailSettings();
      thunkAPI.dispatch(setEmailSettings(settings));
      thunkAPI.dispatch(setEmailLoading(false));
      return { success: true };
    } catch (error: any) {
      thunkAPI.dispatch(setEmailLoading(false));
      thunkAPI.dispatch(setEmailError(error.message || "Failed to save email settings"));
      Errors.handle(error);
      return { success: false, error: error.message };
    }
  }
);

// ---------- Email Campaign Actions ----------
export const launchEmailCampaign = createAsyncThunk<BasicResult, any>(
  "email/launchCampaign",
  async (campaignData, thunkAPI) => {
    try {
      thunkAPI.dispatch(setEmailLoading(true));
      const result = await startEmailCampaign(campaignData);
      thunkAPI.dispatch(setCampaignStatus({
        isRunning: true,
        campaignId: result.operationId
      }));
      thunkAPI.dispatch(setEmailLoading(false));
      return { success: true };
    } catch (error: any) {
      thunkAPI.dispatch(setEmailLoading(false));
      thunkAPI.dispatch(setEmailError(error.message || "Failed to launch email campaign"));
      Errors.handle(error);
      return { success: false, error: error.message };
    }
  }
);

export const stopEmailCampaign = createAsyncThunk<BasicResult, void>(
  "email/stopCampaign",
  async (_, thunkAPI) => {
    try {
      thunkAPI.dispatch(setEmailLoading(true));
      const state: any = thunkAPI.getState();
      const campaignId = state.email.campaignStatus.campaignId;
      if (campaignId) {
        await cancelEmailCampaign(campaignId);
      }
      thunkAPI.dispatch(setCampaignStatus({
        isRunning: false,
        campaignId: null
      }));
      thunkAPI.dispatch(setEmailLoading(false));
      return { success: true };
    } catch (error: any) {
      thunkAPI.dispatch(setEmailLoading(false));
      thunkAPI.dispatch(setEmailError(error.message || "Failed to stop email campaign"));
      Errors.handle(error);
      return { success: false, error: error.message };
    }
  }
);
