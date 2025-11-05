"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMyResultsAction } from "./actions";
import type { FullSubmission } from "@/types/submission";
import { TEST_RESULT_ROUTE } from "@/constants/routes";
import { ScoringType } from "@/types/test";

export default function MyResultsClient() {
  const { telegram_id } = useParams<{
    telegram_id: string;
  }>();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["my-results", telegram_id],
    queryFn: async () => {
      const res = await getMyResultsAction({ telegramId: telegram_id });
      if (!res.ok) {
        throw new Error(res.error);
      }
      return res.submissions;
    },
    enabled: Boolean(telegram_id),
  });

  const submissions = (data || []) as FullSubmission[];

  if (!telegram_id) return null;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Natijalarim</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Yuklanmoqda…</p>
          </div>
          <LoadingSpinner />
        </div>
        <ResultsSkeleton />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Natijalarim</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Xatolik yuz berdi</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3.172 7a8 8 0 111.414 8.485l1.414-1.414A6 6 0 1010 4v2.5a.5.5 0 01-.8.4L5.6 4.8a.5.5 0 010-.8L9.2.8A.5.5 0 0110 .4V3a8 8 0 00-6.828 4z" />
            </svg>
            Qayta urinish
          </button>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30">
          Yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold">Natijalarim</h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            O‘tkazilgan test topshiriqlari va natijalaringiz
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          {isFetching ? (
            <LoadingSpinner small />
          ) : (
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3.172 7a8 8 0 111.414 8.485l1.414-1.414A6 6 0 1010 4v2.5a.5.5 0 01-.8.4L5.6 4.8a.5.5 0 010-.8L9.2.8A.5.5 0 0110 .4V3a8 8 0 00-6.828 4z" />
            </svg>
          )}
          Yangilash
        </button>
      </div>

      <MyResultsList submissions={submissions} telegramId={telegram_id} />
    </main>
  );
}

function MyResultsList({
  submissions,
  telegramId,
}: {
  submissions: FullSubmission[];
  telegramId: string;
}) {
  if (!submissions?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-neutral-200 p-8 text-center text-sm text-neutral-600 dark:border-neutral-800">
        <div className="mb-2 rounded-full border border-dashed border-neutral-300 p-3 text-neutral-400 dark:border-neutral-700">
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M3 7h18M3 12h18M3 17h18" />
          </svg>
        </div>
        <p className="text-neutral-700 dark:text-neutral-300">
          Hozircha natijalar yo‘q
        </p>
        <p className="mt-1 max-w-sm text-xs text-neutral-500">
          Test topshiring va natijalaringiz shu yerda paydo bo‘ladi.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Desktop Table */}
      <div className="hidden w-full overflow-x-auto rounded-md border border-neutral-200 shadow-sm dark:border-neutral-800 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs dark:bg-neutral-900">
            <tr>
              <th className="px-3 py-2 font-medium text-neutral-600">#</th>
              <th className="px-3 py-2 font-medium text-neutral-600">
                Test nomi
              </th>
              <th className="px-3 py-2 font-medium text-neutral-600">
                Test turi
              </th>
              <th className="px-3 py-2 font-medium text-neutral-600">
                Yuborilgan
              </th>
              <th className="px-3 py-2 font-medium text-neutral-600">
                To'g'ri javoblar
              </th>
              <th className="px-3 py-2 font-medium text-neutral-600">
                Rasch bali
              </th>
              <th className="px-3 py-2 font-medium text-neutral-600">Amal</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s, i) => {
              const hasRasch =
                s.test.scoring_type === ScoringType.RASCH_SCORING &&
                s.test.isRaschCalculated;
              return (
                <tr
                  key={s.id}
                  className="border-t border-neutral-200 hover:bg-neutral-50/60 dark:border-neutral-800 dark:hover:bg-neutral-900/50"
                >
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{s.test.title}</div>
                    <div className="text-xs text-neutral-500">
                      {s.test.code}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center rounded-full border border-neutral-300 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
                      {s.test.scoring_type === ScoringType.RASCH_SCORING
                        ? "Rasch"
                        : "Oddiy"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {new Date(s.submitted_at ?? "").toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    {s.row_score ?? "—"}/{s.questions.length}
                  </td>
                  <td className="px-3 py-2">
                    {hasRasch
                      ? s.rasch_score != null
                        ? s.rasch_score
                        : "—"
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <a
                      href={TEST_RESULT_ROUTE(s.id, telegramId)}
                      className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                      >
                        <path d="M3 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Ko‘rish
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {submissions.map((s, i) => {
          const hasRasch =
            s.test.scoring_type === ScoringType.RASCH_SCORING &&
            s.test.isRaschCalculated;
          return (
            <div
              key={s.id}
              className="rounded-md border border-neutral-200 p-3 text-sm shadow-sm hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:hover:border-neutral-700"
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="font-medium">#{i + 1}</div>
                <a
                  href={TEST_RESULT_ROUTE(s.id, telegramId)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M3 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Ko‘rish
                </a>
              </div>
              <div className="mb-1 font-medium">{s.test.title}</div>
              <div className="mb-2 text-xs text-neutral-500">{s.test.code}</div>
              <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-neutral-500">
                <div>
                  Test turi:{" "}
                  <span className="ml-1 inline-flex items-center rounded-full border border-neutral-300 px-2 py-0.5 text-[10px] text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
                    {s.test.scoring_type === ScoringType.RASCH_SCORING
                      ? "Rasch"
                      : "Oddiy"}
                  </span>
                </div>
                <div>
                  Yuborilgan: {new Date(s.submitted_at ?? "").toLocaleString()}
                </div>
                <div>
                  To'g'ri javoblar: {s.row_score ?? "—"}/{s.questions.length}
                </div>
                <div>
                  Rasch:{" "}
                  {hasRasch
                    ? s.rasch_score != null
                      ? s.rasch_score
                      : "—"
                    : "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingSpinner({ small = false }: { small?: boolean }) {
  const size = small ? "h-4 w-4" : "h-5 w-5";
  return (
    <svg
      className={`${size} animate-spin text-neutral-500`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="hidden overflow-x-auto rounded-md border border-neutral-200 p-3 dark:border-neutral-800 md:block">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900"
            />
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900"
            />
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800"
          >
            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
            <div className="mb-1 h-4 w-2/3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
            <div className="mb-2 h-3 w-1/3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div
                  key={j}
                  className="h-3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
