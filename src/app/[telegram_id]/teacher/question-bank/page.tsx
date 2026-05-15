"use client";

import { useState, useEffect, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyBankAction, deleteFromBankAction } from "./actions";
import { QuestionMedia } from "@/components/QuestionMedia";
import type { BankQuestion } from "@/types/question-bank";

export default function QuestionBankPage({
  params,
}: {
  params: Promise<{ telegram_id: string }>;
}) {
  const { telegram_id } = use(params);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const qc = useQueryClient();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: questions, isLoading } = useQuery({
    queryKey: ["question-bank", telegram_id, debouncedSearch],
    queryFn: () => getMyBankAction(telegram_id, debouncedSearch || undefined),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFromBankAction(id, telegram_id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["question-bank", telegram_id] }),
  });

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">📚 Savol banki</h1>
        <span className="text-xs text-neutral-500">
          {questions?.length ?? 0} ta savol
        </span>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Savol matnidan qidiring..."
        className="mb-4 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
      />

      {isLoading ? (
        <p className="text-sm text-neutral-500">Yuklanmoqda...</p>
      ) : !questions?.length ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
          <p className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Savol banki bo'sh
          </p>
          <p className="text-xs text-neutral-500">
            Test yaratish jarayonida savollarni "Bankga saqlash" tugmasi bilan qo'shing.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {questions.map((q: BankQuestion) => (
            <div
              key={q.id}
              className="rounded-lg border border-neutral-200 p-4 shadow-sm dark:border-neutral-800"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {q.question_text}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {q.question_type}
                    </span>
                    {q.subject && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {q.subject}
                      </span>
                    )}
                    {q.tags?.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("O'chirishni tasdiqlaysizmi?")) {
                      deleteMut.mutate(q.id);
                    }
                  }}
                  disabled={deleteMut.isPending}
                  className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                >
                  O'chirish
                </button>
              </div>

              <QuestionMedia url={q.media_url} type={q.media_type} />

              {q.question_type === "multiple_choice" && q.options && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {q.options.map((opt) => (
                    <span
                      key={opt}
                      className={`rounded-md border px-2 py-0.5 text-xs ${
                        opt === q.correct_answer
                          ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                          : "border-neutral-300 dark:border-neutral-700"
                      }`}
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              )}
              {q.question_type === "fill_blank" && q.correct_answer && (
                <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                  Javob: <span className="font-mono">{q.correct_answer}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
