import { createSlice } from "@reduxjs/toolkit";

const generateSlice = createSlice({
  name: "generate",
  initialState: {
    generateLoading: false,
    phoneNumbers: [],
    checkLoading: false,
    registeredNumber: [],
    rejectNumber: [],
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
      state.registeredNumber = actions.payload;
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
} = generateSlice.actions;

export default generateSlice.reducer;
