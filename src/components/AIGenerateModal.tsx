"use client";

import { useState } from "react";

interface GeneratedQuestion {
  question_text: string;
  question_type: "multiple_choice" | "fill_blank";
  options?: string[];
  correct_answer: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAccept: (questions: GeneratedQuestion[]) => void;
}

export function AIGenerateModal({ open, onClose, onAccept }: Props) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [language, setLanguage] = useState("o'zbek");
  const [questionType, setQuestionType] = useState<"multiple_choice" | "fill_blank" | "mixed">("multiple_choice");
  const [level, setLevel] = useState("o'rta");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<GeneratedQuestion[] | null>(null);

  const generate = async () => {
    setError(null);
    setPreview(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, count, language, questionType, level }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.details ? `\n\nTafsilot: ${typeof data.details === "string" ? data.details.slice(0, 300) : JSON.stringify(data.details).slice(0, 300)}` : "";
        setError((data.error || "Xato") + detail);
        return;
      }
      setPreview(data.questions);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">🤖 AI bilan savol generatsiya</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
            ✕
          </button>
        </div>

        {!preview ? (
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Mavzu</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                placeholder="Masalan: Newton qonunlari, Past simple Tense, O'rta asrlar tarixi..."
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Savollar soni</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 10)}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Til</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
                >
                  <option value="o'zbek">O'zbek</option>
                  <option value="rus">Rus</option>
                  <option value="ingliz">Ingliz</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Savol turi</label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as any)}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
                >
                  <option value="multiple_choice">Multiple Choice (A/B/C/D)</option>
                  <option value="fill_blank">Ochiq javob</option>
                  <option value="mixed">Aralash</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Daraja</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
                >
                  <option value="oson">Oson</option>
                  <option value="o'rta">O'rta</option>
                  <option value="qiyin">Qiyin</option>
                </select>
              </div>
            </div>

            {error && <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-400 whitespace-pre-wrap break-words">{error}</div>}

            <button
              type="button"
              onClick={generate}
              disabled={!topic || loading}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {loading ? "AI ishlamoqda... (15-30 sekund)" : "🤖 Generatsiya qilish"}
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {preview.length} ta savol yaratildi. Tasdiqlasangiz, ular savollar formangizga qo'shiladi.
            </p>
            <div className="max-h-96 overflow-y-auto grid gap-2">
              {preview.map((q, i) => (
                <div key={i} className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
                  <div className="font-medium">{i + 1}. {q.question_text}</div>
                  {q.options && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {q.options.map((opt) => (
                        <span key={opt} className={`rounded px-2 py-0.5 text-xs ${opt === q.correct_answer ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-neutral-100 dark:bg-neutral-800"}`}>
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                  {!q.options && (
                    <div className="mt-1 text-xs text-green-700 dark:text-green-400">
                      Javob: {q.correct_answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="flex-1 rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                Qaytadan
              </button>
              <button
                type="button"
                onClick={() => { onAccept(preview); onClose(); setPreview(null); setTopic(""); }}
                className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
              >
                ✅ Qabul qilish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
