"use client";

import type { TGUser } from "@/types/tg-user";
import type { Test } from "@/types/test";
import { formatLocalDate } from "@/lib/utils";

export function Meta({ user, test }: { user: TGUser; test: Test }) {
  return (
    <section className="grid gap-3 rounded-md border border-neutral-200 p-4 text-sm shadow-sm dark:border-neutral-800">
      <h3 className="text-base font-medium">Ma’lumot</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-xs text-neutral-500">Foydalanuvchi</div>
            <div className="mt-0.5 font-medium">
              {user.telegram_first_name} {user.telegram_last_name}
            </div>
            {user.telegram_username && (
              <div className="mt-1 text-xs text-neutral-500">
                @{user.telegram_username}
              </div>
            )}
          </div>
          <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-xs text-neutral-500">Telegram ID</div>
            <div className="mt-0.5 font-medium">{user.telegram_id}</div>
          </div>
        </div>
        <div className="grid gap-2">
          <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-xs text-neutral-500">Test</div>
            <div className="mt-0.5 font-medium">{test.title}</div>
            <div className="mt-1 inline-flex items-center rounded-full border border-neutral-300 px-2 py-0.5 text-[10px] text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
              Kod: {test.code}
            </div>
          </div>
          {test.end_date && (
            <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
              <div className="text-xs text-neutral-500">Tugash</div>
              <div className="mt-0.5 font-medium">
                {formatLocalDate(test.end_date)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
