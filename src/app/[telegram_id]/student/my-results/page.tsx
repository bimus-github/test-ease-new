'use client';

import { useMyResults } from './hooks';
import { ResultsList } from './components/ResultsList';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ResultsSkeleton } from './components/ResultsSkeleton';
import { useParams } from 'next/navigation';

export default function Page() {
  const { telegram_id } = useParams<{ telegram_id: string }>();
  const { data: submissions, isLoading, isError, refetch, isFetching } = useMyResults();

  if (!telegram_id) return null;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Natijalarim
            </h2>
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
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Natijalarim
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">Xatolik yuz berdi</p>
          </div>
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
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30">
          Yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Natijalarim
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            O'tkazilgan test topshiriqlari va natijalaringiz
          </p>
        </div>
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
      </div>

      <ResultsList submissions={submissions || []} telegramId={telegram_id} />
    </main>
  );
}
