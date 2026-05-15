"use client";

import { use, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPublicTestsAction } from "./actions";
import { ScoringType } from "@/types/test";
import { TAKE_TEST_ROUTE } from "@/constants/routes";
import { scoringTypeText } from "@/lib/helpers";

const SCORING_LABELS: Record<string, string> = {
  [ScoringType.SIMPLE_SCORING]: "Oddiy",
  [ScoringType.RASCH_SCORING]: "Sertifikat / Rasch",
  [ScoringType.SAT_SCORING]: "SAT",
  [ScoringType.UZ_DTM]: "UZ DTM",
};

export default function PublicTestsPage({
  params,
}: {
  params: Promise<{ telegram_id: string }>;
}) {
  const { telegram_id } = use(params);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [scoringType, setScoringType] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: tests, isLoading } = useQuery({
    queryKey: ["public-tests", debouncedSearch, scoringType],
    queryFn: () =>
      listPublicTestsAction(debouncedSearch || undefined, scoringType || undefined),
  });

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold">🌍 Public testlar</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Boshqa o'qituvchilarning ochiq testlarini topib, topshiring. Har testda top 10 o'quvchi ko'rinadi.
        </p>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr,180px]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sarlavhadan qidiring..."
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
        />
        <select
          value={scoringType}
          onChange={(e) => setScoringType(e.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
        >
          <option value="">Barcha turlar</option>
          {Object.entries(SCORING_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Yuklanmoqda...</p>
      ) : !tests?.length ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Hech qanday public test topilmadi
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tests.map((t) => (
            <a
              key={t.id}
              href={TAKE_TEST_ROUTE(t.id, telegram_id)}
              className="block rounded-lg border border-neutral-200 p-4 transition-all hover:border-neutral-400 hover:shadow-md dark:border-neutral-800 dark:hover:border-neutral-600"
            >
              <div className="mb-1 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold">{t.title}</h3>
                  {t.description && (
                    <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {t.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  {SCORING_LABELS[t.scoring_type] || scoringTypeText(t.scoring_type)}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                <span>📝 {t.question_count} savol</span>
                <span>👥 {t.submission_count} topshirgan</span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  Boshlash →
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
