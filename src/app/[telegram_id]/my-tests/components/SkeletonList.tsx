"use client";

export default function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <ul className="space-y-3" role="status" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="animate-pulse rounded border p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="w-full">
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-24 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-32 rounded bg-gray-200" />
            </div>
            <div className="h-5 w-16 rounded bg-gray-200" />
          </div>
          <div className="mt-3 flex gap-2">
            <div className="h-8 w-24 rounded bg-gray-200" />
            <div className="h-8 w-32 rounded bg-gray-200" />
          </div>
        </li>
      ))}
    </ul>
  );
}
