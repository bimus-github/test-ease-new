"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useFullSubmissions } from "./hooks";
import {
  VIEW_TEST_ROUTE,
  TEST_RESULT_ROUTE,
  TAKE_TEST_ROUTE,
  TEST_ATTEMPT_ROUTE,
} from "@/constants/routes";
import type { FullSubmission } from "@/types/submission";
import SubmissionsTable from "./components/SubmissionsTable";
import { useState, useMemo } from "react";
import { calculateRaschAction } from "./actions";

export default function AttemptsClient() {
  const { telegram_id, testId } = useParams<{
    telegram_id: string;
    testId: string;
  }>();
  const { data, isLoading, isError, refetch, isFetching } =
    useFullSubmissions(testId);
  const [isCalculating, setIsCalculating] = useState(false);

  const submissions = (data || []) as FullSubmission[];
  const testMeta = submissions?.[0]?.test;

  const canCalculateRasch = useMemo(() => {
    if (!testMeta) return false;
    const ended = testMeta.end_date
      ? new Date(testMeta.end_date) < new Date()
      : false;
    return ended;
  }, [testMeta]);

  const questionCount = useMemo(() => {
    return submissions[0]?.questions.length ?? 0;
  }, [submissions]);

  if (!testId) return null;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">Yuklanmoqda…</main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <Header
          title={testMeta?.title || "Urinishlar"}
          telegramId={telegram_id}
          testId={testId}
          isFetching={isFetching}
          canCalculateRasch={canCalculateRasch}
          isCalculating={isCalculating}
          endDate={testMeta?.end_date ?? ""}
          onCalculate={async () => {
            try {
              setIsCalculating(true);
              await calculateRaschAction({ testId });
              await refetch();
            } finally {
              setIsCalculating(false);
            }
          }}
        />
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Xatolik yuz berdi.
          <button onClick={() => refetch()} className="ml-2 underline">
            Qayta urinish
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <Header
        title={testMeta?.title || "Urinishlar"}
        telegramId={telegram_id}
        testId={testId}
        isFetching={isFetching}
        canCalculateRasch={canCalculateRasch}
        isCalculating={isCalculating}
        endDate={testMeta?.end_date ?? ""}
        onCalculate={async () => {
          try {
            setIsCalculating(true);
            await calculateRaschAction({ testId });
            await refetch();
          } finally {
            setIsCalculating(false);
          }
        }}
      />

      {/* Test & Submissions Info */}
      {testMeta && (
        <section className="mb-4 grid gap-3 rounded-lg border border-neutral-200 p-4 text-sm dark:border-neutral-800">
          <div className="grid gap-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-medium">Ma’lumot</h3>
              <span className="text-xs text-neutral-500">{testMeta.code}</span>
            </div>
            {testMeta.description && (
              <div className="text-neutral-700 dark:text-neutral-300">
                {testMeta.description}
              </div>
            )}
            {testMeta.end_date && (
              <div className="text-xs text-neutral-500">
                Tugash: {new Date(testMeta.end_date).toLocaleString()}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Urinishlar" value={submissions.length} />
            <Stat
              label="Savollar soni"
              value={questionCount.toString() ?? "—"}
            />
            <Stat
              label="O‘rtacha to'g'ri topilan"
              value={
                submissions.length
                  ? Math.round(
                      (submissions.reduce((a, s) => a + (s.row_score || 0), 0) /
                        submissions.length) *
                        10
                    ) / 10
                  : "—"
              }
            />
            <Stat
              label="Rasch holati"
              value={testMeta.isRaschCalculated ? "Hisoblangan" : "-"}
            />
          </div>
        </section>
      )}

      <SubmissionsTable
        submissions={submissions}
        showRasch={Boolean(testMeta?.isRaschCalculated)}
        renderResultLink={(submissionId) =>
          TEST_ATTEMPT_ROUTE(telegram_id ?? "", testId, submissionId)
        }
      />
    </main>
  );
}

function Header({
  title,
  telegramId,
  testId,
  isFetching,
  canCalculateRasch,
  isCalculating,
  onCalculate,
  endDate,
}: {
  title: string;
  telegramId: string;
  testId: string;
  isFetching: boolean;
  canCalculateRasch: boolean;
  isCalculating: boolean;
  onCalculate: () => Promise<void>;
  endDate: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">{title} • Urinishlar</h2>
        <span className="text-xs text-neutral-500">
          {isFetching ? "Yangilanmoqda…" : ""}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {canCalculateRasch ? (
          <button
            onClick={onCalculate}
            disabled={isCalculating}
            className="rounded bg-black px-3 py-1.5 text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {isCalculating ? "Hisoblanmoqda…" : "Rasch hisoblash"}
          </button>
        ) : (
          // TODO: Add a tooltip that shows the date of the next calculation
          <div className="flex items-center gap-1 text-center border border-gray-200 rounded-md p-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Rasch hisoblash uchun test yakunlanishi kerak.
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(endDate ?? "").toLocaleString()}
            </span>
          </div>
        )}
        <Link
          href={VIEW_TEST_ROUTE(testId, telegramId)}
          className="rounded border px-2.5 py-1"
        >
          Testga qaytish
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-neutral-100 p-3 text-center dark:bg-neutral-900">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
