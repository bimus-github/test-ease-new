"use client";

import { ReactNode, useMemo, useState, useEffect } from "react";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { makeStore, type AppStore } from "./store";

export function ReduxProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<AppStore | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const created = await makeStore();
      if (mounted) setStore(created);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persistor = useMemo(
    () => (store ? persistStore(store) : null),
    [store]
  );

  if (!store || !persistor) return null;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
