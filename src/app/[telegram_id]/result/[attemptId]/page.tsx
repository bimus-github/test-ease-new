"use client";

import { useParams } from "next/navigation";
import { useGetAttemptFull } from "@/app/[telegram_id]/take/[testId]/hooks";
import ResultSummary from "./components/ResultSummary";
import ResultQuestionItem from "./components/ResultQuestionItem";

export default function ResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const q = useGetAttemptFull(attemptId);
  const attempt = q.data;

  if (q.isLoading) {
    return (
      <div className="p-4 text-sm text-neutral-500">Natija yuklanmoqda…</div>
    );
  }
  if (!attempt) {
    return (
      <div className="p-4 text-sm text-neutral-500">Natija topilmadi.</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <ResultSummary attempt={attempt} />

      <div className="mt-4 grid gap-3">
        {attempt.answers.map((a) => (
          <ResultQuestionItem key={a.id} a={a} />
        ))}
      </div>
    </div>
  );
}
