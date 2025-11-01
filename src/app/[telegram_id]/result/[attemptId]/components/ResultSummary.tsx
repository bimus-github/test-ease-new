"use client";

import { AttemptFull } from "@/types/attempt";
import { calculateRowScore } from "@/lib/helpers";

export default function ResultSummary({ attempt }: { attempt: AttemptFull }) {
  const totalQuestions = attempt.answers?.length || 0;
  const answered = attempt.answers?.length || 0;
  const earned = calculateRowScore(attempt.answers || []);
  const totalPossible = attempt.answers?.reduce(
    (sum, answer) => sum + (answer.question?.points || 0),
    0
  );

  return (
    <div className="rounded border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="mb-2 text-base font-semibold">{attempt.test?.title}</div>
      <div className="grid gap-2 text-sm text-neutral-700 dark:text-neutral-300">
        <div className="flex flex-wrap gap-4">
          <div>
            <span className="text-neutral-500">Holat:</span> {attempt.status}
          </div>
          <div>
            <span className="text-neutral-500">Boshlangan:</span>{" "}
            <time dateTime={attempt.started_at}>
              {new Date(attempt.started_at).toLocaleString()}
            </time>
          </div>
          {attempt.submitted_at && (
            <div>
              <span className="text-neutral-500">Yuborilgan:</span>{" "}
              <time dateTime={attempt.submitted_at}>
                {new Date(attempt.submitted_at).toLocaleString()}
              </time>
            </div>
          )}
        </div>

        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span>Ball</span>
            <span>
              {earned} / {totalPossible}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full bg-black dark:bg-white"
              style={{
                width: `${Math.min(
                  100,
                  (earned / (totalPossible || 1)) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-4">
          <div>
            <span className="text-neutral-500">Javob berilgan:</span> {answered}
            /{totalQuestions}
          </div>
        </div>
      </div>
    </div>
  );
}
