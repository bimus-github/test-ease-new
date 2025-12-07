'use client';

import { useMyResult } from './hooks';
import { LoadingSpinner } from './components/LoadingSpinner';
import { DetailsSkeleton } from './components/DetailsSkeleton';
import { Timing } from '../../take-test/[testId]/components/submitted/Timing';
import { Meta } from '../../take-test/[testId]/components/submitted/Meta';
import { ScoreSummary } from '../../take-test/[testId]/components/submitted/ScoreSummary';
import { Analysis } from '../../take-test/[testId]/components/submitted/Analysis';
import { MY_RESULTS_ROUTE } from '@/constants/routes';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sendMyResultExcelAction } from './actions';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';

export default function Page() {
  const { telegram_id, submissionId } = useParams<{ telegram_id: string; submissionId: string }>();
  const { data: fullSubmission, isLoading, isError, refetch, isFetching } = useMyResult();

  const sendExcelMutation = useMutation({
    mutationFn: () => sendMyResultExcelAction({ submissionId, telegramId: telegram_id }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success("Excel fayl Telegram orqali yuborildi!");
      } else {
        toast.error(result.error || "Xatolik yuz berdi");
      }
    },
    onError: (error) => {
      console.error("Error sending Excel:", error);
      toast.error("Excel faylni yuborishda xatolik yuz berdi");
    },
  });

  const handleSendExcel = async () => {
    if (!telegram_id || !submissionId) {
      toast.error("Telegram ID yoki Submission ID topilmadi");
      return;
    }
    await sendExcelMutation.mutateAsync();
  };

  if (!submissionId) return null;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Natijam
            </h2>
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
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Natija topilmadi
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">Xatolik yuz berdi</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
              className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30">
          Yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring yoki orqaga qayting.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Natijam
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            To'liq topshiriq tahlili
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSendExcel}
            disabled={sendExcelMutation.isPending || !fullSubmission}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {sendExcelMutation.isPending ? (
              <LoadingSpinner small />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Natijamni telegramdan olish
          </button>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
          <Link
            href={MY_RESULTS_ROUTE(telegram_id)}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
          <Timing
            startedAt={fullSubmission.started_at}
            submittedAt={fullSubmission.submitted_at}
            scoringType={fullSubmission.test.scoring_type}
          />

          <Meta user={fullSubmission.user} test={fullSubmission.test} />

          <ScoreSummary fullSubmission={fullSubmission} />

          <Analysis fullSubmission={fullSubmission} />
      </section>
    </main>
  );
}
