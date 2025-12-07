"use client";

import Link from "next/link";
import { MY_RESULTS_ROUTE } from "@/constants/routes";
import { Loader2 } from "lucide-react";

export function Header({
  title,
  telegramId,
  isFetching,
}: {
  title: string;
  telegramId: string;
  isFetching: boolean;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h2>
      <div className="flex items-center gap-2">
        {isFetching && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Yangilanmoqda…</span>
          </div>
        )}
        <Link
          href={MY_RESULTS_ROUTE(telegramId)}
          className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          JAVOBLARIM
        </Link>
      </div>
    </div>
  );
}
