"use client";

import type { FullSubmission } from "@/types/submission";
import { ScoringType } from "@/types/test";
import { gradeFromT, percentageFromT } from "@/lib/helpers";
import { formatLocalDate } from "@/lib/utils";

interface RaschResultsProps {
  fullSubmission: FullSubmission;
}

export function RaschResults({ fullSubmission }: RaschResultsProps) {
  const isEnded = Boolean(fullSubmission.submitted_at);
  const isRasch = fullSubmission.test.scoring_type === ScoringType.RASCH_SCORING;
  const isCalculated = Boolean(fullSubmission.test.isRaschCalculated);

  if (!isEnded || !isRasch || !isCalculated) {
    return (
      <div className="rounded-md border border-neutral-200 p-4 shadow-sm dark:border-neutral-800">
        <h3 className="mb-2 text-base font-medium">Rasch natijalari</h3>
        <p className="text-sm text-neutral-500">
          Rasch natijalari test yakunlangandan so'ng hisoblab chiqarilgan.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/20">
      <h3 className="mb-3 text-base font-medium">Rasch natijalari</h3>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-md border border-emerald-200 bg-white p-3 dark:border-emerald-800 dark:bg-neutral-900">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Rasch T-bahosi
          </div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
            {fullSubmission.rasch_score != null
              ? fullSubmission.rasch_score.toFixed(1)
              : "—"}
          </div>
        </div>
        <div className="rounded-md border border-emerald-200 bg-white p-3 dark:border-emerald-800 dark:bg-neutral-900">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Bahosi
          </div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
            {fullSubmission.rasch_score != null
              ? gradeFromT(fullSubmission.rasch_score)
              : "—"}
          </div>
        </div>
        <div className="rounded-md border border-emerald-200 bg-white p-3 dark:border-emerald-800 dark:bg-neutral-900">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Foizi
          </div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
            {fullSubmission.rasch_score != null
              ? percentageFromT(fullSubmission.rasch_score)
              : "—"}
          </div>
        </div>
        <div className="rounded-md border border-emerald-200 bg-white p-3 dark:border-emerald-800 dark:bg-neutral-900">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Qobiliyat (θ)
          </div>
          <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
            {fullSubmission.rasch_ability != null
              ? fullSubmission.rasch_ability.toFixed(3)
              : "—"}
          </div>
        </div>
      </div>
      {fullSubmission.test.rasch_calculated_at && (
        <p className="mt-3 text-xs text-neutral-500">
          Hisoblangan: {formatLocalDate(fullSubmission.test.rasch_calculated_at)}
        </p>
      )}
    </div>
  );
}

