"use client";

import type { FullSubmission } from "@/types/submission";
import { ScoringType } from "@/types/test";
import {
  calculateRowScore,
  calculateSatScore,
  calculatePoints,
  gradeFromT,
  percentageFromT,
} from "@/lib/helpers";
import { isPast } from "@/lib/utils";

export function ScoreSummary({
  fullSubmission,
}: {
  fullSubmission: FullSubmission;
}) {
  const { questions, test } = fullSubmission;

  // Check if test has ended
  const testHasEnded = isPast(test.end_date);

  if (!testHasEnded) {
    return null;
  }

  const isRaschTest = test.scoring_type === ScoringType.RASCH_SCORING;
  const isRaschCalculated = test.isRaschCalculated ?? false;
  const showRasch = isRaschTest && isRaschCalculated;
  const isSatTest = test.scoring_type === ScoringType.SAT_SCORING;
  const isUzDtmTest = test.scoring_type === ScoringType.UZ_DTM;
  const isSimpleTest = test.scoring_type === ScoringType.SIMPLE_SCORING;


  const correctAnswers = calculateRowScore(fullSubmission);
  const totalQuestions = questions.length;
  const raschT = fullSubmission.rasch_score;
  const satScore = isSatTest ? calculateSatScore(fullSubmission) : null;
  const uzDtmPoints = isUzDtmTest ? calculatePoints(fullSubmission) : null;

  console.log(satScore)
  return (
    <section className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
        Umumiy natijalar
      </h3>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Correct Answers - Always shown */}
        <div className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
          <div className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">
            To'g'ri javoblar
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {correctAnswers}
          </div>
          <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            / {totalQuestions} ta savol
          </div>
        </div>

        {/* SAT Score - Only for SAT tests */}
        {isSatTest && satScore !== null && (
          <div className="rounded-lg border-2 border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800 dark:bg-purple-950/20">
            <div className="mb-1 text-xs font-medium text-purple-600 dark:text-purple-400">
              SAT bali
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {satScore}
            </div>
            <div className="mt-1 text-xs text-purple-600 dark:text-purple-400">
              / 800 maksimal
            </div>
          </div>
        )}

        {/* UZ DTM Points - Only for UZ DTM tests */}
        {isUzDtmTest && uzDtmPoints !== null && (
          <div className="rounded-lg border-2 border-green-200 bg-green-50/50 p-4 dark:border-green-800 dark:bg-green-950/20">
            <div className="mb-1 text-xs font-medium text-green-600 dark:text-green-400">
              UZ DTM bali
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {uzDtmPoints.toFixed(1)}
            </div>
            <div className="mt-1 text-xs text-green-600 dark:text-green-400">
              Ballar
            </div>
          </div>
        )}

        {/* Rasch Results - Only for Rasch tests when calculated */}
        {showRasch && raschT != null && (
          <>
            <div className="rounded-lg border-2 border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <div className="mb-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                Rasch T-bahosi
              </div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {raschT.toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg border-2 border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <div className="mb-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                Bahosi
              </div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {gradeFromT(raschT)}
              </div>
            </div>
            <div className="rounded-lg border-2 border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <div className="mb-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                Foizi
              </div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {percentageFromT(raschT)}
              </div>
            </div>
          </>
        )}

        {/* Simple Scoring - Show percentage if simple test */}
        {isSimpleTest && (
          <div className="rounded-lg border-2 border-green-200 bg-green-50/50 p-4 dark:border-green-800 dark:bg-green-950/20">
            <div className="mb-1 text-xs font-medium text-green-600 dark:text-green-400">
              Foizi
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {totalQuestions > 0
                ? Math.round((correctAnswers / totalQuestions) * 100)
                : 0}
              %
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

