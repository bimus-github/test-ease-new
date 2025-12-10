"use client";

import { ScoringType, SATSection, UZDTMSection } from "@/types/test";

interface ScoringBadgeProps {
  scoringType: ScoringType;
  satSection?: SATSection;
  uzDtmSection?: UZDTMSection;
}

export function ScoringBadge({ scoringType, satSection, uzDtmSection }: ScoringBadgeProps) {
  switch (scoringType) {
    case ScoringType.SAT_SCORING:
      return (
        <span className="inline-flex items-center rounded-full border border-purple-300 bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:border-purple-700 dark:bg-purple-950/30 dark:text-purple-300">
          SAT Test{satSection && ` (${satSection === SATSection.MATH ? "Matematika" : "Reading & Writing"})`}
        </span>
      );
    case ScoringType.RASCH_SCORING:
      return (
        <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
          Rasch Baholash
        </span>
      );
    case ScoringType.UZ_DTM:
      return (
        <span className="inline-flex items-center rounded-full border border-green-300 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-300">
          UZ DTM Test{uzDtmSection && ` (${uzDtmSection})`}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full border border-blue-300 bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
          Oddiy Baholash
        </span>
      );
  }
}

