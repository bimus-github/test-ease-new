"use client";

import type { FullSubmission } from "@/types/submission";
import { ScoringType } from "@/types/test";
import { gradeFromT, percentageFromT } from "@/lib/helpers";

export function RaschResultsCard({
  fullSubmission,
}: {
  fullSubmission: FullSubmission;
}) {
  const isEnded = Boolean(fullSubmission.submitted_at);
  const isRasch =
    fullSubmission.test.scoring_type === ScoringType.RASCH_SCORING;
  const isCalculated = Boolean(fullSubmission.test.isRaschCalculated);

  if (!isEnded || !isRasch || !isCalculated) {
    return (
      <div className="rounded-md border border-neutral-200 p-4 shadow-sm dark:border-neutral-800">
        <h3 className="mb-2 text-base font-medium">Rasch natijalari</h3>
        <p className="text-sm text-neutral-500">
          Rasch natijalari test yakunlangandan so‘ng hisoblab chiqarilgan.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-neutral-200 p-4 shadow-sm dark:border-neutral-800">
      <h3 className="mb-2 text-base font-medium">Rasch natijalari</h3>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
          <div className="text-xs text-neutral-500">Rasch ball</div>
          <div className="text-lg font-semibold">
            {fullSubmission.rasch_score != null
              ? `${fullSubmission.rasch_score} (${percentageFromT(
                  fullSubmission.rasch_score
                )})`
              : "—"}
          </div>
        </div>
        <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
          <div className="text-xs text-neutral-500">Qobiliyat (ability)</div>
          <div className="text-lg font-semibold">
            {fullSubmission.rasch_ability != null
              ? fullSubmission.rasch_ability
              : "—"}
          </div>
        </div>
        {fullSubmission.test.rasch_calculated_at && (
          <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-xs text-neutral-500">Rasch bahosi</div>
            <div className="text-sm">
              {fullSubmission.rasch_score
                ? gradeFromT(fullSubmission.rasch_score)
                : "—"}
            </div>
          </div>
        )}
        {fullSubmission.test.rasch_calculated_at && (
          <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-xs text-neutral-500">Hisoblangan vaqt</div>
            <div className="text-sm">
              {new Date(
                fullSubmission.test.rasch_calculated_at
              ).toLocaleString()}
            </div>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Rasch natijalari test yakunlangandan so‘ng hisoblab chiqarilgan.
      </p>
    </div>
  );
}
