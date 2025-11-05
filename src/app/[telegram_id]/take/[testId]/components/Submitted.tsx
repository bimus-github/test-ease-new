"use client";

import { useGetFullSubmission } from "../hooks/useSubmission";
import { Timing } from "./submitted/Timing";
import { Meta } from "./submitted/Meta";
import { Analysis } from "./submitted/Analysis";

export function Submitted() {
  const { data: fullSubmission } = useGetFullSubmission();

  if (!fullSubmission)
    return (
      <section className="grid gap-3 rounded-lg border border-neutral-200 p-4 text-center text-sm dark:border-neutral-800">
        <div className="text-lg font-semibold">Urinish yuborildi</div>
        <div className="text-neutral-600">
          Natijangiz tez orada tayyor bo‘ladi.
        </div>
      </section>
    );

  const { started_at, submitted_at, test, user } = fullSubmission;

  return (
    <section className="grid gap-6">
      <Timing
        startedAt={started_at}
        submittedAt={submitted_at}
        scoringType={test.scoring_type}
      />
      <Meta user={user} test={test} />
      <Analysis fullSubmission={fullSubmission} />
    </section>
  );
}
