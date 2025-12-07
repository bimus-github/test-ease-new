"use client";

import { useMemo } from "react";
import type { Question } from "@/types/question";
import { ScoringType } from "@/types/test";
import { useAppSelector } from "@/store/hooks";
import { LatexRenderer } from "@/components/math-live/LatexRenderer";

export function Preview({
  questions,
  scoringType,
  isSubmitting,
  onBack,
  onSubmit,
}: {
  questions: Question[];
  scoringType: ScoringType;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => Promise<void>;
}) {
  const answers = useAppSelector((s) => s.take.answers);

  const stats = useMemo(() => {
    const mcCount = questions.filter(
      (q) => q.question_type === "multiple_choice"
    ).length;
    const fillCount = questions.filter(
      (q) => q.question_type === "fill_blank"
    ).length;
    const answered = questions.filter((q) => {
      const a = answers.find((x) => x.question_id === q.id);
      if (!a) return false;
      if (q.question_type === "multiple_choice" && q.is_multiple_answers) {
        return (a.answer_options?.length || 0) > 0;
      }
      return Boolean(a.answer && a.answer.length > 0);
    }).length;

    return { mcCount, fillCount, answered };
  }, [questions, answers, scoringType]);

  return (
    <div className="grid gap-6">
      <section className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-medium">Savollar</h3>
          <span className="text-xs font-medium text-neutral-500">
            Jami {questions.length} • {stats.answered} javob berilgan
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="text-xs text-neutral-500">Bir nechta javobli</div>
            <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{stats.mcCount}</div>
          </div>
          <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="text-xs text-neutral-500">
              Bo'sh joyni to'ldiring
            </div>
            <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{stats.fillCount}</div>
          </div>
          <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="text-xs text-neutral-500">Javob berilgan</div>
            <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{stats.answered}</div>
          </div>
          <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="text-xs text-neutral-500">Javobsiz</div>
            <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {questions.length - stats.answered}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        <h4 className="text-sm font-medium">Javoblar ko'rinishi</h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {questions.map((q) => {
            const a = answers.find((x) => x.question_id === q.id);
            const multi =
              q.question_type === "multiple_choice" && q.is_multiple_answers;
            const hasAnswer = a && (
              multi ? (a.answer_options?.length || 0) > 0 : Boolean(a.answer && a.answer.length > 0)
            );
            return (
              <div
                key={q.question_label}
                className={`rounded-md border p-2 text-center text-xs transition-colors ${
                  hasAnswer
                    ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                    : "border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/50"
                }`}
                title={q.question_label}
              >
                <div className="mb-1 truncate font-medium text-neutral-900 dark:text-neutral-100">
                  {q.question_label}
                </div>
                {q.question_type === "fill_blank" ? (
                  <LatexRenderer
                    latex={a?.answer || ""}
                    displayMode={true}
                    className="text-black dark:text-white"
                  />
                ) : (
                  <div className="truncate text-xs text-neutral-600 dark:text-neutral-400">
                    {multi
                      ? a?.answer_options?.length
                        ? a?.answer_options?.join(", ")
                        : "—"
                      : a?.answer || "—"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 -mb-4 flex gap-3 border-t border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:-mx-6 sm:-mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex flex-1 items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
        >
          Orqaga
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="inline-flex flex-1 items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          {isSubmitting ? "Yuborilmoqda…" : "Yuborish"}
        </button>
      </div>
    </div>
  );
}
