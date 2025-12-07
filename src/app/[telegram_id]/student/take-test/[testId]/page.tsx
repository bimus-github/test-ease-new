'use client';

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { takeActions } from "@/store/slices/take";
import { useCheckSubmission, useGetTest, useStartSubmission, useSubmitSubmission } from "./hooks";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MY_TESTS_ROUTE } from "@/constants/routes";
import { Header } from "./components/Header";
import { ConfirmStart } from "./components/ConfirmStart";
import { Answering } from "./components/Answering";
import { Preview } from "./components/Preview";
import { Submitted } from "./components/Submitted";

export default function Page() {
  const { testId, telegram_id } = useParams<{ testId: string, telegram_id: string }>();
  const dispatch = useAppDispatch();
  const step = useAppSelector((s) => s.take.step);
  const answers = useAppSelector((s) => s.take.answers);
  const submissionId = useAppSelector((s) => s.take.submissionId);
  const startedAt = useAppSelector((s) => s.take.startedAt);

  const testMetaQuery = useGetTest();
  const startMutation = useStartSubmission();
  const submitMutation = useSubmitSubmission();
  const checkSubmission = useCheckSubmission();

  const isLoading = checkSubmission.isPending || testMetaQuery.isLoading;
  const isError = checkSubmission.isError || testMetaQuery.isError;
  const test = testMetaQuery.data;

  const refetch = () => {
    testMetaQuery.refetch();
  };

  useEffect(() => {
    if (testId && telegram_id) {
      checkSubmission.mutate({
        testId,
        telegramId: telegram_id,
      });
    }
  }, [testId, telegram_id]);

  if (!testId) return null;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900 dark:border-neutral-800 dark:border-t-neutral-100"></div>
          <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Yuklanmoqda…
          </div>
        </div>
      </main>
    );
  }

  if (isError || !test) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Test topilmadi
          </h2>
          <Link
            href={MY_TESTS_ROUTE(telegram_id)}
            className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Orqaga
          </Link>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30">
          <div className="mb-2 font-medium">Yuklashda xatolik yuz berdi.</div>
          <button
            onClick={refetch}
            className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 active:scale-[0.98] dark:border-red-700 dark:bg-neutral-900 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            Qayta urinish
          </button>
        </div>
      </main>
    );
  }

  // Validate test has questions
  if (!test.questions || test.questions.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <Header
          title={test.title}
          telegramId={telegram_id}
          isFetching={testMetaQuery.isFetching}
        />
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="font-medium">Bu testda hozircha savollar yo'q.</div>
          <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            Iltimos, keyinroq qayta urinib ko'ring.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <Header
        title={test.title}
        telegramId={telegram_id}
        isFetching={testMetaQuery.isFetching}
      />

      {step === "overview" && (
        <ConfirmStart
          questionCount={test.questions.length}
          endDate={test.end_date}
          scoringType={test.scoring_type}
          satSection={test.sat_section}
          isStarting={startMutation.isPending}
          onStart={async () => {
            await startMutation.mutateAsync({
              telegramId: telegram_id,
              testId: testId,
            });
          }}
        />
      )}

      {step === "answering" && (
        <Answering
          questions={test.questions}
          scoringType={test.scoring_type}
          startDate={startedAt}
          endDate={test.end_date}
          onPreview={() => dispatch(takeActions.setStep("preview"))}
        />
      )}

      {step === "preview" && (
        <Preview
          questions={test.questions}
          scoringType={test.scoring_type}
          isSubmitting={submitMutation.isPending}
          onBack={() => dispatch(takeActions.setStep("answering"))}
          onSubmit={async () => {
            if (!submissionId) return;
            await submitMutation.mutateAsync({
              submissionId,
              answers,
            });
          }}
        />
      )}

      {step === "submit" && <Submitted />}
    </main>
  );
}