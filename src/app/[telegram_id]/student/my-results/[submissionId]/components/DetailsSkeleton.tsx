"use client";

export function DetailsSkeleton() {
  return (
    <div className="grid gap-4">
      {/* Timing Skeleton */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="mb-2 h-3 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
            <div className="h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
          </div>
          <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="mb-2 h-3 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
            <div className="h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
          </div>
        </div>
      </div>

      {/* Meta Skeleton */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 h-5 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
              <div className="mb-2 h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
            </div>
            <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
              <div className="mb-2 h-3 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
              <div className="mb-2 h-3 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
              <div className="h-4 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
            </div>
            <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
              <div className="mb-2 h-3 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
            </div>
          </div>
        </div>
      </div>

      {/* ScoreSummary Skeleton */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border-2 border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50"
            >
              <div className="mb-2 h-3 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
              <div className="mb-1 h-8 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
              <div className="h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Skeleton */}
      <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-5 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
          <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
        <div className="grid gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                <div className="h-5 w-16 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
              </div>
              <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

