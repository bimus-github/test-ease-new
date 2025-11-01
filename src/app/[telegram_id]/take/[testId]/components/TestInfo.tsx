"use client";

import { TestWithQuestions } from "@/types/test";

export default function TestInfo({
  isLoading,
  test,
  telegramId,
  onStart,
  isEnded,
}: {
  isLoading: boolean;
  test?: TestWithQuestions | null;
  telegramId: string;
  onStart: () => void;
  isEnded?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded border p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 h-10 w-32 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="rounded border p-6">
        <div className="text-sm text-neutral-600">Test topilmadi.</div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold">{test.title}</h1>
        <div className="text-sm text-neutral-600">Kod: {test.code}</div>
      </div>
      {test.description && (
        <p className="text-sm text-neutral-700">{test.description}</p>
      )}
      {test.instructions && (
        <p className="text-sm text-neutral-600">{test.instructions}</p>
      )}
      {test.end_date && (
        <div className="text-xs text-neutral-500">
          Tugash vaqti: {new Date(test.end_date).toLocaleString()}
        </div>
      )}
      {isEnded && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Test yakunlangan. Endi javoblarni o‘zgartira olmaysiz.
        </div>
      )}
      <div>
        <button
          onClick={onStart}
          disabled={isEnded}
          className="rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90 active:opacity-80 dark:bg-white dark:text-black"
        >
          Testni boshlash
        </button>
      </div>
    </div>
  );
}
