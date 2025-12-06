import type { FullSubmission } from "@/types/submission";
import { Test, ScoringType } from "@/types/test";
import Link from "next/link";
import { gradeFromT, percentageFromT, calculateSatScore } from "@/lib/helpers";
import { formatLocalDate } from "@/lib/utils";

interface RowProps {
  submission: FullSubmission;
  index: number;
  test: Test;
  renderResultLink: (submissionId: string) => string;
}

function Row(props: RowProps) {
  const { submission, index, test, renderResultLink } = props;
  
  const isRaschTest = test.scoring_type === ScoringType.RASCH_SCORING;
  const isRaschCalculated = test.isRaschCalculated ?? false;
  const showRasch = isRaschTest && isRaschCalculated;
  const isSatTest = test.scoring_type === ScoringType.SAT_SCORING;
  
  const t = submission.rasch_score;
  const satScore = isSatTest ? calculateSatScore(submission) : null;

  return (
    <tr
      className="border-t border-neutral-200 hover:bg-neutral-50/60 dark:border-neutral-800 dark:hover:bg-neutral-900/50"
    >
      <td className="px-3 py-2">{index + 1}</td>
      <td className="px-3 py-2">
        <div className="font-medium">
          {submission.user.telegram_first_name} {submission.user.telegram_last_name}
        </div>
        <Link
          target="_blank"
          href={`https://t.me/${submission.user.telegram_username}`}
          className="text-xs text-blue-500"
        >
          @{submission.user.telegram_username}
        </Link>
      </td>
      <td className="px-3 py-2">
        {formatLocalDate(submission.submitted_at)}
      </td>
      <td className="px-3 py-2">{submission.row_score ?? "—"}</td>
      {showRasch && (
        <>
          <td className="px-3 py-2">{t != null ? t : "—"}</td>
          <td className="px-3 py-2">
            {t != null ? gradeFromT(t) : "—"}
          </td>
          <td className="px-3 py-2">
            {t != null ? percentageFromT(t) : "—"}
          </td>
        </>
      )}
      {isSatTest && (
        <td className="px-3 py-2">{satScore ?? "—"}</td>
      )}
      <td className="px-3 py-2">
        <a
          href={renderResultLink(submission.id)}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Ko'rish
        </a>
      </td>
    </tr>
  );
}

export default Row;

