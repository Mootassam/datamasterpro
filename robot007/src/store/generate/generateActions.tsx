import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  allApi,
  cancelProcess,
  checkwhatsAppNumber,
  ConfirmCode,
  deleteApiCred,
  downloadFile,
  generateEmail,
  generatePhoneNumbers,
  getDetail,
  getTelegramUser,
  listAccouns,
  Login,
  Logout,
  sendTelegramMessage,
  sendwhatsAppMessage,
  StoreAPi,
  TelegramLogin,
  TelegramLogout,
  uploadFile,
  VerifyEmail,
  LogoutAll,
  DisconnectAll,
  listGroups,
  exportGroupMembers,
} from "./generateService";
import {
  checkLoading,
  downloadLoading,
  fileLoading,
  getNumberRegistered,
  getNumbers,
  setgenerateLoading,
  loadingMessage,
  setphonedetails,
  setLoadingphone,
  setShowContact,
  setListAccounts,
  setListGroups,
  setALLLoading,
} from "./generateReducer";
import Toast from "../../shared/Message/Toast";
import {
  deleteApi,
  removeUser,
  setapi,
  setConnect,
  setLoadingTelegram,
  setPhoneHash,
  setUser,
} from "./connectionReducer";
import Errors from "../../modules/shared/error";

export const generateNumbers = createAsyncThunk<void, any>(
  "generate/generateNumbers",
  async ({ country, match, state, carrier }, thunkAPI) => {
    try {
      thunkAPI.dispatch(setgenerateLoading(true));
      const phoneNumbers = await generatePhoneNumbers(
        country,
        match,
        state,
        carrier
      );
      thunkAPI.dispatch(getNumbers(phoneNumbers));
      thunkAPI.dispatch(setgenerateLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setgenerateLoading(false));
      Errors.handle(error);
    }
  }
);

export const generateEmails = createAsyncThunk<void, any>(
  "generate/generateEmails",
  async ({ matchCount, country, gender }, thunkAPI) => {
    try {
      thunkAPI.dispatch(setgenerateLoading(true));
      const phoneNumbers = await generateEmail(matchCount, country, gender);
      thunkAPI.dispatch(getNumbers(phoneNumbers));
      thunkAPI.dispatch(setgenerateLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setgenerateLoading(false));
      Errors.handle(error);
    }
  }
);

export const verifyEmails = createAsyncThunk<void, any>(
  "generate/verifyEmails",
  async ({ numbers, config }, thunkAPI) => {
    try {
      thunkAPI.dispatch(setgenerateLoading(true));
      const phoneNumbers = await VerifyEmail(numbers, config);
      thunkAPI.dispatch(getNumberRegistered(phoneNumbers));
      thunkAPI.dispatch(setgenerateLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setgenerateLoading(false));
      Errors.handle(error);
    }
  }
);

export const login = createAsyncThunk<void, any>("generate/login", async () => {
  try {
    // thunkAPI.dispatch(setAuthLoading(true));
    await Login();

    // thunkAPI.dispatch(setAuthLoading(false));
  } catch (error) {
    // thunkAPI.dispatch(setAuthLoading(false));
    console.log("Error Login ", error);
    Errors.handle(error);
  }
});

export const allAccounts = createAsyncThunk<void, void>(
  "generate/listAccounts",
  async (_, thunkAPI) => {
    try {
      // thunkAPI.dispatch(setAuthLoading(true));
      const data = await listAccouns();
      thunkAPI.dispatch(setListAccounts(data));
    } catch (error) {
      // thunkAPI.dispatch(setAuthLoading(false));
      console.log("Error Login ", error);
      Errors.handle(error);
    }
  }
);

export const logout = createAsyncThunk<void, any>(
  "generate/logout",
  async (accountId) => {
    try {
      await Logout(accountId);
    } catch (error) {
      Errors.handle(error);
    }
  }
);

export const logoutAll = createAsyncThunk<void>(
  "generate/logoutAll",
  async () => {
    try {
      await LogoutAll();
    } catch (error) {
      Errors.handle(error);
    }
  }
);

export const logoutTelegram = createAsyncThunk<void, any>(
  "generate/logout",
  async ({ id, index }, thunkAPI) => {
    try {
      await TelegramLogout(id);
      thunkAPI.dispatch(removeUser(index));
    } catch (error) {
      Errors.handle(error);
    }
  }
);

