"use client";

import { MyResultItem } from "../actions";
import MyResultCard from "./MyResultCard";

export default function MyResultsList({
  items,
  isLoading,
  onLoadMore,
  hasMore,
}: {
  items: MyResultItem[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}) {
  if (isLoading && (!items || items.length === 0)) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
          />
        ))}
      </div>
    );
  }

  if (!isLoading && (!items || items.length === 0)) {
    return (
      <div className="rounded border border-neutral-200 p-6 text-center text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
        No results yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((it) => (
        <MyResultCard key={it.attempt_id} item={it} />
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="col-span-full mt-2 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-neutral-50 active:opacity-80 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Load more
        </button>
      )}
    </div>
  );
}
