"use client";

import { LatexRenderer } from "@/components/math-live/LatexRenderer";
import {
  calculateRowScore,
  checkAnswer,
  correctAnswerText,
} from "@/lib/helpers";
import type { FullSubmission } from "@/types/submission";

export function Analysis({
  fullSubmission,
}: {
  fullSubmission: FullSubmission;
}) {
  const { questions, answers } = fullSubmission;

  return (
    <section className="grid gap-3 rounded-md border border-neutral-200 p-4 shadow-sm dark:border-neutral-800">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-medium">Javoblar tahlili</h3>
        <span className="inline-flex items-center rounded-full border border-neutral-300 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
          Jami {calculateRowScore(fullSubmission)}/{questions.length}
        </span>
      </div>
      <div className="grid gap-2">
        {questions.map((q, index) => {
          const a = answers.find((x) => x.question_id === q.id);
          const isCorrect = a ? checkAnswer(a as any, q as any) : false;
          const userAnswer = q.is_multiple_answers
            ? a?.answer_options?.join(", ") || "—"
            : a?.answer || "—";
          const correct = correctAnswerText(a as any, q as any);

          return (
            <div
              key={q.id}
              className={`rounded-md border p-3 text-sm shadow-sm dark:border-neutral-800 ${
                isCorrect ? "border-green-200 " : "border-red-200"
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="font-medium">
                  {q.question_label}
                  {q.rasch_difficulty
                    ? ` (Rasch qiyinlik: ${q.rasch_difficulty.toFixed(2)})`
                    : ""}
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    isCorrect
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {isCorrect ? "To‘g‘ri" : "Noto‘g‘ri"}
                </span>
              </div>
              {q.question_type === "fill_blank" ? (
                <LatexRenderer
                  latex={a?.answer || ""}
                  displayMode={true}
                  className="text-black"
                />
              ) : (
                <div className="text-neutral-700 dark:text-neutral-300">
                  Sizning javobingiz: {userAnswer}
                </div>
              )}
              {!isCorrect && (
                <div className="text-neutral-500">
                  To‘g‘ri javob:{" "}
                  {q.question_type === "fill_blank" ? (
                    <LatexRenderer
                      latex={correct || ""}
                      displayMode={true}
                      className="text-black"
                    />
                  ) : (
                    correct || "—"
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