export const checkphonedetail = createAsyncThunk<void, string>(
  "generate/checkWhatsApp",
  async (numbers, thunkAPI) => {
    try {
      thunkAPI.dispatch(setLoadingphone(true));
      const response = await getDetail(numbers);
      thunkAPI.dispatch(setphonedetails(response));
      thunkAPI.dispatch(setLoadingphone(false));
      thunkAPI.dispatch(setShowContact(true));
    } catch (error) {
      Errors.handle(error);
      thunkAPI.dispatch(setLoadingphone(false));
      thunkAPI.dispatch(setShowContact(false));
    }
  }
);

export const connectionState = createAsyncThunk<void, string>(
  "connect/check-status",
  async (connect, thunkAPI) => {
    try {
      thunkAPI.dispatch(setConnect(connect));
    } catch (error) {
      Errors.handle(error);
      console.log("Error generating numbers", error);
    }
  }
);

export const checkWhatsApp = createAsyncThunk<
  void,
  { numbers: String[]; config: any }
>("generate/checkWhatsApp", async ({ numbers, config }, thunkAPI) => {
  try {
    thunkAPI.dispatch(checkLoading(true));
    const response = await checkwhatsAppNumber(numbers, config);
    thunkAPI.dispatch(getNumberRegistered(response));
    thunkAPI.dispatch(checkLoading(false));
  } catch (error) {
    Errors.handle(error);
    thunkAPI.dispatch(checkLoading(false));
    console.log("Error generating numbers", error);
  }
});

// export const checkTelegram = createAsyncThunk<
//   void,
//   { numbers: String[]; config: any }
// >("generate/checktelegram", async ({ numbers, config }, thunkAPI) => {
//   try {
//     thunkAPI.dispatch(checkLoading(true));
//     const response = await verifyTelegramNumbers(numbers, config);
//     thunkAPI.dispatch(getNumberRegistered(response));
//     thunkAPI.dispatch(checkLoading(false));
//   } catch (error) {
//     Errors.handle(error);
//     thunkAPI.dispatch(checkLoading(false));
//     console.log("Error generating numbers", error);
//   }
// });

export const getUserDetails = createAsyncThunk<void, { number: any }>(
  "generate/checktelegram",
  async (number, thunkAPI) => {
    try {
      thunkAPI.dispatch(checkLoading(true));
      const response = await getTelegramUser(number);
      thunkAPI.dispatch(setphonedetails(response));
      thunkAPI.dispatch(setLoadingphone(false));
      thunkAPI.dispatch(setShowContact(true));
      thunkAPI.dispatch(checkLoading(false));
    } catch (error) {
      Errors.handle(error);
      thunkAPI.dispatch(checkLoading(false));
      console.log("Error generating numbers", error);
    }
  }
);

export const ProcessCancel = createAsyncThunk<void, any>(
  "generate/cancel",
  async (service) => {
    try {
      // thunkAPI.dispatch(checkLoading(true));
      await cancelProcess(service);
      // thunkAPI.dispatch(getNumberRegistered(response));
      // thunkAPI.dispatch(checkLoading(false));
    } catch (error) {
      Errors.handle(error);
      // thunkAPI.dispatch(checkLoading(false));
      console.log("Error ", error);
    }
  }
);

export const StoreCredentials = createAsyncThunk<void, { newApi: any }>(
  "generate/StoreCredentials",
  async (newApi) => {
    try {
      // thunkAPI.dispatch(checkLoading(true));
      await StoreAPi(newApi);
      await allApi();
      // thunkAPI.dispatch(getNumberRegistered(response));
      // thunkAPI.dispatch(checkLoading(false));
    } catch (error) {
      Errors.handle(error);
      // thunkAPI.dispatch(checkLoading(false));
      console.log("Error ", error);
    }
  }
);

// export const getStoreCredentials = createAsyncThunk<void, void>(
//   "generate/getCredentials",
//   async (_arg, thunkAPI) => {
//     try {
//       await getAPi();
//     } catch (error) {
//       Errors.handle(error);
//       console.log("Error ", error);
//     }
//   }
// );

export const allGroups = createAsyncThunk<void, any>(
  "generate/getCredentials",
  async (accountId, thunkAPI) => {
    try {
      thunkAPI.dispatch(setALLLoading(true));
      const response = await listGroups(accountId);
      thunkAPI.dispatch(setListGroups(response));
      thunkAPI.dispatch(setALLLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setALLLoading(false));
      Errors.handle(error);
      console.log("Error ", error);
    }
  }
);

export const exportGroup = createAsyncThunk<void, any>(
  "generate/exportGroupMembers",
  async ({ accountId, groupId }, thunkAPI) => {
    try {
      thunkAPI.dispatch(downloadLoading(true));
      await exportGroupMembers(accountId, groupId);
      thunkAPI.dispatch(downloadLoading(false));
    } catch (error) {
      thunkAPI.dispatch(downloadLoading(false));
      Errors.handle(error);
      console.log("Error ", error);
    }
  }
);

