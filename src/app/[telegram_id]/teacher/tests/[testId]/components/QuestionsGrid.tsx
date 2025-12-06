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
  const getAnswerText = (q: typeof questions[0]): string | null => {
    if (q.correct_answer) {
      return q.correct_answer;
    }
    if (q.correct_options?.length) {
      return q.correct_options.join(", ");
    }
    return null;
  };

  const getQuestionTypeLabel = (type: string): string => {
    switch (type) {
      case "multiple_choice":
        return "MC";
      case "fill_blank":
        return "FB";
      case "true_false":
        return "TF";
      default:
        return type.toUpperCase();
    }
  };

  return (
    <section className="mb-6 space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Javoblar ko‘rinishi</h4>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {questions.map((q) => {
          const answerText = getAnswerText(q);
          const hasAnswer = answerText !== null;
          
          return (
            <div
              key={q.question_label}
              className="flex min-h-[80px] flex-col overflow-hidden rounded-lg border border-neutral-200/60 bg-neutral-50/50 p-3 text-center dark:border-neutral-800/60 dark:bg-neutral-900/30"
              title={`${q.question_label}: ${hasAnswer ? answerText : "Javob yo'q"}`}
            >
              {/* Question Label and Type */}
              <div className="mb-2 flex items-center justify-between gap-1">
                <div className="truncate text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {q.question_label}
                </div>
                <span className="shrink-0 rounded-full bg-neutral-200/80 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-400">
                  {getQuestionTypeLabel(q.question_type)}
                </span>
              </div>
              
              {/* Answer Content */}
              <div className="flex min-h-[32px] flex-1 items-center justify-center">
                {hasAnswer ? (
                  q.question_type === "fill_blank" ? (
                    <div className="w-full">
                      <LatexRenderer
                        latex={answerText}
                        displayMode={true}
                        className="text-foreground"
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="wrap-break-word text-xs font-medium text-neutral-900 dark:text-neutral-100">
                        {answerText}
                      </div>
                    </div>
                  )
                ) : (
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-600">
                    Javob yo'q
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
