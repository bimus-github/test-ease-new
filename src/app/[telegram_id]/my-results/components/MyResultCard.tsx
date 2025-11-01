"use client";

import {
  TEST_RESULT_ROUTE,
  TAKE_TEST_ROUTE,
  VIEW_TEST_ROUTE,
} from "@/constants/routes";
import { useParams, useRouter } from "next/navigation";
import { MyResultItem } from "../actions";

export default function MyResultCard({ item }: { item: MyResultItem }) {
  const { telegram_id: telegramId } = useParams<{ telegram_id: string }>();
  const router = useRouter();

  const statusColors =
    item.status === "submitted"
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
      : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200";

  const progress = item.question_count
    ? Math.min(
        100,
        Math.round((item.answered_count / item.question_count) * 100)
      )
    : 0;

  const primaryLabel =
    item.status === "submitted" ? "Natijani ko‘rish" : "Davom etish";
  const primaryHref =
    item.status === "submitted"
      ? TEST_RESULT_ROUTE(item.attempt_id, telegramId)
      : TAKE_TEST_ROUTE(item.test_id, telegramId);

  return (
    <div className="rounded-lg border border-neutral-200 p-4 transition hover:shadow-sm dark:border-neutral-800">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {item.test_title}
          </div>
          <div className="mt-0.5 text-xs text-neutral-500">
            Kod: {item.test_code}
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${statusColors}`}
        >
          {item.status}
        </span>
      </div>

      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
          <span>
            {item.answered_count}/{item.question_count} javob berildi
          </span>
          {item.status === "submitted" && <span>Ball: {item.score ?? 0}</span>}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full bg-black dark:bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-neutral-600 dark:text-neutral-300">
        <div>
          <span className="text-neutral-500">Boshlangan:</span>{" "}
          <time dateTime={item.started_at}>
            {new Date(item.started_at).toLocaleString()}
          </time>
        </div>
        {item.submitted_at && (
          <div>
            <span className="text-neutral-500">Yuborilgan:</span>{" "}
            <time dateTime={item.submitted_at}>
              {new Date(item.submitted_at).toLocaleString()}
            </time>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => router.push(primaryHref)}
          className="inline-flex flex-1 items-center justify-center rounded-md bg-black px-3 py-1.5 text-sm text-white active:opacity-80 dark:bg-white dark:text-black"
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push(VIEW_TEST_ROUTE(item.test_id, telegramId))}
          aria-label="Testni ko‘rish"
          className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50 active:opacity-80 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Testni ko‘rish
        </button>
      </div>
    </div>
  );
}
