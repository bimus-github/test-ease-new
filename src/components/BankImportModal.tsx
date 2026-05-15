"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyBankAction } from "@/app/[telegram_id]/teacher/question-bank/actions";
import { QuestionMedia } from "./QuestionMedia";
import type { BankQuestion } from "@/types/question-bank";
import type { QuestionForm } from "@/types/question";

interface Props {
  teacherId: string;
  open: boolean;
  onClose: () => void;
  onImport: (questions: QuestionForm[]) => void;
}

export function BankImportModal({ teacherId, open, onClose, onImport }: Props) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) {
      setSelected(new Set());
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: questions, isLoading } = useQuery({
    queryKey: ["bank-import", teacherId, debouncedSearch],
    queryFn: () => getMyBankAction(teacherId, debouncedSearch || undefined),
    enabled: open,
  });

  if (!open) return null;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImport = () => {
    if (!questions) return;
    const picked = questions.filter((q) => selected.has(q.id));
    const converted: QuestionForm[] = picked.map((q: BankQuestion) => ({
      test_id: "",
      question_label: "",
      question_text: q.question_text,
      question_type: q.question_type === "true_false" ? "multiple_choice" : q.question_type,
      question_order: 0,
      points: q.points || 1,
      is_required: true,
      is_multiple_answers: q.is_multiple_answers,
      options: q.options,
      correct_answer: q.correct_answer,
      correct_options: q.correct_options,
      media_url: q.media_url,
      media_type: q.media_type,
    }));
    onImport(converted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
          <h3 className="text-lg font-semibold">📚 Bankdan import qilish</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
            ✕
          </button>
        </div>

        <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Savol matnidan qidiring..."
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <p className="text-sm text-neutral-500">Yuklanmoqda...</p>
          ) : !questions?.length ? (
            <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {debouncedSearch ? "Hech narsa topilmadi" : "Bank bo'sh — avval savol saqlang"}
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {questions.map((q: BankQuestion) => {
                const isSelected = selected.has(q.id);
                return (
                  <label
                    key={q.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30"
                        : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(q.id)}
                      className="mt-1 h-4 w-4 cursor-pointer accent-emerald-600"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {q.question_text}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1 text-xs">
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
                      <QuestionMedia url={q.media_url} type={q.media_type} className="mt-2" />
                      {q.options && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {q.options.map((opt) => (
                            <span
                              key={opt}
                              className={`rounded px-2 py-0.5 text-xs ${
                                opt === q.correct_answer
                                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                  : "bg-neutral-100 dark:bg-neutral-800"
                              }`}
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Tanlangan: {selected.size}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={selected.size === 0}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
            >
              ✅ {selected.size} ta qo'shish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
