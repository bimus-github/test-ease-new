"use client";

import { ErrorBoundary } from "./ErrorBoundary";

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  pageName?: string;
}

export function PageErrorBoundary({
  children,
  pageName = "Sahifa",
}: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      showToast={true}
      fallback={
        <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
          <div className="rounded-md border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/30">
            <h2 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-100">
              {pageName} yuklanmadi
            </h2>
            <p className="mb-4 text-sm text-red-700 dark:text-red-300">
              Xatolik yuz berdi. Iltimos, sahifani yangilang yoki boshqa
              sahifaga o'ting.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 active:scale-[0.99]"
            >
              Sahifani yangilash
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
