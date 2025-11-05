"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAttemptFullSubmissionAction } from "./actions";
import { Timing } from "@/app/[telegram_id]/take/[testId]/components/submitted/Timing";
import { Meta } from "@/app/[telegram_id]/take/[testId]/components/submitted/Meta";
import { Analysis } from "@/app/[telegram_id]/take/[testId]/components/submitted/Analysis";
import Link from "next/link";
import { TEST_ATTEMPTS_ROUTE, VIEW_TEST_ROUTE } from "@/constants/routes";

export default function AttemptResultClient() {
  const { telegram_id, testId, submission_id } = useParams<{
    telegram_id: string;
    testId: string;
    submission_id: string;
  }>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["attempt-result", submission_id],
    queryFn: async () => {
      const res = await getAttemptFullSubmissionAction({
        submissionId: submission_id,
      });
      if (res.ok) return res.submission;
      throw new Error(res.error);
    },
    enabled: Boolean(submission_id),
  });

  if (!submission_id) return null;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">Yuklanmoqda…</main>
    );
  }

  if (isError || !data) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Natija topilmadi</h2>
          <Link
            href={VIEW_TEST_ROUTE(testId, telegram_id)}
            className="rounded border px-2.5 py-1 text-xs"
          >
            Orqaga
          </Link>
        </div>
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Yuklashda xatolik.{" "}
          <button onClick={() => refetch()} className="ml-2 underline">
            Qayta urinish
          </button>
        </div>
      </main>
    );
  }

  const fullSubmission = data;

  console.log(fullSubmission.answers);

  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Urinish natijasi</h2>
        <Link
          href={TEST_ATTEMPTS_ROUTE(testId, telegram_id)}
          className="rounded border px-2.5 py-1 text-xs"
        >
          Orqaga
        </Link>
      </div>

      <Timing
        startedAt={fullSubmission.started_at}
        submittedAt={fullSubmission.submitted_at}
        scoringType={fullSubmission.test.scoring_type}
      />
      <Meta user={fullSubmission.user} test={fullSubmission.test} />
      <Analysis fullSubmission={fullSubmission} />
    </main>
  );
}
