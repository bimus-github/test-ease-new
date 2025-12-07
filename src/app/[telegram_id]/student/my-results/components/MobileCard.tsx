"use client";

import type { FullSubmission } from "@/types/submission";
import { ScoringType } from "@/types/test";
import { gradeFromT, percentageFromT, calculateSatScore } from "@/lib/helpers";
import { formatLocalDate, isPast } from "@/lib/utils";
import { ScoringBadge } from "./ScoringBadge";

interface MobileCardProps {
  submission: FullSubmission;
  index: number;
  renderResultLink: (submissionId: string) => string;
}

export function MobileCard({
  submission,
  index,
  renderResultLink,
}: MobileCardProps) {
  const { test } = submission;

  const isRaschTest = test.scoring_type === ScoringType.RASCH_SCORING;
  const isRaschCalculated = test.isRaschCalculated ?? false;
  const showRasch = isRaschTest && isRaschCalculated;
  const isSatTest = test.scoring_type === ScoringType.SAT_SCORING;

  const t = submission.rasch_score;
  const satScore = isSatTest ? calculateSatScore(submission) : null;

  // Check if test has ended
  const testHasEnded = isPast(test.end_date);

  return (
    <div className="group rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              {index + 1}
            </span>
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
              {test.title}
            </div>
          </div>
          <div className="mb-2 text-xs text-neutral-500">{test.code}</div>
          <ScoringBadge scoringType={test.scoring_type} satSection={test.sat_section} />
        </div>
        <a
          href={renderResultLink(submission.id)}
          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M3 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Ko'rish
        </a>
      </div>

      {/* Stats Grid */}
      <div className="space-y-2.5">
        {/* Date Info */}
        <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-2.5 text-xs dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Yuborilgan
          </div>
          <div className="font-medium text-neutral-900 dark:text-neutral-100">
            {submission.submitted_at ? formatLocalDate(submission.submitted_at) : ""}
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-2">
          {/* Correct Answers */}
          <div className="rounded-md border border-blue-200 bg-blue-50/50 p-2.5 dark:border-blue-800 dark:bg-blue-950/20">
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
              To'g'ri javoblar
            </div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {testHasEnded && submission.row_score != null
                ? `${submission.row_score}/${submission.questions.length}`
                : ""}
            </div>
          </div>

          {/* SAT Score or Rasch T or Percentage */}
          {isSatTest ? (
            <div className="rounded-md border border-purple-200 bg-purple-50/50 p-2.5 dark:border-purple-800 dark:bg-purple-950/20">
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-purple-600 dark:text-purple-400">
                SAT bali
              </div>
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                {testHasEnded && satScore != null ? satScore : ""}
              </div>
            </div>
          ) : showRasch ? (
            <div className="rounded-md border border-amber-200 bg-amber-50/50 p-2.5 dark:border-amber-800 dark:bg-amber-950/20">
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Rasch T
              </div>
              <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
                {testHasEnded && t != null ? t.toFixed(2) : ""}
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-green-200 bg-green-50/50 p-2.5 dark:border-green-800 dark:bg-green-950/20">
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-green-600 dark:text-green-400">
                Foizi
              </div>
              <div className="text-lg font-bold text-green-700 dark:text-green-300">
                {testHasEnded && submission.questions.length > 0 && submission.row_score != null
                  ? `${Math.round((submission.row_score / submission.questions.length) * 100)}%`
                  : ""}
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Rasch Details */}
        {showRasch && testHasEnded && t != null && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-2 dark:border-neutral-800 dark:bg-neutral-900/50">
              <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Bahosi
              </div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                {gradeFromT(t)}
              </div>
            </div>
            <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-2 dark:border-neutral-800 dark:bg-neutral-900/50">
              <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Foizi
              </div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                {percentageFromT(t)}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}


