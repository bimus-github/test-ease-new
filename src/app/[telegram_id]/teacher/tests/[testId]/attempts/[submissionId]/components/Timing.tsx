"use client";

import { ScoringType } from "@/types/test";
import { formatLocalDate } from "@/lib/utils";

interface TimingProps {
  startedAt?: string;
  submittedAt?: string;
  scoringType: ScoringType;
}

export function Timing({ startedAt, submittedAt, scoringType }: TimingProps) {
  return (
    <section className="grid gap-3">
      <h3 className="text-base font-medium">Vaqt ma'lumotlari</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Boshlangan
          </div>
          <div className="font-medium text-neutral-900 dark:text-neutral-100">
            {startedAt ? formatLocalDate(startedAt) : "—"}
          </div>
        </div>
        <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Yuborilgan
          </div>
          <div className="font-medium text-neutral-900 dark:text-neutral-100">
            {submittedAt ? formatLocalDate(submittedAt) : "—"}
          </div>
        </div>
      </div>
      {scoringType === ScoringType.RASCH_SCORING && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          ⚠️ Rasch bali test yakunlangandan keyin hisoblab beriladi.
        </div>
      )}
    </section>
  );
}

