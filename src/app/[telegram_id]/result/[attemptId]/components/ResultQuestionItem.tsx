"use client";

import { AnswerWithQuestion } from "@/types/answer";
import { checkAnswer, correctAnswerText } from "@/lib/helpers";
import { LatexRenderer } from "@/components/math-live/LatexRenderer";

export default function ResultQuestionItem({ a }: { a: AnswerWithQuestion }) {
  const isCorrect = checkAnswer(a);
  const q = a.question!;
  const userValue = q.is_multiple_answers
    ? ((a.selected_options as unknown as string[]) || []).join(", ")
    : a.answer_text || "";
  const correctValue = correctAnswerText(a);

  return (
    <div className="rounded border border-neutral-200 p-4 text-sm dark:border-neutral-800">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="font-medium">
          {q.question_label}. {q.question_text}
        </div>
        <div
          className={
            "inline-flex items-center rounded px-2 py-0.5 text-xs " +
            (isCorrect
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200")
          }
        >
          {isCorrect ? "To‘g‘ri" : "Noto‘g‘ri"}
        </div>
      </div>

      <div className="grid gap-1">
        <div>
          <span className="text-neutral-500">Sizning javobingiz:</span>{" "}
          {q.question_type === "fill_blank" ? (
            <LatexRenderer latex={userValue} />
          ) : (
            <span>{userValue || "—"}</span>
          )}
        </div>
        {!isCorrect && (
          <div>
            <span className="text-neutral-500">To‘g‘ri javob:</span>{" "}
            {q.question_type === "fill_blank" ? (
              <LatexRenderer latex={correctValue} />
            ) : (
              <span>{correctValue || "—"}</span>
            )}
          </div>
        )}
        <div>
          <span className="text-neutral-500">Ball:</span>{" "}
          {isCorrect ? q.points : 0} / {q.points}
        </div>
      </div>
    </div>
  );
}
