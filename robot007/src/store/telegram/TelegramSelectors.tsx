import { createSelector } from "reselect";

// Base state selector
const selectTelegramState = (state) => state.telegram;

// Telegram accounts selectors
export const selectTelegramAccounts = createSelector(
  selectTelegramState,
  (telegram) => telegram.accounts
);

export const selectTelegramAccount = (accountId: string) => 
  createSelector(
    selectTelegramAccounts,
    (accounts) => accounts.find(account => account.id === accountId)
  );

export const selectConnectedAccounts = createSelector(
  selectTelegramAccounts,
  (accounts) => accounts.filter(account => account.connected)
);

// Telegram groups selectors
export const selectTelegramGroups = createSelector(
  selectTelegramState,
  (telegram) => telegram.groups
);

export const selectTelegramGroup = (groupId: string) => 
  createSelector(
    selectTelegramGroups,
    (groups) => groups.find(group => group.id === groupId)
  );

// Phone number selectors
export const selectPhoneNumbers = createSelector(
  selectTelegramState,
  (telegram) => telegram.phoneNumbers
);

export const selectRegisteredNumbers = createSelector(
  selectTelegramState,
  (telegram) => telegram.registeredNumbers
);

export const selectRejectedNumbers = createSelector(
  selectTelegramState,
  (telegram) => telegram.rejectedNumbers
);

// Scheduled messages selectors
export const selectScheduledMessages = createSelector(
  selectTelegramState,
  (telegram) => telegram.scheduledMessages
);

export const selectScheduledMessage = (messageId: string) => 
  createSelector(
    selectScheduledMessages,
    (messages) => messages.find(msg => msg.id === messageId)
  );

export const selectActiveScheduledMessages = createSelector(
  selectScheduledMessages,
  (messages) => messages.filter(msg => msg.status === 'scheduled' || msg.status === 'running')
);

// Verification config selector
export const selectVerificationConfig = createSelector(
  selectTelegramState,
  (telegram) => telegram.verificationConfig
);

// Operation status selectors
export const selectVerificationInProgress = createSelector(
  selectTelegramState,
  (telegram) => telegram.verificationInProgress
);

export const selectMessagingInProgress = createSelector(
  selectTelegramState,
  (telegram) => telegram.messagingInProgress
);

export const selectCurrentOperation = createSelector(
  selectTelegramState,
  (telegram) => telegram.currentOperation
);

// Loading and error state selectors
export const selectTelegramLoading = createSelector(
  selectTelegramState,
  (telegram) => telegram.loading
);

export const selectTelegramError = createSelector(
  selectTelegramState,
  (telegram) => telegram.error
);