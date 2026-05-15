"use client";

import { Timing } from "./submitted/Timing";
import { Meta } from "./submitted/Meta";
import { ScoreSummary } from "./submitted/ScoreSummary";
import { Analysis } from "./submitted/Analysis";
import { Leaderboard } from "@/components/Leaderboard";
import { useAppSelector } from "@/store/hooks";
import { useGetFullSubmission } from "../hooks";

export function Submitted() {
  const submissionId = useAppSelector((s) => s.take.submissionId ?? "");
  const submissionQuery = useGetFullSubmission(submissionId);

  if (!submissionQuery.data)
    return (
      <section className="grid gap-3 rounded-lg border border-neutral-200 p-4 text-center text-sm dark:border-neutral-800">
        <div className="text-lg font-semibold">Urinish yuborildi</div>
        <div className="text-neutral-600">
          Natijangiz tez orada tayyor bo‘ladi.
        </div>
      </section>
    );

  const { started_at, submitted_at } = submissionQuery.data;

  return (
    <section className="grid gap-6">
      <Timing
        startedAt={started_at}
        submittedAt={submitted_at}
        scoringType={submissionQuery.data.test.scoring_type}
      />
      <Meta user={submissionQuery.data.user} test={submissionQuery.data.test} />
      <ScoreSummary fullSubmission={submissionQuery.data} />
      {submissionQuery.data.test.is_public && (
        <Leaderboard
          testId={submissionQuery.data.test.id}
          currentSubmissionId={submissionQuery.data.id}
        />
      )}
      <Analysis fullSubmission={submissionQuery.data} />
    </section>
  );
}
