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
      <main className="mx-auto w-full max-w-3xl p-4">
        <Header isFetching={true} onRefetch={() => refetch()} />
        <SkeletonList count={6} />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4">
        <Header isFetching={isFetching} onRefetch={() => refetch()} />
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Testlarni yuklashda xatolik. Iltimos, qayta urinib ko‘ring.
          <button
            onClick={() => refetch()}
            className="ml-3 inline-flex rounded border border-red-300 bg-white px-3 py-1 text-xs text-red-700"
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
      <main className="mx-auto w-full max-w-3xl p-4">
        <Header isFetching={isFetching} onRefetch={() => refetch()} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-4">
      <Header isFetching={isFetching} onRefetch={() => refetch()} />

      <ul className="space-y-3">
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
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Mening testlarim</h1>
        <button
          onClick={onRefetch}
          className="rounded border p-1 text-xs"
          aria-label="Testlarni qayta olish"
        >
          <RefreshCcwIcon
            className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
