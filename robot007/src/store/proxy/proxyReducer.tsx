import { createSlice } from "@reduxjs/toolkit";

const proxySlice = createSlice({
    name: "generate",
    initialState: {
        proxyLoading: false,
        proxies: [] as any[],
    },
    reducers: {

        // show contact details 
        setproxyLoading: (state, actions) => {
            state.proxyLoading = actions.payload
        },
        deleteProxies: (state, actions) => {
            state.proxies.splice(actions.payload, 1)
        },

        // show contact details 
        setproxy: (state, actions) => {
            state.proxies.push(actions.payload)
        },

    },
});

export const {

    setproxyLoading,
    setproxy,
    deleteProxies


} = proxySlice.actions;

export default proxySlice.reducer;
