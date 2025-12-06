"use client";

import Link from "next/link";
import type { Test } from "@/types/test";
import { EDIT_TEST_ROUTE, TEST_ATTEMPTS_ROUTE } from "@/constants/routes";
import { formatLocalDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { testTypeText } from "@/lib/helpers";

export function InfoCard({
  test,
  telegramId,
  testId,
}: {
  test: Test;
  telegramId: string;
  testId: string;
}) {

  const onCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success("Kod nusxalandi");
  };
  return (
    <section className="mb-6 grid gap-3 rounded-md border border-neutral-200 p-4 shadow-sm dark:border-neutral-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-bold">Asosiy ma’lumotlar</h1>
        <span className="inline-flex items-center rounded-full border border-neutral-300 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
          Kod: <span className="ml-1 font-mono">{test.code}</span>
        </span>
      </div>
      <div className="grid gap-2 text-sm">
        {test.description && (
          <div className="text-neutral-700 dark:text-neutral-300">
            <span className="text-neutral-500">Tavsif:</span> {test.description}
          </div>
        )}
        {test.instructions && (
          <div className="text-neutral-700 dark:text-neutral-300">
            <span className="text-neutral-500">Ko‘rsatmalar:</span>{" "}
            {test.instructions}
          </div>
        )}
        <div>
          <span className="text-neutral-500">Test turi:</span> {testTypeText(test.scoring_type)}
        </div>
        {test.end_date && (
          <div>
            <span className="text-neutral-500">Tugash vaqti:</span>{" "}
            {formatLocalDate(test.end_date)}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href={EDIT_TEST_ROUTE({
              testId,
              telegramId,
              scoringType: test.scoring_type,
              sertificateType: test.sertificate_type,
              satSection: test.sat_section,
            })}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            Tahrirlash
          </Link>
          <Link
            href={TEST_ATTEMPTS_ROUTE({testId, telegramId: telegramId})}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            Urinishlar
          </Link>
          <button
            onClick={() => onCopy(test.code)}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            Kodni nusxalash
          </button>
        </div>
      </div>
    </section>
  );
}
