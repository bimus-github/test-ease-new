"use client";

import { ScoringType } from "@/types/test";

export function Timing({
  startedAt,
  submittedAt,
  scoringType,
}: {
  startedAt?: string;
  submittedAt?: string;
  scoringType: ScoringType;
}) {
  return (
    <section className="grid gap-3 rounded-md border border-neutral-200 p-4 text-sm shadow-sm dark:border-neutral-800">
      <h3 className="text-base font-medium">Vaqt ma’lumotlari</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
          <div className="text-xs text-neutral-500">Boshlangan</div>
          <div className="mt-0.5 font-medium">
            {startedAt ? new Date(startedAt).toLocaleString() : "—"}
          </div>
        </div>
        <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
          <div className="text-xs text-neutral-500">Yuborilgan</div>
          <div className="mt-0.5 font-medium">
            {submittedAt ? new Date(submittedAt).toLocaleString() : "—"}
          </div>
        </div>
      </div>
      {scoringType === ScoringType.RASCH_SCORING && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-800">
          Rasch bali test yakunlangandan keyin hisoblab beriladi.
        </div>
      )}
    </section>
  );
}
