"use client";

import { useMemo } from "react";
import { useAppDispatch } from "@/store/hooks";
import { takeAttemptActions } from "@/store/slices/takeAttempt";
import { MathField } from "@/components/math-live";
import { AnswerForm } from "@/types/answer";
import { Question } from "@/types/question";

export default function AnswerItem({
  question,
  answers,
}: {
  question: Question;
  answers: AnswerForm[];
}) {
  const dispatch = useAppDispatch();
  const current = useMemo(
    () => answers.find((a) => a.question_id === question.id),
    [answers, question.id]
  );

  const isMulti = question.is_multiple_answers === true;

  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-sm font-medium">
          {question.question_label}. {question.question_text}
        </div>
        <div className="text-xs text-neutral-500">
          {question.question_type}
          {question.is_required ? " • majburiy" : ""}
          {question.points ? ` • ${question.points} ball` : ""}
        </div>
      </div>

      {question.question_type !== "fill_blank" &&
        Array.isArray(question.options) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {question.options.map((opt, idx) => {
              const selected = isMulti
                ? (
                    (current?.selected_options as any as string[]) || []
                  ).includes(opt)
                : current?.answer_text === opt;
              const onClick = () =>
                isMulti
                  ? dispatch(
                      takeAttemptActions.toggleMultiChoice({
                        question_id: question.id,
                        optionText: opt,
                      })
                    )
                  : dispatch(
                      takeAttemptActions.setSingleChoice({
                        question_id: question.id,
                        optionText: opt,
                      })
                    );

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={onClick}
                  className={
                    "rounded-md border px-3 py-1 text-sm " +
                    (selected
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100")
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

      {question.question_type === "fill_blank" && (
        <div className="mt-3">
          <MathField
            key={question.id}
            value={current?.answer_text || ""}
            onChange={(v) =>
              dispatch(
                takeAttemptActions.setFillBlank({
                  question_id: question.id,
                  value: v,
                })
              )
            }
            placeholder="Javobingizni kiriting"
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
