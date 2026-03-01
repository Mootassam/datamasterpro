import { createSlice } from "@reduxjs/toolkit";

const generateSlice = createSlice({
  name: "generate",
  initialState: {
    generateLoading: false,
    phoneNumbers: [] as any[],
    checkLoading: false,
    registeredNumber: [] as string[],
    rejectNumber: [] as string[],
    uploadLoading: false,
    downloadLoading: false,
    allLoading: false,
    loadingMessage: false,
    msg: "",
    phonedetail: "",
    loadingphonedetail: false,
    showContact: false,
    listAccounts: [] as any[],
    listgroups: [] as any[],
    favorites: [] as string[],
    numbersWithPhoto: [] as string[],
  },
  reducers: {
    setALLLoading: (state, actions) => {
      state.allLoading = actions.payload;
    },
    setListGroups: (state, actions) => {
      state.listgroups = actions.payload;
    },

    setListAccounts: (state, actions) => {
      state.listAccounts = actions.payload;
    },
    // show contact details
    setShowContact: (state, actions) => {
      state.showContact = actions.payload;
    },

    addFavoriteNumber: (state, actions) => {
      const number = actions.payload as string;
      if (!state.favorites.includes(number)) {
        state.favorites.push(number);
      }
    },
    removeFavoriteNumber: (state, actions) => {
      const number = actions.payload as string;
      state.favorites = state.favorites.filter((n) => n !== number);
    },
    clearFavorites: (state) => {
      state.favorites = [];
    },

    addNumberWithPhoto: (state, actions) => {
      const number = actions.payload as string;
      if (!state.numbersWithPhoto.includes(number)) {
        state.numbersWithPhoto.push(number);
      }
    },

    //send Message
    sendMessage: (state, actions) => {
      state.msg = actions.payload;
    },
    loadingMessage: (state, actions) => {
      state.loadingMessage = actions.payload;
    },
    // generate functions
    getNumbers: (state, actions) => {
      state.phoneNumbers = actions.payload;
    },
    setgenerateLoading: (state, actions) => {
      state.generateLoading = actions.payload;
    },

    setLoadingphone: (state, actions) => {
      state.loadingphonedetail = actions.payload;
    },
    setphonedetails: (state, actions) => {
      state.phonedetail = actions.payload;
    },

    // check function
    checkLoading: (state, actions) => {
      state.checkLoading = actions.payload;
    },
    getNumberRegistered: (state, actions) => {
      const payload = actions.payload as any;
      if (Array.isArray(payload)) {
        state.registeredNumber = payload;
      } else if (payload && Array.isArray(payload.phoneNumberRegistred)) {
        state.registeredNumber = payload.phoneNumberRegistred;
        if (Array.isArray(payload.numbersWithPhoto)) {
          state.numbersWithPhoto = payload.numbersWithPhoto;
        }
      }
    },

    // upload file

    fileLoading: (state, actions) => {
      state.uploadLoading = actions.payload;
    },

    getFileResutlts: (state, actions) => {
      state.phoneNumbers = actions.payload;
    },

    //download file

    downloadLoading: (state, actions) => {
      console.log(actions.payload);

      state.downloadLoading = actions.payload;
    },
  },
});

export const {
  getNumbers,
  setgenerateLoading,
  checkLoading,
  getNumberRegistered,
  fileLoading,
  getFileResutlts,
  downloadLoading,
  loadingMessage,
  setLoadingphone,
  setphonedetails,
  setShowContact,
  setListAccounts,
  setListGroups,
  setALLLoading,
  addFavoriteNumber,
  removeFavoriteNumber,
  clearFavorites,
  addNumberWithPhoto,
} = generateSlice.actions;

export default generateSlice.reducer;
