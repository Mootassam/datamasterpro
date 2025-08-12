import { createAsyncThunk } from "@reduxjs/toolkit";
import { DeleteProxy, saveProxy, testProxies } from "./proxyService";
import Errors from "../../modules/shared/error";
import { deleteProxies, setproxy, setproxyLoading } from "./proxyReducer";
import Toast from "../../shared/Message/Toast";

export const HandleProxy = createAsyncThunk<void, any>(
    "proxy/save",
    async (newProxy, thunkAPI) => {
        try {
            thunkAPI.dispatch(setproxyLoading(true));
            const proxy = await saveProxy(newProxy)
            thunkAPI.dispatch(setproxy(proxy));
            thunkAPI.dispatch(setproxyLoading(false));
            Toast.Success(`✅ Proxy ${proxy.ip} is working!`);
        } catch (error) {
            thunkAPI.dispatch(setproxyLoading(false));
            Errors.handle(error)
        }
    }
);


export const deleteProxy = createAsyncThunk<void, any>(
    "proxy/delete",
    async ({ data, index }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setproxyLoading(true));

             await DeleteProxy(data)
            thunkAPI.dispatch(deleteProxies(index));
            thunkAPI.dispatch(setproxyLoading(false));
            Toast.Success(`🗑️ Proxy ${data.ip} has been deleted successfully.`);
        } catch (error) {
            thunkAPI.dispatch(setproxyLoading(false));
            Errors.handle(error)
        }
    }
);

export const testProxy = createAsyncThunk<void, any>(
    "proxy/test",
    async (newProxy, thunkAPI) => {
        try {
            thunkAPI.dispatch(setproxyLoading(true));
            const proxy = await testProxies(newProxy)
            thunkAPI.dispatch(setproxyLoading(false));

            Toast.Success(
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                        src={`https://cdn.proxyscrape.com/img/country/iso_16/${proxy.country?.toLowerCase() || 'unknown'}.png`}
                        alt=""
                        style={{ width: 20 }}
                    />
                    <span> Proxy {proxy.ip} is working!</span>
                </div>
            );
        } catch (error) {
            thunkAPI.dispatch(setproxyLoading(false));
            Errors.handle(error)
        }
    }
);