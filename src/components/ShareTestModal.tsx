"use client";

import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  testCode: string;
  testTitle: string;
  shareUrl: string;
}

export function ShareTestModal({ open, onClose, testCode, testTitle, shareUrl }: Props) {
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  useEffect(() => {
    if (!open) setCopied(null);
  }, [open]);

  if (!open) return null;

  const copy = async (value: string, kind: "link" | "code") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignored
    }
  };

  // External QR API (no library) — quickchart.io or qrserver.com
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;

  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`🧪 "${testTitle}" testini sinab ko'ring!`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">🔗 Testni ulashish</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
            ✕
          </button>
        </div>

        <div className="mb-4 flex justify-center rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="QR kod" width={240} height={240} />
        </div>

        <div className="mb-3 grid gap-2">
          <div>
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Test kodi
            </label>
            <div className="mt-1 flex gap-2">
              <input
                readOnly
                value={testCode}
                className="flex-1 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-center font-mono text-base font-bold tracking-wider dark:border-neutral-700 dark:bg-neutral-800"
              />
              <button
                type="button"
                onClick={() => copy(testCode, "code")}
                className="rounded-md border border-neutral-300 px-3 py-2 text-xs hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                {copied === "code" ? "✓" : "Nusxa"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              To'g'ridan-to'g'ri link
            </label>
            <div className="mt-1 flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
              />
              <button
                type="button"
                onClick={() => copy(shareUrl, "link")}
                className="rounded-md border border-neutral-300 px-3 py-2 text-xs hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                {copied === "link" ? "✓" : "Nusxa"}
              </button>
            </div>
          </div>
        </div>

        <a
          href={telegramShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-md bg-[#0088cc] px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90"
        >
          📤 Telegram orqali yuborish
        </a>
      </div>
    </div>
  );
}
