"use client";

import {
  configureStore,
  combineReducers,
  ThunkAction,
  AnyAction,
} from "@reduxjs/toolkit";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import type { PersistConfig } from "redux-persist";
import testReducer from "./slices/forms/test";
import takeReducer from "./slices/take";

// Root reducer placeholder: add slices as you create them
const rootReducer = combineReducers({
  test: testReducer,
  take: takeReducer,
});

type RootReducer = ReturnType<typeof rootReducer>;

// SSR-safe storage shim
function createNoopStorage() {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
}

const isServer = typeof window === "undefined";

// Lazy import storage only on client
const storagePromise: Promise<Storage> = isServer
  ? Promise.resolve(createNoopStorage() as unknown as Storage)
  : import("redux-persist/lib/storage").then(
      (m) => m.default as unknown as Storage
    );

async function createPersistedReducer() {
  const storage = await storagePromise;
  const persistConfig: PersistConfig<RootReducer> = {
    key: "root",
    storage: storage as any,
    version: 3,
    whitelist: ["test", "take"],
  };
  return persistReducer(persistConfig, rootReducer);
}

export const makeStore = async () => {
  const persistedReducer = await createPersistedReducer();
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
    devTools: process.env.NODE_ENV !== "production",
  });
};

export type AppThunk = ThunkAction<void, RootState, unknown, AnyAction>;
export type AppStore = Awaited<ReturnType<typeof makeStore>>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;