export const Disconnect = createAsyncThunk<void, void>(
  "generate/getCredentials",
  async (_arg) => {
    try {
      await DisconnectAll();
    } catch (error) {
      Errors.handle(error);
      console.log("Error ", error);
    }
  }
);

export const getAllCredentials = createAsyncThunk<void, void>(
  "generate/getCredentials",
  async (_arg, thunkAPI) => {
    try {
      const response = await allApi();
      thunkAPI.dispatch(setapi(response));
    } catch (error) {
      Errors.handle(error);
      console.log("Error ", error);
    }
  }
);

export const deleteCredentials = createAsyncThunk<void, { id; index }>(
  "generate/deleteCredentials",
  async ({ id, index }, thunkAPI) => {
    try {
      await deleteApiCred(id);
      await allApi();
      thunkAPI.dispatch(deleteApi(index));
    } catch (error) {
      Errors.handle(error);
      console.log("Error ", error);
    }
  }
);

export const sendMessage = createAsyncThunk<
  void,
  { delay; messages; registeredNumbers; useRandomDelay; selectedAccounts }
>(
  "generate/sendMessage",
  async (
    { delay, messages, registeredNumbers, useRandomDelay, selectedAccounts },
    thunkAPI
  ) => {
    try {
      thunkAPI.dispatch(loadingMessage(false));
      await sendwhatsAppMessage(
        delay,
        messages,
        registeredNumbers,
        useRandomDelay,
        selectedAccounts
      );
      thunkAPI.dispatch(loadingMessage(true));
    } catch (error) {
      Errors.handle(error);
      thunkAPI.dispatch(loadingMessage(false));
    }
  }
);

export const sendMessageTelegram = createAsyncThunk<
  void,
  { delay; messages; registeredNumbers; selectedAccounts }
>(
  "generate/sendMessage",
  async ({ delay, messages, registeredNumbers }, thunkAPI) => {
    try {
      thunkAPI.dispatch(loadingMessage(false));
      await sendTelegramMessage(delay, messages, registeredNumbers);
      thunkAPI.dispatch(loadingMessage(true));
    } catch (error) {
      Errors.handle(error);
      thunkAPI.dispatch(loadingMessage(false));
    }
  }
);

export const uploadcsv = createAsyncThunk<void, File>(
  "/generate/upload",
  async (file, thunkAPI) => {
    try {
      thunkAPI.dispatch(fileLoading(true));
      const response = await uploadFile(file);
      console.log("Response", response);

      //  thunkAPI.dispatch(getNumbers(response.newNumbers));
      thunkAPI.dispatch(fileLoading(false));
    } catch (error) {
      Errors.handle(error);
      thunkAPI.dispatch(fileLoading(false));
    }
  }
);

export const download = createAsyncThunk<void, any>(
  "/generate/download",
  async (data, thunkAPI) => {
    try {
      thunkAPI.dispatch(downloadLoading(true));
      await downloadFile(data);
      thunkAPI.dispatch(downloadLoading(false));
    } catch (error) {
      Errors.handle(error);
      thunkAPI.dispatch(downloadLoading(false));
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  }
);

export const authTelegram = createAsyncThunk<void, any>(
  "/generate/auth/telegram",
  async (data, thunkAPI) => {
    try {
      thunkAPI.dispatch(setLoadingTelegram(true));
      const results = await TelegramLogin(data);
      // thunkAPI.dispatch( setMessage(results.message));
      await thunkAPI.dispatch(setPhoneHash(results));
      thunkAPI.dispatch(setLoadingTelegram(false));
      // thunkAPI.dispatch(downloadLoading(false));
      Toast.Error(results.message);
    } catch (error) {
      Errors.handle(error);
      thunkAPI.dispatch(setLoadingTelegram(false));
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  }
);

export const confirmOTP = createAsyncThunk<void, any>(
  "/generate/auth/telegram/confirmOTP",
  async ({ phone, otp, codehash }, thunkAPI) => {
    try {
      thunkAPI.dispatch(setLoadingTelegram(true));
      const results = await ConfirmCode(phone, otp, codehash);
      thunkAPI.dispatch(setUser(results.user));

      // thunkAPI.dispatch( setMessage(results.message));
      thunkAPI.dispatch(setPhoneHash(results.phone_code_hash));
      thunkAPI.dispatch(setLoadingTelegram(false));
      Toast.Success("Success Login");
      // thunkAPI.dispatch(downloadLoading(false));
    } catch (error) {
      Errors.handle(error);
      thunkAPI.dispatch(setLoadingTelegram(false));
    }
  }
);
