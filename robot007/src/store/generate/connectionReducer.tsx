import { createSlice } from "@reduxjs/toolkit";


const connectionReducer = createSlice({
    name: "connect",
    initialState: {
        connect: "",
        loadingTelegram: false,
        message: "",
        phonecodehash: "",
        authLoading: false,
        user: [] as any[],
        api: [] as any[]
    },
    reducers: {


        deleteApi: (state, actions) => {
            state.api.splice(actions.payload, 1);

        },

        setapi: (state, actions) => {
            state.api = actions.payload
        },
        setAuthLoading: (state, actions) => {
            state.authLoading = actions.payload;
        },

        removeUser: (state, actions) => {
            console.log("action", actions);

            state.user.splice(actions.payload, 1)
        },
        setUser: (state, actions) => {
            state.user.push(actions.payload);
        },
        setLoadingTelegram: (state, actions) => {
            state.loadingTelegram = actions.payload
        },

        setMessage: (state, actions) => {
            state.message = actions.payload
        },

        setPhoneHash: (state, actions) => {
            state.phonecodehash = actions.payload
        },

        setConnect: (state, actions) => {
            state.connect = actions.payload
        },

    },
});

export const {

    setConnect,
    setLoadingTelegram,
    setMessage,
    setPhoneHash,
    setUser,
    setAuthLoading,
    removeUser,
    setapi,
    deleteApi
} = connectionReducer.actions;

export default connectionReducer.reducer;
