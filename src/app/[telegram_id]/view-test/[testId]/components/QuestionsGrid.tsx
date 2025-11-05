"use client";

import { LatexRenderer } from "@/components/math-live/LatexRenderer";

export function QuestionsGrid({
  questions,
}: {
  questions: Array<{
    question_label: string;
    question_type: string;
    correct_answer?: string;
    correct_options?: string[];
  }>;
}) {
  return (
    <section className="mb-6 grid gap-2">
      <h4 className="text-sm font-medium">Javoblar ko‘rinishi</h4>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {questions.map((q) => (
          <div
            key={q.question_label}
            className="rounded-md border border-neutral-200 p-2 text-center text-xs shadow-sm dark:border-neutral-800"
            title={q.question_label}
          >
            <div className="truncate font-medium">{q.question_label}</div>
            {q.question_type === "fill_blank" ? (
              <LatexRenderer
                latex={q.correct_answer || ""}
                displayMode={true}
                className="text-black"
              />
            ) : (
              <div className="truncate text-neutral-600 dark:text-neutral-400">
                {q.correct_answer ||
                  (q.correct_options?.length
                    ? q.correct_options.join(", ")
                    : "—")}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
