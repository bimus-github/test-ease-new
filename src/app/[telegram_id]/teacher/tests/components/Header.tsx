"use client";
import { RefreshCcwIcon } from "lucide-react";


export function Header({
    isFetching,
    onRefetch,
  }: {
    isFetching: boolean;
    onRefetch: () => void;
  }) {
    return (
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold">Testlarim</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Testlaringiz ro‘yxati
          </p>
        </div>
        <button
          onClick={onRefetch}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
          aria-label="Testlarni yangilash"
        >
          <RefreshCcwIcon
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Yangilash
        </button>
      </div>
    );
  }