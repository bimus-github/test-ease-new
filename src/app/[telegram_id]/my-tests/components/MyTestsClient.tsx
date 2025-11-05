"use client";

import { useQuery } from "@tanstack/react-query";
import { Test } from "@/types/test";
import toast from "react-hot-toast";
import SkeletonList from "./SkeletonList";
import TestListItem from "./TestListItem";
import { getTestsByTeacherAction } from "../actions";
import { useParams } from "next/navigation";
import { RefreshCcwIcon } from "lucide-react";

export default function MyTestsClient() {
  const { telegram_id: telegramId } = useParams<{ telegram_id: string }>();
  const { data, isLoading, isError, refetch, isFetching } = useQuery<Test[]>({
    queryKey: ["my-tests", telegramId],
    queryFn: () => getTestsByTeacherAction(telegramId),
  });

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <Header isFetching={true} onRefetch={() => refetch()} />
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
        {tests.map((t) => (
          <TestListItem
            key={t.id}
            test={t}
            onCopyCode={async (code) => {
              await navigator.clipboard.writeText(code);
              toast.success("Kod nusxalandi");
            }}
          />
        ))}
      </ul>
    </main>
  );
}

function Header({
  isFetching,
  onRefetch,
}: {
  isFetching: boolean;
  onRefetch: () => void;
}) {
  return (
    <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-xl font-semibold">Mening testlarim</h1>
        <p className="mt-0.5 text-xs text-neutral-500">
          Yaratgan testlaringiz ro‘yxati
        </p>
      </div>
      <button
        onClick={onRefetch}
        className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
        aria-label="Testlarni qayta olish"
      >
        <RefreshCcwIcon
          className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
        />
        Yangilash
      </button>
    </div>
  );
}
