"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMyResultsAction } from "./actions";
import type { FullSubmission } from "@/types/submission";
import { TEST_RESULT_ROUTE } from "@/constants/routes";
import { ScoringType } from "@/types/test";

export default function MyResultsClient() {
  const { telegram_id } = useParams<{
    telegram_id: string;
  }>();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["my-results", telegram_id],
    queryFn: async () => {
      const res = await getMyResultsAction({ telegramId: telegram_id });
      if (!res.ok) {
        throw new Error(res.error);
      }
      return res.submissions;
    },
    enabled: Boolean(telegram_id),
  });

  const submissions = (data || []) as FullSubmission[];

  if (!telegram_id) return null;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">Yuklanmoqda…</main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Natijalarim</h2>
          <span className="text-xs text-neutral-500">
            {isFetching ? "Yangilanmoqda…" : ""}
          </span>
        </div>
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Yuklashda xatolik.
          <button onClick={() => refetch()} className="ml-2 underline">
            Qayta urinish
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Natijalarim</h2>
        <span className="text-xs text-neutral-500">
          {isFetching ? "Yangilanmoqda…" : ""}
        </span>
      </div>

      <MyResultsList submissions={submissions} telegramId={telegram_id} />
    </main>
  );
}

function MyResultsList({
  submissions,
  telegramId,
}: {
  submissions: FullSubmission[];
  telegramId: string;
}) {
  if (!submissions?.length) {
    return (
      <div className="rounded border border-neutral-200 p-4 text-sm text-neutral-600 dark:border-neutral-800">
        Hali natijalar yo'q. Test topshiring va natijalaringizni bu yerda
        ko'ring.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {/* Desktop Table */}
      <div className="hidden w-full overflow-x-auto rounded border border-neutral-200 dark:border-neutral-800 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs dark:bg-neutral-900">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Test nomi</th>
              <th className="px-3 py-2">Test turi</th>
              <th className="px-3 py-2">Yuborilgan</th>
              <th className="px-3 py-2">To'g'ri javoblar</th>
              <th className="px-3 py-2">Rasch bali</th>
              <th className="px-3 py-2">Amal</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s, i) => {
              const hasRasch =
                s.test.scoring_type === ScoringType.RASCH_SCORING &&
                s.test.isRaschCalculated;
              return (
                <tr
                  key={s.id}
                  className="border-t border-neutral-200 dark:border-neutral-800"
                >
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{s.test.title}</div>
                    <div className="text-xs text-neutral-500">
                      {s.test.code}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {s.test.scoring_type === ScoringType.RASCH_SCORING
                      ? "Rasch"
                      : "Oddiy"}
                  </td>
                  <td className="px-3 py-2">
                    {new Date(s.submitted_at ?? "").toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    {s.row_score ?? "—"}/{s.questions.length}
                  </td>
                  <td className="px-3 py-2">
                    {hasRasch
                      ? s.rasch_score != null
                        ? s.rasch_score
                        : "—"
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <a
                      href={TEST_RESULT_ROUTE(s.id, telegramId)}
                      className="inline-flex items-center rounded border px-2 py-1"
                    >
                      Ko‘rish
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {submissions.map((s, i) => {
          const hasRasch =
            s.test.scoring_type === ScoringType.RASCH_SCORING &&
            s.test.isRaschCalculated;
          return (
            <div
              key={s.id}
              className="rounded border border-neutral-200 p-3 text-sm dark:border-neutral-800"
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="font-medium">#{i + 1}</div>
                <a
                  href={TEST_RESULT_ROUTE(s.id, telegramId)}
                  className="rounded border px-2 py-1 text-xs"
                >
                  Ko‘rish
                </a>
              </div>
              <div className="mb-1 font-medium">{s.test.title}</div>
              <div className="mb-2 text-xs text-neutral-500">{s.test.code}</div>
              <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-neutral-500">
                <div>
                  Test turi:{" "}
                  {s.test.scoring_type === ScoringType.RASCH_SCORING
                    ? "Rasch"
                    : "Oddiy"}
                </div>
                <div>
                  Yuborilgan: {new Date(s.submitted_at ?? "").toLocaleString()}
                </div>
                <div>
                  To'g'ri javoblar: {s.row_score ?? "—"}/{s.questions.length}
                </div>
                <div>
                  Rasch:{" "}
                  {hasRasch
                    ? s.rasch_score != null
                      ? s.rasch_score
                      : "—"
                    : "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
