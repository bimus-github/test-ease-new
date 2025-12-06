"use client";

export default function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <ul
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="animate-pulse rounded-md border border-neutral-200 p-4 shadow-sm dark:border-neutral-800"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-full">
              <div className="h-4 w-40 rounded bg-neutral-100 dark:bg-neutral-900" />
              <div className="mt-2 h-3 w-24 rounded bg-neutral-100 dark:bg-neutral-900" />
              <div className="mt-2 h-3 w-32 rounded bg-neutral-100 dark:bg-neutral-900" />
            </div>
            <div className="h-5 w-16 rounded bg-neutral-100 dark:bg-neutral-900" />
          </div>
          <div className="mt-3 flex gap-2">
            <div className="h-8 w-24 rounded bg-neutral-100 dark:bg-neutral-900" />
            <div className="h-8 w-32 rounded bg-neutral-100 dark:bg-neutral-900" />
          </div>
        </li>
      ))}
    </ul>
  );
}
