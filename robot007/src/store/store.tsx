import { configureStore } from "@reduxjs/toolkit";
import generateReducer from "./generate/generateReducer";
import connectionReducer from "./generate/connectionReducer"; // The reducer you want to persist
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Default is localStorage
import proxyReducer from './proxy/proxyReducer'
import emailReducer from './email/emailReducer'
import telegramReducer from './telegram/telegramReducer'
// Configuration for redux-persist
const persistConfig = {
  key: "connection", // Key for persistence (can be any unique name for the connection reducer)
  storage, // Default storage (localStorage for web, AsyncStorage for React Native)
};

const proxyPersistConfig = {
  key: "proxy",
  storage,
};

const emailPersistConfig = {
  key: "email",
  storage,
};

const telegramPersistConfig = {
  key: "telegram",
  storage,
};

// Persisting reducers
const persistedConnectionReducer = persistReducer(persistConfig, connectionReducer);
const persistedProxyReducer = persistReducer(proxyPersistConfig, proxyReducer);
const persistedEmailReducer = persistReducer(emailPersistConfig, emailReducer);
const persistedTelegramReducer = persistReducer(telegramPersistConfig, telegramReducer);

const store = configureStore({
  reducer: {
    generate: generateReducer, // This reducer is not persisted
    connection: persistedConnectionReducer, // This reducer is persisted
    proxy: persistedProxyReducer,
    email: persistedEmailReducer,
    telegram: persistedTelegramReducer
  },
});

// Create a persistor
const persistor = persistStore(store);

// Define RootState type
export type RootState = ReturnType<typeof store.getState>;

export { store, persistor };
