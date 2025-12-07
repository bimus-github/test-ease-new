"use client";

import { ScoringType, SATSection } from "@/types/test";
import { formatLocalDate } from "@/lib/utils";

export function ConfirmStart({
  questionCount,
  endDate,
  scoringType,
  satSection,
  isStarting,
  onStart,
}: {
  questionCount: number;
  endDate?: string;
  scoringType: ScoringType;
  satSection?: SATSection;
  isStarting: boolean;
  onStart: () => Promise<void>;
}) {
  const getScoringInfo = () => {
    switch (scoringType) {
      case ScoringType.SAT_SCORING:
        return {
          title: "SAT Test",
          description: `Bu SAT test. Jami ${questionCount} ta savol.`,
          section: satSection === SATSection.MATH ? "Matematika" : "Reading & Writing",
          badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
        };
      case ScoringType.RASCH_SCORING:
        return {
          title: "Rasch Baholash",
          description: "Rasch bali test yakunlangandan keyin hisoblab beriladi.",
          badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
        };
      default:
        return {
          title: "Oddiy Baholash",
          description: `Jami ${questionCount} ta savol.`,
          badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
        };
    }
  };

  const info = getScoringInfo();

  return (
    <section className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-medium">Testni boshlaysizmi?</h3>
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${info.badgeColor}`}>
          {info.title}
        </span>
      </div>

      <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {info.description}
        </div>
        {info.section && (
          <div className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            Bo'lim: {info.section}
          </div>
        )}
      </div>

      <div className="grid gap-2 text-sm">
        <div className="flex items-center justify-between rounded-md border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-neutral-600 dark:text-neutral-400">Savollar soni:</span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{questionCount}</span>
        </div>
        {endDate && (
          <div className="flex items-center justify-between rounded-md border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-neutral-600 dark:text-neutral-400">Tugash vaqti:</span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {formatLocalDate(endDate)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onStart}
          disabled={isStarting}
          className="inline-flex flex-1 items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          {isStarting ? "Boshlanmoqda…" : "Boshlash"}
        </button>
        <span className="text-xs text-neutral-500">
          Boshlagach, vaqt ishlay boshlaydi.
        </span>
      </div>
    </section>
  );
}


