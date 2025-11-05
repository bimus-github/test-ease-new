"use client";

import Link from "next/link";
import { MY_TESTS_ROUTE } from "@/constants/routes";

export function ViewHeader({
  title,
  subtitle,
  telegramId,
  onRefetch,
  isFetching,
}: {
  title: string;
  subtitle?: string;
  telegramId: string;
  onRefetch?: () => void;
  isFetching?: boolean;
}) {
  return (
    <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {onRefetch && (
          <button
            onClick={onRefetch}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            <svg
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3.172 7a8 8 0 111.414 8.485l1.414-1.414A6 6 0 1010 4v2.5a.5.5 0 01-.8.4L5.6 4.8a.5.5 0 010-.8L9.2.8A.5.5 0 0110 .4V3a8 8 0 00-6.828 4z" />
            </svg>
            Yangilash
          </button>
        )}
        <Link
          href={MY_TESTS_ROUTE(telegramId)}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Orqaga
        </Link>
      </div>
    </div>
  );
}
