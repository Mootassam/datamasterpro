import { createSelector } from "reselect";

const selectGenerateState = (state: any) => state.generate;

const selectConnectionState = (state: any) => state.connection

export const selectphoneNumbers = createSelector(
  selectGenerateState,
  (generate) => generate.phoneNumbers
);

export const selectGenerateLoading = createSelector(
  selectGenerateState,
  (generate) => generate.generateLoading
);

export const connectionStates = createSelector(
  selectConnectionState,
  (connection) => connection.connect
);


export const allLoading = createSelector(
  selectGenerateState,
  (generate) => generate.allLoading
);






// Show Contact

export const showContact = createSelector(
  selectGenerateState,
  (generate) => generate.showContact
);



// check functions

export const checkLoading = createSelector(
  selectGenerateState,
  (generate) => generate.checkLoading
);

// check the number registered
export const numberRegistered = createSelector(
  selectGenerateState,
  (generate) => generate.checkLoading
);
export const lengthRegistered = createSelector(
  selectGenerateState,
  (generate) => generate.rejectNumber.length
);

// check the number Rejects
export const numberRejects = createSelector(
  selectGenerateState,
  (generate) => generate.rejectNumber
);
export const lengthRejects = createSelector(
  selectGenerateState,
  (generate) => generate.rejectNumber.length
);

// Upload the file csv

export const fileLoading = createSelector(
  selectGenerateState,
  (generate) => generate.uploadLoading
);

export const fileResults = createSelector(
  selectGenerateState,
  (generate) => generate.phoneNumbers
);

// Download the file

export const downloadLoading = createSelector(
  selectGenerateState,
  (generate) => generate.downloadLoading
);
export const allaccounts = createSelector(
  selectGenerateState,
  (generate) => generate.listAccounts
);

export const ListGroups = createSelector(
  selectGenerateState,
  (generate) => generate.listgroups
);


export const codephoneHash = createSelector(selectConnectionState, (code) => code.phonecodehash);
export const Loadingphone = createSelector(selectGenerateState, (generate) => generate.loadingphonedetail);
export const phonedetail = createSelector(selectGenerateState, (generate) => generate.phonedetail);
export const AuthLoading = createSelector(selectConnectionState, (state) => state.authLoading);
export const allUsers = createSelector(selectConnectionState, (state) => state.user);
export const allApi = createSelector(selectConnectionState, (state) => state.api);
export const LoadingTelegram = createSelector(selectConnectionState , (state) => state.loadingTelegram)
