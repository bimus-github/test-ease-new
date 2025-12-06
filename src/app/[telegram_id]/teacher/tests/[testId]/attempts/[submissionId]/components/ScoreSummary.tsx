"use client";

import type { FullSubmission } from "@/types/submission";
import { ScoringType } from "@/types/test";
import { calculateSatScore } from "@/lib/helpers";

interface ScoreSummaryProps {
  fullSubmission: FullSubmission;
}

export function ScoreSummary({ fullSubmission }: ScoreSummaryProps) {
  const isSatTest = fullSubmission.test.scoring_type === ScoringType.SAT_SCORING;
  const satScore = isSatTest ? calculateSatScore(fullSubmission) : null;
  const totalQuestions = fullSubmission.questions?.length || 0;
  const correctAnswers = fullSubmission.row_score ?? 0;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <section className="grid gap-3">
      <h3 className="text-base font-medium">Natijalar</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
            To'g'ri javoblar
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {correctAnswers}/{totalQuestions}
          </div>
          <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            {percentage}%
          </div>
        </div>
        {isSatTest && satScore != null && (
          <div className="rounded-md border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950/30">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-purple-600 dark:text-purple-400">
              SAT bali
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {satScore}
            </div>
            <div className="mt-1 text-xs text-purple-600 dark:text-purple-400">
              / 800
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

