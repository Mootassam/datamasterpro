import { createSelector } from "reselect";


const selectProxyState = (state: any) => state.proxy

export const proxyDetails = createSelector(
    selectProxyState,
    (generate) => generate.proxies
);

export const LoadingProxy = createSelector(selectProxyState, (state) => state.proxyLoading)
