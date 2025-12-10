"use client";

import { ScoringType } from "@/types/test";
import type { FullSubmission } from "@/types/submission";

interface HeaderProps {
  submissions: FullSubmission[];
}

export function Header({ submissions }: HeaderProps) {
  // Determine which columns to show based on submissions
  const hasRaschTest = submissions.some(
    (s) =>
      s.test.scoring_type === ScoringType.RASCH_SCORING &&
      s.test.isRaschCalculated
  );
  const hasSatTest = submissions.some(
    (s) => s.test.scoring_type === ScoringType.SAT_SCORING
  );
  const hasUzDtmTest = submissions.some(
    (s) => s.test.scoring_type === ScoringType.UZ_DTM
  );

  return (
    <thead className="bg-neutral-50 text-xs dark:bg-neutral-900">
      <tr>
        <th className="px-3 py-2 font-medium text-neutral-600">#</th>
        <th className="px-3 py-2 font-medium text-neutral-600">Test nomi</th>
        <th className="px-3 py-2 font-medium text-neutral-600">Test turi</th>
        <th className="px-3 py-2 font-medium text-neutral-600">Yuborilgan</th>
        <th className="px-3 py-2 font-medium text-neutral-600">
          To'g'ri javoblar
        </th>
        {hasRaschTest && (
          <>
            <th className="px-3 py-2 font-medium text-neutral-600">
              Rasch T
            </th>
            <th className="px-3 py-2 font-medium text-neutral-600">Bahosi</th>
            <th className="px-3 py-2 font-medium text-neutral-600">Foizi</th>
          </>
        )}
        {hasSatTest && (
          <th className="px-3 py-2 font-medium text-neutral-600">SAT bali</th>
        )}
        {hasUzDtmTest && (
          <th className="px-3 py-2 font-medium text-neutral-600">UZ DTM bali</th>
        )}
        <th className="px-3 py-2 font-medium text-neutral-600">Amal</th>
      </tr>
    </thead>
  );
}

