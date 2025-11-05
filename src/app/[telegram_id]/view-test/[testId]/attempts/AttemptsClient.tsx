"use client";

import { useParams } from "next/navigation";
import { useFullSubmissions } from "./hooks";
import { VIEW_TEST_ROUTE, TEST_ATTEMPT_ROUTE } from "@/constants/routes";
import type { FullSubmission } from "@/types/submission";
import SubmissionsTable from "./components/SubmissionsTable";
import { useState, useMemo } from "react";
import { calculateRaschAction } from "./actions";
import { AttemptsHeader } from "./components/AttemptsHeader";
import { AttemptsInfoCard } from "./components/AttemptsInfoCard";
import { AttemptsSkeleton } from "./components/AttemptsSkeleton";
import { exportSubmissionsToExcel } from "./utils/exportToExcel";
import { sendExcelViaTelegramAction } from "./actions";
import toast from "react-hot-toast";

export default function AttemptsClient() {
  const { telegram_id, testId } = useParams<{
    telegram_id: string;
    testId: string;
  }>();
  const { data, isLoading, isError, refetch, isFetching } =
    useFullSubmissions(testId);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSendingExcel, setIsSendingExcel] = useState(false);

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
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <AttemptsSkeleton />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <AttemptsHeader
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
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30">
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
      <AttemptsHeader
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

      {testMeta && (
        <AttemptsInfoCard
          code={testMeta.code}
          description={testMeta.description}
          endDate={testMeta.end_date ?? undefined}
          stats={[
            { label: "Urinishlar", value: submissions.length },
            { label: "Savollar soni", value: questionCount.toString() ?? "—" },
            {
              label: "O‘rtacha to'g'ri topilgan",
              value: submissions.length
                ? Math.round(
                    (submissions.reduce((a, s) => a + (s.row_score || 0), 0) /
                      submissions.length) *
                      10
                  ) / 10
                : "—",
            },
            {
              label: "Rasch holati",
              value: testMeta.isRaschCalculated ? "Hisoblangan" : "-",
            },
          ]}
        />
      )}

      {submissions.length === 0 ? (
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
            Hozircha urinishlar yo‘q
          </p>
          <p className="mt-1 max-w-sm text-xs text-neutral-500">
            Talabalar testni topshirgach, ro‘yxat bu yerda ko‘rinadi.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-medium">Urinishlar ro'yxati</h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    setIsSendingExcel(true);
                    const result = await sendExcelViaTelegramAction({
                      testId,
                      telegramId: telegram_id,
                    });
                    if (result.ok) {
                      toast.success("Excel fayl Telegram orqali yuborildi!");
                    } else {
                      toast.error(result.error || "Xatolik yuz berdi");
                    }
                  } catch (error) {
                    toast.error("Excel faylni yuborishda xatolik yuz berdi");
                  } finally {
                    setIsSendingExcel(false);
                  }
                }}
                disabled={isSendingExcel}
                className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                {isSendingExcel ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    Telegram orqali yuborish
                  </>
                )}
              </button>
              <button
                onClick={() =>
                  exportSubmissionsToExcel(
                    submissions,
                    testMeta?.title || "Test",
                    Boolean(testMeta?.isRaschCalculated)
                  )
                }
                className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Excel formatida yuklab olish
              </button>
            </div>
          </div>
          <SubmissionsTable
            submissions={submissions}
            showRasch={Boolean(testMeta?.isRaschCalculated)}
            renderResultLink={(submissionId) =>
              TEST_ATTEMPT_ROUTE(telegram_id ?? "", testId, submissionId)
            }
          />
        </>
      )}
    </main>
  );
}
