"use client";

import type { FullSubmission } from "@/types/submission";
import { ResultsTable } from "./table/ResultsTable";
import { MobileCard } from "./MobileCard";
import { TEST_RESULT_ROUTE } from "@/constants/routes";

interface ResultsListProps {
  submissions: FullSubmission[];
  telegramId: string;
}

export function ResultsList({ submissions, telegramId }: ResultsListProps) {
  if (!submissions?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 rounded-full border border-dashed border-neutral-300 p-4 text-neutral-400 dark:border-neutral-700">
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M3 7h18M3 12h18M3 17h18" />
          </svg>
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Hozircha natijalar yo'q
        </p>
        <p className="mt-1 max-w-sm text-xs text-neutral-500">
          Test topshiring va natijalaringiz shu yerda paydo bo'ladi.
        </p>
      </div>
    );
  }

  const renderResultLink = (submissionId: string) => TEST_RESULT_ROUTE(submissionId, telegramId);

  return (
    <div className="grid gap-4">
      {/* Desktop Table */}
      <div className="hidden w-full overflow-x-auto rounded-lg border border-neutral-200 shadow-sm dark:border-neutral-800 md:block">
        <ResultsTable
          submissions={submissions}
          renderResultLink={renderResultLink}
        />
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {submissions.map((submission, index) => (
          <MobileCard
            key={submission.id}
            submission={submission}
            index={index}
            renderResultLink={renderResultLink}
          />
        ))}
      </div>
    </div>
  );
}

