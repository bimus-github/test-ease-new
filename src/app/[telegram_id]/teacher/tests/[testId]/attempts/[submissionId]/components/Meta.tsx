"use client";

import type { TGUser } from "@/types/tg-user";
import type { Test } from "@/types/test";
import Link from "next/link";
import { formatLocalDate } from "@/lib/utils";

interface MetaProps {
  user: TGUser;
  test: Test;
}

export function Meta({ user, test }: MetaProps) {
  return (
    <section className="grid gap-3">
      <h3 className="text-base font-medium">Ma'lumot</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Talaba
            </div>
            <div className="font-medium text-neutral-900 dark:text-neutral-100">
              {user.telegram_first_name} {user.telegram_last_name}
            </div>
            {user.telegram_username && (
              <Link
                target="_blank"
                href={`https://t.me/${user.telegram_username}`}
                className="mt-1.5 inline-flex items-center text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                @{user.telegram_username}
                <svg
                  className="ml-1 h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            )}
          </div>
          <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Telegram ID
            </div>
            <div className="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {user.telegram_id}
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Test
            </div>
            <div className="font-medium text-neutral-900 dark:text-neutral-100">
              {test.title}
            </div>
            <div className="mt-1.5 inline-flex items-center rounded-full border border-neutral-300 bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              Kod: <span className="ml-1 font-mono">{test.code}</span>
            </div>
          </div>
          {test.end_date && (
            <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Tugash vaqti
              </div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                {formatLocalDate(test.end_date)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

