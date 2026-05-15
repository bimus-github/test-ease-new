"use client";

import { useEffect, useState } from "react";

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
  };
  close: () => void;
  ready: () => void;
  expand: () => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
    notificationOccurred: (type: "success" | "warning" | "error") => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setWebApp(tg);
      try {
        tg.ready();
      } catch {
        // ignore
      }
    }
  }, []);

  return webApp;
}

/**
 * Returns the verified initData string that should be sent to server.
 * If outside Telegram WebApp context, returns null (legacy URL-based flow used as fallback).
 */
export function useInitData(): string | null {
  const tg = useTelegramWebApp();
  return tg?.initData || null;
}
