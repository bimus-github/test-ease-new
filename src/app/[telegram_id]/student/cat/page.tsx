"use client";

import { use, useState } from "react";
import { QuestionMedia } from "@/components/QuestionMedia";
import { gradeFromT } from "@/lib/helpers";

interface CatQuestion {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "fill_blank";
  options?: string[];
  rasch_difficulty: number;
  media_url?: string;
  media_type?: "image" | "audio";
}

interface FinalResult {
  theta: number;
  se: number;
  tScore: number;
  administered: number;
}

export default function CatPage({
  params,
}: {
  params: Promise<{ telegram_id: string }>;
}) {
  const { telegram_id } = use(params);
  const [stage, setStage] = useState<"intro" | "answering" | "done">("intro");
  const [subject, setSubject] = useState("Aralash");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<CatQuestion | null>(null);
  const [theta, setTheta] = useState(0);
  const [se, setSe] = useState<number | null>(null);
  const [administered, setAdministered] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFeedback, setLastFeedback] = useState<"correct" | "wrong" | null>(null);
  const [result, setResult] = useState<FinalResult | null>(null);

  const start = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/cat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: telegram_id, subject }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Boshlashda xato");
        return;
      }
      setSessionId(data.sessionId);
      setQuestion(data.question);
      setTheta(data.theta || 0);
      setStage("answering");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!sessionId || !question || !answer) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cat/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: question.id,
          answer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Javob yuborishda xato");
        return;
      }
      setLastFeedback(data.correct ? "correct" : "wrong");
      setTheta(data.theta);
      setSe(data.se);
      setAdministered(data.administered);
      setAnswer("");

      // Brief visual feedback delay
      setTimeout(() => {
        setLastFeedback(null);
        if (data.done) {
          setResult({
            theta: data.theta,
            se: data.se,
            tScore: data.tScore,
            administered: data.administered,
          });
          setStage("done");
        } else {
          setQuestion(data.question);
        }
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  if (stage === "intro") {
    return (
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <h1 className="mb-2 text-xl font-bold">🧠 Adaptive test</h1>
        <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
          Bu test sizning darajangizga moslashadi. Har savoldan keyin keyingi savol sizning natijangizga qarab tanlanadi.
          5-20 ta savol davom etadi.
        </p>

        <div className="mb-4 grid gap-2">
          <label className="text-sm font-medium">Yo'nalish</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
          >
            <option value="Aralash">Aralash (barcha mavjud)</option>
            <option value="Matematika">Matematika</option>
            <option value="Fizika">Fizika</option>
            <option value="Kimyo">Kimyo</option>
            <option value="Biologiya">Biologiya</option>
            <option value="Tarix">Tarix</option>
            <option value="Geografiya">Geografiya</option>
            <option value="Ingliz tili">Ingliz tili</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={start}
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading ? "Tayyorlanmoqda..." : "🚀 Testni boshlash"}
        </button>
      </div>
    );
  }

  if (stage === "done" && result) {
    const grade = gradeFromT(result.tScore);
    return (
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <h1 className="mb-2 text-xl font-bold">🎉 Test yakunlandi</h1>

        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Sizning natijangiz
          </div>
          <div className="text-5xl font-bold text-emerald-700 dark:text-emerald-300">
            {grade}
          </div>
          <div className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
            T-bahosi: {result.tScore.toFixed(1)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-xs text-neutral-500">Qobiliyat (θ)</div>
            <div className="text-lg font-semibold">{result.theta.toFixed(2)}</div>
          </div>
          <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-xs text-neutral-500">Aniqlik (SE)</div>
            <div className="text-lg font-semibold">±{result.se.toFixed(2)}</div>
          </div>
          <div className="col-span-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-xs text-neutral-500">Berilgan savollar</div>
            <div className="text-lg font-semibold">{result.administered}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setStage("intro");
            setResult(null);
            setSessionId(null);
            setQuestion(null);
            setTheta(0);
            setSe(null);
            setAdministered(0);
            setLastFeedback(null);
          }}
          className="mt-6 w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Qaytadan boshlash
        </button>
      </div>
    );
  }

  // answering
  if (!question) return null;
  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-600 dark:text-neutral-400">
            Savol #{administered + 1}
          </span>
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            θ: {theta.toFixed(2)} {se != null && `(±${se.toFixed(2)})`}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{
              width: `${Math.min(100, Math.max(0, ((theta + 5) / 10) * 100))}%`,
            }}
          />
        </div>
      </div>

      <div
        className={`rounded-lg border-2 p-4 transition-colors ${
          lastFeedback === "correct"
            ? "border-green-500 bg-green-50 dark:bg-green-950/30"
            : lastFeedback === "wrong"
            ? "border-red-500 bg-red-50 dark:bg-red-950/30"
            : "border-neutral-200 dark:border-neutral-800"
        }`}
      >
        <div className="mb-3 text-base font-medium">{question.question_text}</div>

        <QuestionMedia url={question.media_url} type={question.media_type} />

        {question.question_type === "multiple_choice" && (
          <div className="grid gap-2">
            {(question.options || []).map((opt) => (
              <label
                key={opt}
                className={`flex cursor-pointer items-center gap-3 rounded-md border-2 p-3 transition-all ${
                  answer === opt
                    ? "border-neutral-900 bg-neutral-100 dark:border-neutral-100 dark:bg-neutral-800"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  checked={answer === opt}
                  onChange={() => setAnswer(opt)}
                  className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
                  disabled={loading || lastFeedback !== null}
                />
                <span className="flex-1 text-sm">{opt}</span>
              </label>
            ))}
          </div>
        )}

        {question.question_type === "fill_blank" && (
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={loading || lastFeedback !== null}
            placeholder="Javobingizni kiriting"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
          />
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={submitAnswer}
        disabled={!answer || loading || lastFeedback !== null}
        className="mt-4 w-full rounded-md bg-black px-4 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {loading
          ? "Yuborilmoqda..."
          : lastFeedback === "correct"
          ? "✓ To'g'ri — Keyingi..."
          : lastFeedback === "wrong"
          ? "✗ Noto'g'ri — Keyingi..."
          : "Tasdiqlash"}
      </button>
    </div>
  );
}
