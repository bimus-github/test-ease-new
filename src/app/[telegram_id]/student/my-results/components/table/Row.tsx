"use client";

import type { FullSubmission } from "@/types/submission";
import { ScoringType } from "@/types/test";
import { gradeFromT, percentageFromT, calculateSatScore, calculatePoints } from "@/lib/helpers";
import { formatLocalDate, isPast } from "@/lib/utils";
import { ScoringBadge } from "../ScoringBadge";

interface RowProps {
  submission: FullSubmission;
  index: number;
  renderResultLink: (submissionId: string) => string;
}

export function Row({ submission, index, renderResultLink }: RowProps) {
  const { test } = submission;

  const isRaschTest = test.scoring_type === ScoringType.RASCH_SCORING;
  const isRaschCalculated = test.isRaschCalculated ?? false;
  const showRasch = isRaschTest && isRaschCalculated;
  const isSatTest = test.scoring_type === ScoringType.SAT_SCORING;
  const isUzDtmTest = test.scoring_type === ScoringType.UZ_DTM;

  const t = submission.rasch_score;
  const satScore = isSatTest ? calculateSatScore(submission) : null;
  const uzDtmPoints = isUzDtmTest ? calculatePoints(submission) : null;

  // Check if test has ended
  const testHasEnded = isPast(test.end_date);

  return (
    <tr className="border-t border-neutral-200 hover:bg-neutral-50/60 dark:border-neutral-800 dark:hover:bg-neutral-900/50">
      <td className="px-3 py-2">{index + 1}</td>
      <td className="px-3 py-2">
        <div className="font-medium text-neutral-900 dark:text-neutral-100">
          {test.title}
        </div>
        <div className="text-xs text-neutral-500">{test.code}</div>
      </td>
      <td className="px-3 py-2">
        <ScoringBadge scoringType={test.scoring_type} satSection={test.sat_section} uzDtmSection={test.uz_dtm_section} />
      </td>
      <td className="px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300">
        {submission.submitted_at ? formatLocalDate(submission.submitted_at) : ""}
      </td>
      <td className="px-3 py-2">
        {testHasEnded && submission.row_score != null ? (
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {submission.row_score}/{submission.questions.length}
          </span>
        ) : (
          ""
        )}
      </td>
      {showRasch ? (
        <>
          <td className="px-3 py-2">
            {testHasEnded && t != null ? t.toFixed(2) : ""}
          </td>
          <td className="px-3 py-2">
            {testHasEnded && t != null ? gradeFromT(t) : ""}
          </td>
          <td className="px-3 py-2">
            {testHasEnded && t != null ? percentageFromT(t) : ""}
          </td>
        </>
      ) : (
        <>
          <td className="px-3 py-2">
            -
          </td>
          <td className="px-3 py-2">
            -
          </td>
          <td className="px-3 py-2">
            -
          </td>
        </>
      )}
      {isSatTest ? (
        <td className="px-3 py-2">
          {testHasEnded && satScore != null ? satScore : ""}
        </td>
      ) : (
        <td className="px-3 py-2">
          -
        </td>
      )}
      {isUzDtmTest ? (
        <td className="px-3 py-2">
          {testHasEnded && uzDtmPoints != null ? uzDtmPoints.toFixed(1) : ""}
        </td>
      ) : (
        <td className="px-3 py-2">
          -
        </td>
      )}
      <td className="px-3 py-2">
        <a
          href={renderResultLink(submission.id)}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
      </td>
    </tr>
  );
}

