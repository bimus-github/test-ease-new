'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useFullSubmission } from "../../../hooks";
import { DetailsSkeleton } from "./components/DetailsSkeleton";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { Timing } from "./components/Timing";
import { Meta } from "./components/Meta";
import { ScoreSummary } from "./components/ScoreSummary";
import { RaschResults } from "./components/RaschResults";
import { Analysis } from "./components/Analysis";
import { TEST_ATTEMPTS_ROUTE } from "@/constants/routes";

export default function Page() {
  const { telegram_id, testId } = useParams<{
    telegram_id: string;
    testId: string;
  }>();
  const fullSubmissionQuery = useFullSubmission();

  const isLoading = fullSubmissionQuery.isLoading;
  const isError = fullSubmissionQuery.isError;
  const fullSubmission = fullSubmissionQuery.data;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Urinish natijasi</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Yuklanmoqda…</p>
          </div>
          <LoadingSpinner />
        </div>
        <DetailsSkeleton />
      </main>
    );
  }

  if (isError || !fullSubmission) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Natija topilmadi</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Xatolik yuz berdi</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fullSubmissionQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
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
            <Link
              href={TEST_ATTEMPTS_ROUTE({ testId, telegramId: telegram_id })}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
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
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30">
          Yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring yoki orqaga qayting.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold">Urinish natijasi</h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            Talaba: {fullSubmission.user.telegram_first_name} {fullSubmission.user.telegram_last_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fullSubmissionQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3.172 7a8 8 0 111.414 8.485l1.414-1.414A6 6 0 1010 4v2.5a.5.5 0 01-.8.4L5.6 4.8a.5.5 0 010-.8L9.2.8A.5.5 0 0110 .4V3a8 8 0 00-6.828 4z" />
            </svg>
            Yangilash
          </button>
          <Link
            href={TEST_ATTEMPTS_ROUTE({ testId, telegramId: telegram_id })}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
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

      <section className="grid gap-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <Timing
            startedAt={fullSubmission.started_at}
            submittedAt={fullSubmission.submitted_at}
            scoringType={fullSubmission.test.scoring_type}
          />
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <Meta user={fullSubmission.user} test={fullSubmission.test} />
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <ScoreSummary fullSubmission={fullSubmission} />
        </div>

        <RaschResults fullSubmission={fullSubmission} />

        <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-4">
          <Analysis fullSubmission={fullSubmission} />
        </div>
      </section>
    </main>
  );
}