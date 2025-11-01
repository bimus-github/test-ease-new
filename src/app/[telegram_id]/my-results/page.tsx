"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useGetMyResults } from "./hooks";
import MyResultsList from "./components/MyResultsList";

export default function MyResultsPage() {
  const { telegram_id: telegramId } = useParams<{ telegram_id: string }>();
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const params = useMemo(
    () => ({ status, q, cursor, limit: 10 }),
    [status, q, cursor]
  );
  const { data, isLoading, isFetching } = useGetMyResults(telegramId, params);

  const items = data?.items ?? [];
  const hasMore = Boolean(data?.nextCursor);

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-base font-semibold">Mening natijalarim</h1>
        <div className="flex gap-2">
          <div className="inline-flex overflow-hidden rounded-md border dark:border-neutral-700">
            {[
              { id: "all", label: "Barchasi" },
              { id: "submitted", label: "Yuborilgan" },
              { id: "started", label: "Boshlangan" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setCursor(null);
                  setStatus(opt.id);
                }}
                className={
                  "px-3 py-1.5 text-xs sm:text-sm " +
                  (status === opt.id
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-transparent text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => {
              setCursor(null);
              setQ(e.target.value);
            }}
            placeholder="Test qidirish…"
            className="w-40 rounded-md border px-3 py-1.5 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
          />
        </div>
      </div>

      <MyResultsList
        items={items}
        isLoading={isLoading || isFetching}
        hasMore={hasMore}
        onLoadMore={() => setCursor(data?.nextCursor ?? null)}
      />
    </div>
  );
}
