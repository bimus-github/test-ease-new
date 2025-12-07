"use client";

import Link from "next/link";
import { VIEW_TEST_ROUTE } from "@/constants/routes";
import { useCalculateRasch } from "../hooks";
import { useParams } from "next/navigation";
import { ScoringType, Test } from "@/types/test";
import { isPast, formatLocalDate } from "@/lib/utils";

interface AttemptsHeaderProps {
  test: Test;
  isFetching: boolean;
  onRefetch: () => void;
}

export function AttemptsHeader(props: AttemptsHeaderProps) {
  const { telegram_id: telegramId, testId } = useParams<{ telegram_id: string, testId: string }>();
  const { test, isFetching, onRefetch } = props;
  const {mutate: calculateRasch, isPending: isCalculating} = useCalculateRasch()

  const title = test.title;

  return (
    <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">{title} • Urinishlar</h2>
        <span className="text-xs text-neutral-500">
          {isFetching ? "Yangilanmoqda…" : ""}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CalculateRaschButton handleCalculateRasch={() => calculateRasch({ testId, onSuccess: () => {
          onRefetch();
        } })} isCalculating={isCalculating} test={test} />
        <Link
          href={VIEW_TEST_ROUTE({ telegramId, testId })}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Testga qaytish
        </Link>
      </div>
    </div>
  );
}


interface CalculateRaschButtonProps {
  handleCalculateRasch: () => void;
  isCalculating: boolean;
  test: Test;
}

const CalculateRaschButton = (props: CalculateRaschButtonProps) => {
  const { handleCalculateRasch, isCalculating, test } = props;

  const isRaschTest = test.scoring_type === ScoringType.RASCH_SCORING;
  const isPossible = isRaschTest && isPast(test.end_date);

  if(!isRaschTest) return null;

  if(!isPossible) return (
    <div className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
      <span>Rasch hisoblash uchun test yakunlanishi kerak.</span>
      <span>{test.end_date ? formatLocalDate(test.end_date) : ""}</span>
    </div>
  )

  if(isCalculating) return (
    <div className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
      <span>Rasch hisoblanmoqda…</span>
    </div>
  )

  return <button onClick={handleCalculateRasch} className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-60 dark:border-white dark:bg-white dark:text-black">Rasch hisoblash</button>
}
