"use client";

import { LatexRenderer } from "@/components/math-live/LatexRenderer";
import { checkAnswer, correctAnswerText, calculateRowScore } from "@/lib/helpers";
import type { FullSubmission } from "@/types/submission";
import { isPast } from "@/lib/utils";

interface AnalysisProps {
  fullSubmission: FullSubmission;
}

export function Analysis({ fullSubmission }: AnalysisProps) {
  const { questions, answers, test } = fullSubmission;
  const testHasEnded = isPast(test.end_date);
  const totalScore = calculateRowScore(fullSubmission);

  // Sort questions by order
  const sortedQuestions = [...questions].sort(
    (a, b) => (a.question_order || 0) - (b.question_order || 0)
  );

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-medium">Javoblar tahlili</h3>
        {testHasEnded && (
          <span className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            Jami {totalScore}/{questions.length}
          </span>
        )}
      </div>
      <div className="grid gap-3">
        {sortedQuestions.map((q) => {
          const a = answers.find((x) => x.question_id === q.id);
          const isCorrect = a ? checkAnswer(a, q) : false;
          const userAnswer = q.is_multiple_answers
            ? a?.answer_options?.join(", ") || "—"
            : a?.answer || "—";
          const correct = correctAnswerText(a as any, q as any);
          const points = isCorrect ? q.points || 0 : 0;

          return (
            <div
              key={q.id}
              className={`group rounded-lg border p-4 text-sm transition-all ${
                testHasEnded
                  ? isCorrect
                    ? "border-green-200 bg-green-50/50 shadow-sm dark:border-green-800 dark:bg-green-950/20"
                    : "border-red-200 bg-red-50/50 shadow-sm dark:border-red-800 dark:bg-red-950/20"
                  : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {q.question_label}
                    </span>
                    {testHasEnded && q.rasch_difficulty != null && (
                      <span className="text-xs text-neutral-500">
                        (Rasch: {q.rasch_difficulty.toFixed(2)})
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-700 dark:text-neutral-300">
                    {q.question_text}
                  </div>
                </div>
                {testHasEnded && (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      isCorrect
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {isCorrect ? "✓ To'g'ri" : "✗ Noto'g'ri"}
                  </span>
                )}
              </div>

              <div className="grid gap-2.5 rounded-md bg-white/60 p-2.5 dark:bg-neutral-800/60">
                <div>
                  <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Talaba javobi
                  </div>
                  {q.question_type === "fill_blank" ? (
                    <div className="rounded bg-neutral-50 p-2 dark:bg-neutral-900">
                      <LatexRenderer
                        latex={a?.answer || ""}
                        displayMode={true}
                        className="text-black dark:text-white"
                      />
                    </div>
                  ) : (
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {userAnswer}
                    </div>
                  )}
                </div>

                {testHasEnded && (
                  <div>
                    <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      To'g'ri javob
                    </div>
                    {q.question_type === "fill_blank" ? (
                      <div className="rounded bg-green-50 p-2 dark:bg-green-950/30">
                        <LatexRenderer
                          latex={correct || ""}
                          displayMode={true}
                          className="text-black dark:text-white"
                        />
                      </div>
                    ) : (
                      <div className="font-medium text-green-700 dark:text-green-400">
                        {correct || "—"}
                      </div>
                    )}
                  </div>
                )}

                {testHasEnded && (
                  <div className="flex items-center justify-between border-t border-neutral-200 pt-2 dark:border-neutral-700">
                    <span className="text-xs text-neutral-500">Ball</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {points} / {q.points || 0}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

