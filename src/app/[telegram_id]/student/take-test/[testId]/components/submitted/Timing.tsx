"use client";

import { ScoringType } from "@/types/test";
import { formatLocalDate } from "@/lib/utils";

export function Timing({
  startedAt,
  submittedAt,
  scoringType,
}: {
  startedAt?: string;
  submittedAt?: string;
  scoringType: ScoringType;
}) {
  const formattedStarted = startedAt ? formatLocalDate(startedAt) : "";
  const formattedSubmitted = submittedAt ? formatLocalDate(submittedAt) : "";

  return (
    <section className="grid gap-3 rounded-md border border-neutral-200 p-4 text-sm shadow-sm dark:border-neutral-800">
      <h3 className="text-base font-medium">Vaqt ma'lumotlari</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
          <div className="text-xs text-neutral-500">Boshlangan</div>
          <div className="mt-0.5 font-medium">
            {formattedStarted || ""}
          </div>
        </div>
        <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
          <div className="text-xs text-neutral-500">Yuborilgan</div>
          <div className="mt-0.5 font-medium">
            {formattedSubmitted || ""}
          </div>
        </div>
      </div>
      {scoringType === ScoringType.RASCH_SCORING && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          Rasch bali test yakunlangandan keyin hisoblab beriladi.
        </div>
      )}
      {scoringType === ScoringType.SIMPLE_SCORING && (
        <div className="rounded-md border border-green-200 bg-green-50 p-2 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
          Ballar test yakunlangandan keyin hisoblab beriladi.
        </div>
      )}
      {scoringType === ScoringType.UZ_DTM && (
        <div className="rounded-md border border-green-200 bg-green-50 p-2 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
          UZ DTM bali test yakunlangandan keyin hisoblab beriladi.
        </div>
      )}
    </section>
  );
}
