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
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
        <div className="mb-3 text-5xl">📊</div>
        <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
          Hali natijalar yo'q
        </p>
        <p className="mt-1 max-w-sm text-sm text-neutral-500">
          Test topshirsangiz, natijalaringiz shu yerda ko'rinadi.
        </p>
        <div className="mt-4 grid w-full max-w-md gap-2 text-left text-xs text-neutral-600 dark:text-neutral-400">
          <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            🔑 O'qituvchidan <b>test kodi</b> oling va botga yuboring
          </div>
          <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            🌍 Yoki <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">/public_tests</code> orqali ochiq testlardan birini topshiring
          </div>
          <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            🧠 Adaptive testni sinab ko'ring: <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">/cat</code>
          </div>
        </div>
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

