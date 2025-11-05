"use client";

import Link from "next/link";
import { VIEW_TEST_ROUTE } from "@/constants/routes";

export function AttemptsHeader({
  title,
  telegramId,
  testId,
  isFetching,
  canCalculateRasch,
  isCalculating,
  onCalculate,
  endDate,
}: {
  title: string;
  telegramId: string;
  testId: string;
  isFetching: boolean;
  canCalculateRasch: boolean;
  isCalculating: boolean;
  onCalculate: () => Promise<void>;
  endDate: string;
}) {
  return (
    <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">{title} • Urinishlar</h2>
        <span className="text-xs text-neutral-500">
          {isFetching ? "Yangilanmoqda…" : ""}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {canCalculateRasch ? (
          <button
            onClick={onCalculate}
            disabled={isCalculating}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-60 dark:border-white dark:bg-white dark:text-black"
          >
            {isCalculating ? "Hisoblanmoqda…" : "Rasch hisoblash"}
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
            <span>Rasch hisoblash uchun test yakunlanishi kerak.</span>
            <span>{new Date(endDate || "").toLocaleString()}</span>
          </div>
        )}
        <Link
          href={VIEW_TEST_ROUTE(testId, telegramId)}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Testga qaytish
        </Link>
      </div>
    </div>
  );
}
