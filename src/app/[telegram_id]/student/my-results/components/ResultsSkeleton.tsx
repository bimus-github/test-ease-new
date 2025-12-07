"use client";

export function ResultsSkeleton() {
  return (
    <div className="grid gap-4">
      {/* Desktop Table Skeleton */}
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
      {/* Mobile Cards Skeleton */}
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

