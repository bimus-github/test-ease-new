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
    <section className="grid gap-2 rounded-lg border border-neutral-200 p-4 text-sm dark:border-neutral-800">
      <h3 className="text-base font-medium">Vaqt ma’lumotlari</h3>
      <div className="grid gap-1 sm:grid-cols-2">
        <div>
          <span className="text-neutral-500">Boshlangan:</span>
          <span className="ml-2">
            {startedAt ? new Date(startedAt).toLocaleString() : "—"}
          </span>
        </div>
        <div>
          <span className="text-neutral-500">Yuborilgan:</span>
          <span className="ml-2">
            {submittedAt ? new Date(submittedAt).toLocaleString() : "—"}
          </span>
        </div>
      </div>
      {scoringType === ScoringType.RASCH_SCORING && (
        <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-amber-800">
          Rasch bali test yakunlangandan keyin hisoblab beriladi.
        </div>
      )}
    </section>
  );
}
