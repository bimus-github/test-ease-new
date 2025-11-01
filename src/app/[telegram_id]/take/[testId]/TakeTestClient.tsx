"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  useGetExistingAttempt,
  useGetTestWithQuestions,
  useSaveAnswers,
  useSubmitAttempt,
  useStartAttempt,
} from "./hooks";
import TestInfo from "./components/TestInfo";
import PreviewAnswers from "./components/PreviewAnswers";
import ConfirmBar from "./components/ConfirmBar";
import ConfirmPage from "./components/ConfirmPage";
import { AnswerForm } from "@/types/answer";
import { TEST_RESULT_ROUTE } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { takeAttemptActions } from "@/store/slices/takeAttempt";
import AnswerList from "./components/AnswerList";

export default function TakeTestClient() {
  const { telegram_id: telegramId, testId } = useParams<{
    telegram_id: string;
    testId: string;
  }>();
  const router = useRouter();

  const dispatch = useAppDispatch();
  const step = useAppSelector((s) => s.takeAttempt.step);
  const answers = (useAppSelector((s) => s.takeAttempt.answers) ??
    []) as AnswerForm[];

  const testQuery = useGetTestWithQuestions(testId);
  const attemptQuery = useGetExistingAttempt(testId, telegramId);
  const startAttempt = useStartAttempt(testId, telegramId);
  const saveAnswers = useSaveAnswers();
  const submitAttempt = useSubmitAttempt();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isEnded = useMemo(() => {
    if (!testQuery.data?.end_date) return false;
    return new Date(testQuery.data.end_date) < new Date();
  }, [testQuery.data?.end_date]);

  // Route step based on attempt flags and test end
  useEffect(() => {
    if (!testQuery.isSuccess || !attemptQuery.isSuccess) return;
    const a = attemptQuery.attempt;

    if (attemptQuery.isSubmitted && a) {
      router.replace(TEST_RESULT_ROUTE(a.id, telegramId));
      return;
    }

    if (isEnded) {
      if (attemptQuery.isStarted) {
        dispatch(takeAttemptActions.setStep("confirm"));
      } else {
        dispatch(takeAttemptActions.setStep("info"));
      }
      return;
    }

    if (attemptQuery.isStarted) {
      dispatch(takeAttemptActions.setStep("answer"));
      return;
    }

    dispatch(takeAttemptActions.setStep("info"));
  }, [
    testQuery.isSuccess,
    attemptQuery.isSuccess,
    attemptQuery.isSubmitted,
    attemptQuery.isStarted,
    attemptQuery.attempt,
    isEnded,
    router,
    telegramId,
    dispatch,
  ]);

  const test = testQuery.data;
  const attempt = attemptQuery.data;

  const unansweredQuestions = useMemo(() => {
    const byQ = new Map(answers.map((a) => [a.question_id, a]));

    const unansweredLabels = test?.questions
      .filter((q) => {
        const a = byQ.get(q.id);
        if (!a) return true;
        if (q.question_type === "fill_blank") {
          return !a.answer_text || !a.answer_text.trim();
        }
        if (q.is_multiple_answers) {
          const arr = (a.selected_options as unknown as string[]) || [];
          return !Array.isArray(arr) || arr.length === 0;
        }
        return !a.answer_text || !String(a.answer_text).trim();
      })
      .map((q) => q.question_label);

    return unansweredLabels ?? [];
  }, [answers, test?.questions]);

  function handleStart() {
    // If attempt exists and started, just proceed
    if (attempt && attempt.status === "started") {
      dispatch(takeAttemptActions.setStep("answer"));
      return;
    }
    if (window.confirm("Testni boshlamoqchisiz. Davom etasizmi?")) {
      startAttempt.mutate(undefined, {
        onSuccess: () => dispatch(takeAttemptActions.setStep("answer")),
      });
    }
  }

  function handleContinueToPreview() {
    if (unansweredQuestions.length > 0) return;
    const forms = answers ?? [];
    if (forms.length === 0) {
      dispatch(takeAttemptActions.setStep("preview"));
      return;
    }
    saveAnswers.mutate(
      { answers: forms, attemptId: attempt!.id },
      {
        onSuccess: () => dispatch(takeAttemptActions.setStep("preview")),
      }
    );
  }

  function handleSubmit() {
    if (!attempt) return;
    submitAttempt.mutate(
      { attemptId: attempt.id },
      {
        onSuccess: (res) => {
          const id = attempt.id;
          // reset take state to avoid stale data
          dispatch(takeAttemptActions.reset());
          router.replace(TEST_RESULT_ROUTE(id, telegramId));
        },
      }
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      {/* Step content */}
      {step === "info" && (
        <TestInfo
          isLoading={testQuery.isLoading || attemptQuery.isLoading}
          test={test}
          telegramId={telegramId}
          onStart={handleStart}
          isEnded={isEnded}
        />
      )}

      {step === "answer" && test && mounted && (
        <AnswerList
          questions={test.questions}
          answers={answers}
          startedAt={attempt?.created_at}
          endsAt={test.end_date}
          unansweredQuestions={unansweredQuestions}
        />
      )}

      {step === "preview" && test && (
        <PreviewAnswers test={test} answers={answers} />
      )}

      {step === "confirm" && test && (
        <ConfirmPage test={test} answers={answers} />
      )}

      {/* Bottom actions */}
      <ConfirmBar
        step={step}
        canContinue={
          step === "answer"
            ? unansweredQuestions.length === 0 && !saveAnswers.isPending
            : true
        }
        isSubmitting={submitAttempt.isPending || startAttempt.isPending}
        isEnded={isEnded}
        hasDraftAttempt={Boolean(attemptQuery.isStarted)}
        onBack={() =>
          dispatch(
            takeAttemptActions.setStep(
              step === "answer"
                ? "info"
                : step === "preview"
                ? "answer"
                : step === "confirm"
                ? "preview"
                : "info"
            )
          )
        }
        onNext={() =>
          step === "info"
            ? handleStart()
            : step === "answer"
            ? handleContinueToPreview()
            : dispatch(takeAttemptActions.setStep("confirm"))
        }
        onConfirm={() => (step === "confirm" ? handleSubmit() : undefined)}
      />
    </div>
  );
}
