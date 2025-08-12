import { RootState } from "../store";

// Email Account Selectors
export const selectEmailAccounts = (state: RootState) => state.email.accounts;
export const selectEmailAccountById = (state: RootState, accountId: string) => 
  state.email.accounts.find(account => account.id === accountId);

// Email Settings Selectors
export const selectEmailSettings = (state: RootState) => state.email.settings;
export const selectDailyLimit = (state: RootState) => state.email.settings.dailyLimit;
export const selectDelayBetweenEmails = (state: RootState) => state.email.settings.delayBetweenEmails;


// Campaign Status Selectors
export const selectCampaignStatus = (state: RootState) => state.email.campaignStatus;
export const selectIsCampaignRunning = (state: RootState) => state.email.campaignStatus.isRunning;
export const selectCampaignProgress = (state: RootState) => state.email.campaignStatus.progress;

// Loading and Error Selectors
export const selectEmailLoading = (state: RootState) => state.email.loading;
export const selectEmailError = (state: RootState) => state.email.error;