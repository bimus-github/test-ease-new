"use client";

import { AnswerForm } from "@/types/answer";
import { Question } from "@/types/question";
import AnswerItem from "./AnswerItem";

export default function AnswerList({
  questions,
  answers,
  startedAt,
  endsAt,
  unansweredQuestions,
}: {
  questions: Question[];
  answers: AnswerForm[];
  startedAt?: string;
  endsAt?: string;
  unansweredQuestions: string[];
}) {
  return (
    <div className="grid gap-4">
      {(startedAt || endsAt) && (
        <div className="rounded border border-neutral-200 p-3 text-sm text-neutral-700 dark:border-neutral-800 dark:text-neutral-300">
          <div className="flex flex-wrap items-center gap-4">
            {startedAt && (
              <div>
                <span className="text-neutral-500">Boshlangan:</span>{" "}
                <time dateTime={startedAt}>
                  {new Date(startedAt).toLocaleString()}
                </time>
              </div>
            )}
            {endsAt && (
              <div>
                <span className="text-neutral-500">Tugaydi:</span>{" "}
                <time dateTime={endsAt}>
                  {new Date(endsAt).toLocaleString()}
                </time>
              </div>
            )}
          </div>
        </div>
      )}

      {questions.map((q) => (
        <AnswerItem key={q.id} question={q} answers={answers} />
      ))}

      {unansweredQuestions.length > 0 && (
        <div className="mt-2 rounded border border-neutral-200 p-3 text-sm text-neutral-700 dark:border-neutral-800 dark:text-neutral-300">
          <div className="mb-1 font-medium">Javobsiz</div>
          <div className="flex flex-wrap gap-2">
            {unansweredQuestions.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded border border-neutral-300 px-2 py-0.5 text-xs dark:border-neutral-700"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
