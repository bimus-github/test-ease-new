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
    <section className="grid gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-medium">Javoblar tahlili</h3>
        <span className="text-xs text-neutral-500">
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
          if (index === 0) {
            console.log("question:", q);
            console.log("answer:", a);
            console.log("isCorrect:", isCorrect);
            console.log("userAnswer:", userAnswer);
            console.log("correct answer:", correct);
          }

          return (
            <div
              key={q.id}
              className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="font-medium">{q.question_label}</div>
                <div
                  className={`text-xs ${
                    isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isCorrect ? "To‘g‘ri" : "Noto‘g‘ri"}
                </div>
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
