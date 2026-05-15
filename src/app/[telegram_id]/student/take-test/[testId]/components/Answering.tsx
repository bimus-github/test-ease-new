"use client";

import type { Question } from "@/types/question";
import { ScoringType } from "@/types/test";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { takeActions } from "@/store/slices/take";
import { useMemo } from "react";
import { ToggleMathInput } from "@/components/math-live";
import { QuestionMedia } from "@/components/QuestionMedia";
import { TestTimer } from "@/components/TestTimer";
import { formatLocalDate } from "@/lib/utils";
import { shuffleWithSeed } from "@/lib/shuffle";

export function Answering({
  questions,
  scoringType,
  startDate,
  endDate,
  sharedAudioUrl,
  onPreview,
}: {
  questions: Question[];
  scoringType: ScoringType;
  startDate?: string;
  endDate?: string;
  sharedAudioUrl?: string;
  onPreview: () => void;
}) {
  const dispatch = useAppDispatch();
  const answers = useAppSelector((s) => s.take.answers);
  const submissionId = useAppSelector((s) => s.take.submissionId);

  // Shuffle questions and options per-submission (deterministic — same seed → same order on reload)
  const shuffledQuestions = useMemo(() => {
    if (!submissionId) return questions;
    return shuffleWithSeed(questions, `q-${submissionId}`);
  }, [questions, submissionId]);

  const getShuffledOptions = (q: Question): string[] => {
    if (!submissionId || !q.options) return q.options || [];
    return shuffleWithSeed(q.options, `o-${submissionId}-${q.id}`);
  };

  const unansweredLabels = shuffledQuestions
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
    <section className="grid gap-4">
      <TestTimer startedAt={startDate} endDate={endDate} />

      <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 text-xs dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            Boshlangan: {startDate ? formatLocalDate(startDate) : "—"}
          </span>
          {endDate && (
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Tugash: {formatLocalDate(endDate)}
            </span>
          )}
        </div>
      </div>

      {sharedAudioUrl && (
        <div className="sticky top-0 z-10 -mx-4 border-y border-emerald-200 bg-emerald-50/90 px-4 py-3 backdrop-blur dark:border-emerald-800 dark:bg-emerald-950/80 sm:-mx-6 sm:px-6">
          <div className="mb-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            🎧 Test audiosi (barcha savollar uchun)
          </div>
          <QuestionMedia url={sharedAudioUrl} type="audio" />
        </div>
      )}

      <div className="grid gap-3">
        <h3 className="text-base font-medium">Savollar</h3>
        <div className="grid grid-cols-1 gap-3">
          {shuffledQuestions.map((q) => (
            <div
              key={q.id}
              className="group rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-1 font-semibold text-neutral-900 dark:text-neutral-100">
                    {q.question_label}
                  </div>
                  <div className="text-sm text-neutral-700 dark:text-neutral-300">
                    {q.question_text}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">
                    {q.question_type}
                  </span>
                </div>
              </div>

              <QuestionMedia url={q.media_url} type={q.media_type} />

              {q.question_type === "fill_blank" && (
                <ToggleMathInput
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
                  <div className="grid gap-2 sm:grid-cols-2">
                    {getShuffledOptions(q).map((opt) => {
                      const isSelected = answers.find(
                        (x) => x.question_id === q.id && x.answer === opt
                      );
                      return (
                        <label
                          key={opt}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                            isSelected
                              ? "border-neutral-900 bg-neutral-100 dark:border-neutral-100 dark:bg-neutral-800"
                              : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={!!isSelected}
                            onChange={() =>
                              dispatch(
                                takeActions.upsertSingle({
                                  question_id: q.id,
                                  answer: opt,
                                })
                              )
                            }
                            className="h-5 w-5 cursor-pointer accent-neutral-900 dark:accent-neutral-100"
                          />
                          <span className="flex-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {opt}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

              {q.question_type === "multiple_choice" &&
                q.is_multiple_answers && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {getShuffledOptions(q).map((opt) => {
                      const isSelected = answers.find(
                        (x) =>
                          x.question_id === q.id &&
                          x.answer_options?.includes(opt)
                      );
                      return (
                        <label
                          key={opt}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                            isSelected
                              ? "border-neutral-900 bg-neutral-100 dark:border-neutral-100 dark:bg-neutral-800"
                              : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!isSelected}
                            onChange={() =>
                              dispatch(
                                takeActions.toggleMulti({
                                  question_id: q.id,
                                  optionText: opt,
                                })
                              )
                            }
                            className="h-5 w-5 cursor-pointer accent-neutral-900 dark:accent-neutral-100"
                          />
                          <span className="flex-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {opt}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>

      {unansweredLabels.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs dark:border-amber-800 dark:bg-amber-950/20">
          <div className="mb-2 font-medium text-amber-800 dark:text-amber-300">
            Javobsiz savollar ({unansweredLabels.length}):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {unansweredLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-md border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-700 dark:border-amber-700 dark:bg-neutral-900 dark:text-amber-400"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 -mb-4 flex gap-3 border-t border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:-mx-6 sm:-mb-6">
        <button
          type="button"
          disabled={unansweredLabels.length > 0}
          onClick={onPreview}
          className="inline-flex flex-1 items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          Ko'rib chiqish
        </button>
      </div>
    </section>
  );
}
