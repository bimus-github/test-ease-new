"use client";

import { MathField } from "@/components/math-live";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { testFromActions } from "@/store/slices/forms/test";

interface Props {
  onSubmit: () => void;
}

export function QuestionsForm({ onSubmit }: Props) {
  const { questions } = useAppSelector((state) => state.test);
  const dispatch = useAppDispatch();

  const setMCAnswer = (label: string, answer: string) => {
    dispatch(
      testFromActions.setQuestion({
        question_label: label,
        correct_answer: answer,
      })
    );
  };

  const setFillAnswer = (label: string, answer: string) => {
    dispatch(
      testFromActions.setQuestion({
        question_label: label,
        correct_answer: answer,
      })
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold">Savollar</h2>
      <div className="grid gap-4">
        {questions.map((q) => (
          <div
            key={q.question_label}
            className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-sm font-medium">{q.question_label}</div>
              <div className="text-xs text-neutral-500">{q.question_type}</div>
            </div>
            <div className="text-sm text-neutral-700 dark:text-neutral-300">
              {q.question_text}
            </div>

            {q.question_type === "multiple_choice" && (
              <div className="mt-3 flex flex-wrap gap-2">
                {q.options?.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setMCAnswer(q.question_label, opt)}
                    className={
                      "rounded-md border px-3 py-1 text-sm " +
                      (q.correct_answer === opt
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100")
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.question_type === "fill_blank" && (
              <div className="mt-3">
                <MathField
                  value={q.correct_answer || ""}
                  onChange={(value) => setFillAnswer(q.question_label, value)}
                  placeholder="To‘g‘ri matematik javobni kiriting"
                  className="w-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 mt-4 -mx-4 -mb-4 flex gap-3 border-t border-neutral-200 bg-background p-4 dark:border-neutral-800 sm:-mx-6 sm:-mb-6">
        <button
          type="button"
          onClick={() => dispatch(testFromActions.setStep("basic_info"))}
          className="inline-flex flex-1 items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 active:opacity-90 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        >
          Orqaga
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex flex-1 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 active:opacity-80 dark:bg-white dark:text-black"
        >
          Keyingi
        </button>
      </div>
    </div>
  );
}
