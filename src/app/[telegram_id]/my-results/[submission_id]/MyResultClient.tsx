"use client";

import { useParams } from "next/navigation";
import { Timing } from "@/app/[telegram_id]/take/[testId]/components/submitted/Timing";
import { Meta } from "@/app/[telegram_id]/take/[testId]/components/submitted/Meta";
import { Analysis } from "@/app/[telegram_id]/take/[testId]/components/submitted/Analysis";
import Link from "next/link";
import { MY_RESULTS_ROUTE } from "@/constants/routes";
import { useGetFullSubmission } from "../../take/[testId]/hooks/useSubmission";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { DetailsSkeleton } from "./components/DetailsSkeleton";
import { RaschResultsCard } from "./components/RaschResultsCard";

export default function MyResultClient() {
  const { telegram_id, submission_id } = useParams<{
    telegram_id: string;
    submission_id: string;
  }>();

  const { data, isLoading, isError, refetch } =
    useGetFullSubmission(submission_id);

  if (!submission_id) return null;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Natijam</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Yuklanmoqda…</p>
          </div>
          <LoadingSpinner />
        </div>
        <DetailsSkeleton />
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Natija topilmadi</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Xatolik yuz berdi</p>
          </div>
          <div className="flex items-center gap-2">
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
            <Link
              href={MY_RESULTS_ROUTE(telegram_id)}
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
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30">
          Yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring yoki orqaga
          qayting.
        </div>
      </main>
    );
  }

  const fullSubmission = data;

  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold">Natijam</h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            To‘liq topshiriq tahlili
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            Yangilash
          </button>
          <Link
            href={MY_RESULTS_ROUTE(telegram_id)}
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

      <section className="grid gap-4">
        <div className="rounded-md border border-neutral-200 p-4 shadow-sm dark:border-neutral-800">
          <Timing
            startedAt={fullSubmission.started_at}
            submittedAt={fullSubmission.submitted_at}
            scoringType={fullSubmission.test.scoring_type}
          />
        </div>

        <Meta user={fullSubmission.user} test={fullSubmission.test} />

        <RaschResultsCard fullSubmission={fullSubmission} />

        <Analysis fullSubmission={fullSubmission} />
      </section>
    </main>
  );
}
