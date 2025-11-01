"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function WebAppRedirectPage() {
  const params = useSearchParams();

  useEffect(() => {
    const telegramId = params.get("telegram_id");
    const path = params.get("path");

    if (!telegramId || !path) {
      return;
    }

    const origin = window.location.origin;
    const target = `${origin}/${telegramId}${path}`;
    window.location.replace(target);
  }, [params]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <p>Ochilyapti…</p>
    </div>
  );
}
