import type { FullSubmission } from "@/types/submission";
import { Test, ScoringType } from "@/types/test";
import Link from "next/link";
import { gradeFromT, percentageFromT, calculateSatScore, calculatePoints } from "@/lib/helpers";

interface MobileCardProps {
  submission: FullSubmission;
  index: number;
  test: Test;
  renderResultLink: (submissionId: string) => string;
}

function MobileCard(props: MobileCardProps) {
  const { submission, index, test, renderResultLink } = props;
  
  const isRaschTest = test.scoring_type === ScoringType.RASCH_SCORING;
  const isRaschCalculated = test.isRaschCalculated ?? false;
  const showRasch = isRaschTest && isRaschCalculated;
  const isSatTest = test.scoring_type === ScoringType.SAT_SCORING;
  const isUzDtmTest = test.scoring_type === ScoringType.UZ_DTM;
  const isSimpleTest = test.scoring_type === ScoringType.SIMPLE_SCORING;
  
  const t = submission.rasch_score;
  const satScore = isSatTest ? calculateSatScore(submission) : null;
  const uzDtmPoints = isUzDtmTest ? calculatePoints(submission) : null;
  const simplePoints = isSimpleTest ? calculatePoints(submission) : null;

  return (
    <div className="group rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            {index + 1}
          </span>
          <div>
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
              {submission.user.telegram_first_name} {submission.user.telegram_last_name}
            </div>
            <Link
              target="_blank"
              href={`https://t.me/${submission.user.telegram_username}`}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              @{submission.user.telegram_username}
            </Link>
          </div>
        </div>
        <a
          href={renderResultLink(submission.id)}
          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          Ko'rish
        </a>
      </div>
    
      {/* Stats Grid */}
      <div className="space-y-2.5">
        {/* Date/Time Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md bg-neutral-50 p-2 dark:bg-neutral-800/50">
            <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Boshlangan
            </div>
            <div className="font-medium text-neutral-900 dark:text-neutral-100">
              {new Date(submission.started_at).toLocaleString("uz-UZ", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div className="rounded-md bg-neutral-50 p-2 dark:bg-neutral-800/50">
            <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Yuborilgan
            </div>
            <div className="font-medium text-neutral-900 dark:text-neutral-100">
              {submission.submitted_at
                ? new Date(submission.submitted_at).toLocaleString("uz-UZ", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-2">
          {/* Correct Answers */}
          <div className="rounded-md bg-blue-50 p-2.5 dark:bg-blue-950/30">
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
              To'g'ri javoblar
            </div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {submission.row_score ?? "—"}
            </div>
          </div>

          {/* SAT Score or UZ DTM Points or Simple Points or Rasch/Space */}
          {isSatTest ? (
            <div className="rounded-md bg-purple-50 p-2.5 dark:bg-purple-950/30">
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-purple-600 dark:text-purple-400">
                SAT bali
              </div>
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                {satScore ?? "—"}
              </div>
            </div>
          ) : isUzDtmTest ? (
            <div className="rounded-md bg-green-50 p-2.5 dark:bg-green-950/30">
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-green-600 dark:text-green-400">
                UZ DTM bali
              </div>
              <div className="text-lg font-bold text-green-700 dark:text-green-300">
                {uzDtmPoints != null ? uzDtmPoints.toFixed(1) : "—"}
              </div>
            </div>
          ) : isSimpleTest ? (
            <div className="rounded-md bg-green-50 p-2.5 dark:bg-green-950/30">
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-green-600 dark:text-green-400">
                Ballar
              </div>
              <div className="text-lg font-bold text-green-700 dark:text-green-300">
                {simplePoints != null ? simplePoints.toFixed(1) : "—"}
              </div>
            </div>
          ) : showRasch ? (
            <div className="rounded-md bg-emerald-50 p-2.5 dark:bg-emerald-950/30">
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Rasch T
              </div>
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {t != null ? t.toFixed(1) : "—"}
              </div>
            </div>
          ) : (
            <div></div>
          )}
        </div>

        {/* Rasch Details */}
        {showRasch && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-neutral-50 p-2 dark:bg-neutral-800/50">
              <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Bahosi
              </div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                {t != null ? gradeFromT(t) : "—"}
              </div>
            </div>
            <div className="rounded-md bg-neutral-50 p-2 dark:bg-neutral-800/50">
              <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Foizi
              </div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                {t != null ? percentageFromT(t) : "—"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileCard;

