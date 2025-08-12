import { createSlice, PayloadAction } from "@reduxjs/toolkit";



const telegramSlice = createSlice({
  name: "telegram",
  initialState:{  
  accounts: [],
  groups: [],
  phoneNumbers: [],
  registeredNumbers: [],
  rejectedNumbers: [],
  scheduledMessages: [],
  verificationConfig: {
    batchSize: 25,
    delayBetweenNumbers: 1000,
    delayBetweenBatches: 5000
  },
  verificationInProgress: false,
  messagingInProgress: false,
  currentOperation: null,
  loading: false,
  error: null
}, 
  reducers: {
    setTelegramAccounts: (state, action) => {
      state.accounts = action.payload;
    },
    setTelegramGroups: (state, action) => {
      state.groups = action.payload;
    },
    setPhoneNumbers: (state, action) => {
      state.phoneNumbers = action.payload;
    },
    setRegisteredNumbers: (state, action) => {
      state.registeredNumbers = action.payload;
    },
    setRejectedNumbers: (state, action) => {
      state.rejectedNumbers = action.payload;
    },
    setScheduledMessages: (state, action) => {
      state.scheduledMessages = action.payload;
    },
    addScheduledMessage: (state, action) => {
      state.scheduledMessages = [...state.scheduledMessages, action.payload as typeof state.scheduledMessages[0]];
    },
    updateScheduledMessage: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.scheduledMessages.findIndex((msg: { id: string | number }) => msg.id === id);
      if (index !== -1) {
        state.scheduledMessages[index] = Object.assign({}, state.scheduledMessages[index], updates);
      }
    },
    removeScheduledMessage: (state, action) => {
      state.scheduledMessages = state.scheduledMessages.filter((msg: { id: string | number }) => msg.id !== action.payload);
    },
    setVerificationConfig: (state, action) => {
      state.verificationConfig = { ...state.verificationConfig, ...action.payload };
    },
    setVerificationInProgress: (state, action) => {
      state.verificationInProgress = action.payload;
    },
    setMessagingInProgress: (state, action) => {
      state.messagingInProgress = action.payload;
    },
    setCurrentOperation: (state, action) => {
      state.currentOperation = action.payload;
    },
    setTelegramLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTelegramError: (state, action) => {
      state.error = action.payload;
    },
    resetTelegramError: (state) => {
      state.error = null;
    },
  },
});

export const {
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
  resetTelegramError,
} = telegramSlice.actions;

export default telegramSlice.reducer;