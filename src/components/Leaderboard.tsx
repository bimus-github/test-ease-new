"use client";

import { useQuery } from "@tanstack/react-query";
import { getLeaderboardAction } from "@/app/[telegram_id]/student/public-tests/actions";

interface Props {
  testId: string;
  currentSubmissionId?: string;
}

export function Leaderboard({ testId, currentSubmissionId }: Props) {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["leaderboard", testId],
    queryFn: () => getLeaderboardAction(testId),
  });

  if (isLoading) {
    return <p className="text-sm text-neutral-500">Reyting yuklanmoqda...</p>;
  }
  if (!entries?.length) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500 dark:border-neutral-700">
        Hali topshirgan o'quvchi yo'q. Birinchi bo'ling!
      </div>
    );
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="rounded-lg border border-neutral-200 p-4 shadow-sm dark:border-neutral-800">
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
        🏆 Top 10 reyting
      </h3>
      <div className="grid gap-1">
        {entries.map((entry, i) => {
          const isCurrent = entry.submission_id === currentSubmissionId;
          return (
            <div
              key={entry.submission_id}
              className={`flex items-center gap-3 rounded-md p-2 text-sm transition-colors ${
                isCurrent
                  ? "bg-emerald-50 ring-1 ring-emerald-300 dark:bg-emerald-950/30 dark:ring-emerald-700"
                  : i % 2 === 0
                  ? "bg-neutral-50 dark:bg-neutral-900/50"
                  : ""
              }`}
            >
              <span className="w-8 text-center text-base">
                {medals[i] || <span className="text-neutral-500">{i + 1}</span>}
              </span>
              <span className="flex-1 truncate font-medium">
                {entry.student_name}
                {isCurrent && (
                  <span className="ml-1 text-xs text-emerald-700 dark:text-emerald-400">
                    (siz)
                  </span>
                )}
              </span>
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                {entry.rasch_score != null
                  ? `T: ${entry.rasch_score.toFixed(1)}`
                  : entry.row_score != null
                  ? `${entry.row_score}`
                  : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
