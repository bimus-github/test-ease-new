"use client";

import type { TGUser } from "@/types/tg-user";
import type { Test } from "@/types/test";

export function Meta({ user, test }: { user: TGUser; test: Test }) {
  return (
    <section className="grid gap-2 rounded-lg border border-neutral-200 p-4 text-sm dark:border-neutral-800">
      <h3 className="text-base font-medium">Ma’lumot</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-1">
          <div>
            <span className="text-neutral-500">Foydalanuvchi:</span>
            <span className="ml-2">
              {user.telegram_first_name} {user.telegram_last_name}
            </span>
          </div>
          <div>
            <span className="text-neutral-500">Username:</span>
            <span className="ml-2">@{user.telegram_username}</span>
          </div>
          <div>
            <span className="text-neutral-500">Telegram ID:</span>
            <span className="ml-2">{user.telegram_id}</span>
          </div>
        </div>
        <div className="grid gap-1">
          <div>
            <span className="text-neutral-500">Test:</span>
            <span className="ml-2">{test.title}</span>
          </div>
          <div>
            <span className="text-neutral-500">Kod:</span>
            <span className="ml-2">{test.code}</span>
          </div>
          {test.end_date && (
            <div>
              <span className="text-neutral-500">Tugash:</span>
              <span className="ml-2">
                {new Date(test.end_date).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
