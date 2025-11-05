"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { takeActions } from "@/store/slices/take";
import {
  useCheckSubmission,
  useStartSubmission,
  useSubmitSubmission,
} from "@/app/[telegram_id]/take/[testId]/hooks/useSubmission";
import { MY_TESTS_ROUTE } from "@/constants/routes";
import { getTestWithQuestionsAction } from "@/app/[telegram_id]/view-test/[testId]/actions";
import { Header } from "./components/Header";
import { ConfirmStart } from "./components/ConfirmStart";
import { Answering } from "./components/Answering";
import { Preview } from "./components/Preview";
import { Submitted } from "./components/Submitted";
import { useEffect } from "react";

export default function TakeClient() {
  const { telegram_id, testId } = useParams<{
    telegram_id: string;
    testId: string;
  }>();
  const checkSubmission = useCheckSubmission();
  const dispatch = useAppDispatch();
  const step = useAppSelector((s) => s.take.step);
  const answers = useAppSelector((s) => s.take.answers);
  const submissionId = useAppSelector((s) => s.take.submissionId);
  const startedAt = useAppSelector((s) => s.take.startedAt);

  const {
    data: test,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["take-test", testId],
    queryFn: () => getTestWithQuestionsAction(testId),
    enabled: Boolean(testId),
  });

  const startMutation = useStartSubmission();
  const submitMutation = useSubmitSubmission();

  useEffect(() => {
    if (testId && telegram_id) {
      checkSubmission.mutate({
        testId,
        telegramId: telegram_id,
      });
    }
  }, [testId, telegram_id]);

  if (!testId) return null;

  if (isLoading || checkSubmission.isPending) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">Yuklanmoqda…</main>
    );
  }

  if (isError || !test) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Test topilmadi</h2>
          <Link
            href={MY_TESTS_ROUTE(telegram_id)}
            className="rounded border px-2.5 py-1 text-xs"
          >
            Orqaga
          </Link>
        </div>
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Yuklashda xatolik.{" "}
          <button onClick={() => refetch()} className="ml-2 underline">
            Qayta urinish
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <Header
        title={test.title}
        telegramId={telegram_id}
        isFetching={isFetching}
      />

      {step === "overview" && (
        <ConfirmStart
          questionCount={test.questions.length}
          endDate={test.end_date}
          isStarting={startMutation.isPending}
          onStart={async () => {
            await startMutation.mutateAsync({
              telegramId: telegram_id,
              testId: testId,
            });
            // store started time locally for display
            dispatch(
              takeActions.setMeta({
                startedAt: new Date().toISOString(),
              })
            );
            dispatch(takeActions.setStep("answering"));
          }}
        />
      )}

      {step === "answering" && (
        <Answering
          questions={test.questions}
          startDate={startedAt}
          endDate={test.end_date}
          onPreview={() => dispatch(takeActions.setStep("preview"))}
        />
      )}

      {step === "preview" && (
        <Preview
          questions={test.questions}
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

// components moved to ./components/* for readability
