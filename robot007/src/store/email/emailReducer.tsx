import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EmailAccount {
  id: string;
  name: string;
  email: string;
  host: string;
  port: number;
  security: string;
  dailySentCount: number;
}

interface EmailSettings {
  delayBetween: number;
  dailyLimit: number;
  delayBetweenEmails: number;
}

interface CampaignStatus {
  isRunning: boolean;
  campaignId: string | null;
  progress?: {
    total: number;
    sent: number;
    failed: number;
    eta?: string;
  };
}

interface EmailState {
  accounts: EmailAccount[];
  settings: EmailSettings;
  campaignStatus: CampaignStatus;
  loading: boolean;
  error: string | null;
}

const initialState: EmailState = {
  accounts: [],
  settings: {
    dailyLimit: 100,
    delayBetweenEmails: 5,
    delayBetween: 0
  },
  campaignStatus: {
    isRunning: false,
    campaignId: null,
    progress: {
      total: 0,
      sent: 0,
      failed: 0,
    },
  },
  loading: false,
  error: null,
};

const emailSlice = createSlice({
  name: "email",
  initialState,
  reducers: {
    setEmailAccounts: (state, action: PayloadAction<EmailAccount[]>) => {
      state.accounts = action.payload;
    },
    setEmailSettings: (state, action: PayloadAction<EmailSettings>) => {
      state.settings = action.payload;
    },
    setCampaignStatus: (state, action: PayloadAction<Partial<CampaignStatus>>) => {
      state.campaignStatus = { ...state.campaignStatus, ...action.payload };
    },
    updateCampaignProgress: (state, action: PayloadAction<Partial<CampaignStatus['progress']>>) => {
      if (state.campaignStatus.progress) {
        state.campaignStatus.progress = { 
          ...state.campaignStatus.progress, 
          ...action.payload 
        };
      } else {
        state.campaignStatus.progress = action.payload as CampaignStatus['progress'];
      }
    },
    setEmailLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setEmailError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetEmailError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setEmailAccounts,
  setEmailSettings,
  setCampaignStatus,
  updateCampaignProgress,
  setEmailLoading,
  setEmailError,
  resetEmailError,
} = emailSlice.actions;

export default emailSlice.reducer;