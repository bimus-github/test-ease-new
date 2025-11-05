"use client";

import type { Question } from "@/types/question";
import { LatexRenderer } from "@/components/math-live/LatexRenderer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { takeActions } from "@/store/slices/take";
import { MathField } from "@/components/math-live";

export function Answering({
  questions,
  startDate,
  endDate,
  onPreview,
}: {
  questions: Question[];
  startDate?: string;
  endDate?: string;
  onPreview: () => void;
}) {
  const dispatch = useAppDispatch();
  const answers = useAppSelector((s) => s.take.answers);

  const unansweredLabels = questions
    .filter((q) => {
      const a = answers.find((x) => x.question_id === q.id);
      if (!a) return true;
      if (q.question_type === "multiple_choice" && q.is_multiple_answers) {
        return !(a.answer_options && a.answer_options.length > 0);
      }
      return !(a.answer && a.answer.length > 0);
    })
    .map((q) => q.question_label);

  return (
    <section className="grid gap-3">
      <div className="grid gap-2 rounded-lg border border-neutral-200 p-3 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
        <div className="flex flex-wrap items-center gap-3">
          <span>
            Boshlangan: {startDate ? new Date(startDate).toLocaleString() : "—"}
          </span>
          <span>
            Tugash vaqti: {endDate ? new Date(endDate).toLocaleString() : "—"}
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        <h3 className="text-base font-medium">Savollar</h3>
        <div className="grid grid-cols-1 gap-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="rounded-lg border border-neutral-200 p-4 text-sm dark:border-neutral-800"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="font-medium">{q.question_label}</div>
                <div className="text-xs text-neutral-500">
                  {q.question_type}
                </div>
              </div>
              <div className="mb-3 text-neutral-800 dark:text-neutral-200">
                {q.question_text}
              </div>

              {q.question_type === "fill_blank" && (
                <MathField
                  value={
                    answers.find((x) => x.question_id === q.id)?.answer || ""
                  }
                  onChange={(value) =>
                    dispatch(
                      takeActions.setFillBlank({
                        question_id: q.id,
                        value: value,
                      })
                    )
                  }
                  placeholder="Javobingizni kiriting"
                  className="w-full"
                />
              )}

              {q.question_type === "multiple_choice" &&
                !q.is_multiple_answers && (
                  <div className="flex gap-2 items-center">
                    {(q.options || []).map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={
                            answers.find(
                              (x) => x.question_id === q.id && x.answer === opt
                            )
                              ? true
                              : false
                          }
                          onChange={() =>
                            dispatch(
                              takeActions.upsertSingle({
                                question_id: q.id,
                                answer: opt,
                              })
                            )
                          }
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

              {q.question_type === "multiple_choice" &&
                q.is_multiple_answers && (
                  <div className="grid gap-2">
                    {(q.options || []).map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            answers.find(
                              (x) =>
                                x.question_id === q.id &&
                                x.answer_options?.includes(opt)
                            )
                              ? true
                              : false
                          }
                          onChange={() =>
                            dispatch(
                              takeActions.toggleMulti({
                                question_id: q.id,
                                optionText: opt,
                              })
                            )
                          }
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>

      {unansweredLabels.length > 0 && (
        <div className="grid gap-2 rounded-lg border border-neutral-200 p-3 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
          <span className="mr-1">Javobsiz:</span>
          {unansweredLabels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded border px-1.5 py-0.5"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 -mb-4 flex gap-3 border-t border-neutral-200 bg-background p-4 dark:border-neutral-800 sm:-mx-6 sm:-mb-6">
        <button
          type="button"
          disabled={unansweredLabels.length > 0}
          onClick={onPreview}
          className="inline-flex flex-1 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 active:opacity-80 dark:bg-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ko‘rib chiqish
        </button>
      </div>
    </section>
  );
}
