"use client";

export function AttemptsSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="h-6 w-48 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
      <div className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="mb-2 h-4 w-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
        <div className="space-y-2">
          <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900"
            />
          ))}
        </div>
      </div>
      <div className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="h-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
      </div>
    </div>
  );
}
