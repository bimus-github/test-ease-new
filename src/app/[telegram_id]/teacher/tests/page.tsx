"use client";

import { Header } from "./components/Header";
import SkeletonList from "./components/SkeletonList";
import TestListItem from "./components/TestListItem";
import { useTestsOfTeacher } from "./hooks";

function Tests() {
    const { isLoading, isError, refetch, isFetching, data } = useTestsOfTeacher()
    
    if (isLoading || isFetching) {
        return (
          <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
            <Header isFetching={isFetching} onRefetch={() => refetch()} />
            <SkeletonList count={6} />
          </main>
        );
      }
    
      if (isError) {
        return (
          <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
            <Header isFetching={isFetching} onRefetch={() => refetch()} />
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30">
              Testlarni yuklashda xatolik. Iltimos, qayta urinib ko‘ring.
              <button
                onClick={() => refetch()}
                className="ml-3 inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-3 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-transparent dark:hover:bg-red-900/20"
              >
                Qayta urinish
              </button>
            </div>
          </main>
        );
      }
    
      const tests = data || [];
    
      if (tests.length === 0) {
        return (
          <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
            <Header isFetching={isFetching} onRefetch={() => refetch()} />
            <div className="mt-4 flex flex-col items-center justify-center rounded-md border border-neutral-200 p-8 text-center text-sm text-neutral-600 dark:border-neutral-800">
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
                Hozircha testlar yo‘q
              </p>
              <p className="mt-1 max-w-sm text-xs text-neutral-500">
                Yangi test yarating yoki mavjud testlaringizni yangilang.
              </p>
            </div>
          </main>
        );
      }

      return (
        <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
          <Header isFetching={isFetching} onRefetch={() => refetch()} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((t) => <TestListItem key={t.id} test={t} />)}
          </ul>
        </main>
      );
}

export default Tests