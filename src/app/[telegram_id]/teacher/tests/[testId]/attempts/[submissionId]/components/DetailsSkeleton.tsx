"use client";

export function DetailsSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="mb-3 h-4 w-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900"
            />
          ))}
        </div>
      </div>
      <div className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="mb-2 h-4 w-28 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-6 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900"
            />
          ))}
        </div>
      </div>
      <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800 sm:p-4">
        <div className="mb-3 h-4 w-32 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
