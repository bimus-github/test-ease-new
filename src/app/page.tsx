"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FullSubmission } from "@/types/submission";
import { calculateRasch } from "@/lib/rasch";
import { calculateRowScore, gradeFromT } from "@/lib/helpers";
import { Questions, test } from "@/constants/fake-data/test";
import { generateSubmissions } from "@/constants/fake-data/submission";

const testWithQuestions = {
  ...test,
  questions: Questions,
};

interface CalculationResults {
  questionDifficulties: Map<string, number>;
  statistics: {
    ability: { mean: number; stdDev: number; min: number; max: number };
    difficulty: { mean: number; stdDev: number; min: number; max: number };
    gradeDistribution: Record<string, number>;
  };
}

export default function RaschFakePage() {
  const [submissions, setSubmissions] = useState<FullSubmission[]>(() => {
    const genSubmissions = generateSubmissions(100);
    return genSubmissions.map((s) => ({
      ...s,
      test: testWithQuestions,
      user: { telegram_id: s.user_tg_id } as any,
      questions: Questions,
    }));
  });
  const [isCalculated, setIsCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResults, setCalculationResults] =
    useState<CalculationResults | null>(null);

  const handleCalculateRasch = () => {
    setIsCalculating(true);
    try {
      const submissionsCopy = submissions.map((s) => ({ ...s }));
      const result = calculateRasch(submissionsCopy, Questions);

      const questionDifficultiesArray = Array.from(
        result.questionDifficulties.entries()
      ).map(([question_id, difficulty]) => ({
        question_id,
        difficulty: Number(difficulty.toFixed(4)),
      }));

      const submissionScoresArray = submissionsCopy.map((s) => ({
        submission_id: s.id,
        user_tg_id: s.user.telegram_id,
        rasch_ability: s.rasch_ability
          ? Number(s.rasch_ability.toFixed(4))
          : undefined,
        rasch_z_score: s.rasch_ability
          ? Number(s.rasch_ability.toFixed(4))
          : undefined,
        rasch_score: s.rasch_score
          ? Number(s.rasch_score.toFixed(2))
          : undefined,
        rasch_grade: s.rasch_score ? gradeFromT(s.rasch_score) : "Ega emas",
      }));

      console.log("=== Savollar qiyinligi ===");
      console.log(questionDifficultiesArray);
      console.log("=== Topshiriqlar ballari ===");
      console.log(submissionScoresArray);
      console.log("=== Umumiy statistika ===");
      console.log(result.statistics);

      setSubmissions(submissionsCopy);
      setCalculationResults(result);
      setIsCalculated(true);
      toast.success("Rasch hisoblash muvaffaqiyatli yakunlandi");
    } catch (error) {
      console.error("Rasch hisoblashda xatolik:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Noma'lum xatolik yuz berdi";
      toast.error(`Rasch hisoblashda xatolik: ${errorMessage}`, {
        duration: 5000,
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const getGradeColor = (grade: string | undefined) => {
    if (!grade) return "";
    if (grade === "A+" || grade === "A")
      return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
    if (grade === "B+" || grade === "B")
      return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
    if (grade === "C+" || grade === "C")
      return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
    return "";
  };

  const questionDifficultiesSorted = calculationResults
    ? Array.from(calculationResults.questionDifficulties.entries())
        .map(([questionId, difficulty]) => {
          const question = Questions.find((q) => q.id === questionId);
          return {
            questionId,
            questionLabel: question?.question_label || "",
            difficulty,
          };
        })
        .sort((a, b) => b.difficulty - a.difficulty)
    : [];

  const submissionsSorted = [...submissions].sort((a, b) => {
    const scoreA = a.rasch_score ?? -Infinity;
    const scoreB = b.rasch_score ?? -Infinity;
    return scoreB - scoreA;
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8 rounded-md border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
          {/* Logo */}
          <div className="mb-6 flex justify-center sm:justify-start">
            <div className="relative h-10 w-auto sm:h-12">
              <img
                src="/logo/vector/default.svg"
                alt="Logo"
                className="h-full w-auto dark:hidden"
              />
              <img
                src="/logo/vector/default-monochrome-white.svg"
                alt="Logo"
                className="hidden h-full w-auto dark:block"
              />
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Rasch Modeli Sinov Sahifasi
              </h1>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 sm:text-base">
                Rasch modeli yordamida test natijalarini tahlil qilish va
                savollar qiyinligini hisoblash
              </p>
            </div>
            <button
              onClick={handleCalculateRasch}
              disabled={isCalculating}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99] dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 sm:px-6 sm:py-3"
            >
              {isCalculating ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Hisoblanmoqda...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  Rasch hisoblashni boshlash
                </>
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-800">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Topshiriqlar
              </div>
              <div className="mt-1 text-lg font-semibold">
                {submissions.length}
              </div>
            </div>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-800">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Savollar
              </div>
              <div className="mt-1 text-lg font-semibold">
                {Questions.length}
              </div>
            </div>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-800">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Holat
              </div>
              <div className="mt-1 text-sm font-medium">
                {isCalculated ? (
                  <span className="text-green-600 dark:text-green-400">
                    Hisoblangan
                  </span>
                ) : (
                  <span className="text-neutral-500">Kutilmoqda</span>
                )}
              </div>
            </div>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-800">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Test
              </div>
              <div className="mt-1 text-sm font-medium truncate">
                {test.title}
              </div>
            </div>
          </div>
        </div>

        {isCalculated && calculationResults && (
          <div className="space-y-6">
            {/* Statistics Overview */}
            <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
              <h2 className="mb-4 text-lg font-semibold sm:text-xl">
                Umumiy statistika
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
                  <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Talabalarning qobiliyati (θ)
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        O'rtacha:
                      </span>
                      <span className="font-mono font-medium">
                        {calculationResults.statistics.ability.mean.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Standart og'ish:
                      </span>
                      <span className="font-mono font-medium">
                        {calculationResults.statistics.ability.stdDev.toFixed(
                          4
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Minimal:
                      </span>
                      <span className="font-mono font-medium">
                        {calculationResults.statistics.ability.min.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Maksimal:
                      </span>
                      <span className="font-mono font-medium">
                        {calculationResults.statistics.ability.max.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
                  <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Savollar qiyinligi
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        O'rtacha:
                      </span>
                      <span className="font-mono font-medium">
                        {calculationResults.statistics.difficulty.mean.toFixed(
                          4
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Standart og'ish:
                      </span>
                      <span className="font-mono font-medium">
                        {calculationResults.statistics.difficulty.stdDev.toFixed(
                          4
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Minimal:
                      </span>
                      <span className="font-mono font-medium">
                        {calculationResults.statistics.difficulty.min.toFixed(
                          4
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Maksimal:
                      </span>
                      <span className="font-mono font-medium">
                        {calculationResults.statistics.difficulty.max.toFixed(
                          4
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800 sm:col-span-2 lg:col-span-1">
                  <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Baholar taqsimoti
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    {Object.entries(
                      calculationResults.statistics.gradeDistribution
                    )
                      .sort(([, a], [, b]) => b - a)
                      .map(([grade, count]) => (
                        <div key={grade} className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">
                            {grade}:
                          </span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
              <h2 className="mb-4 text-lg font-semibold sm:text-xl">
                Talabalar ballari
              </h2>
              <div className="overflow-x-auto">
                <div className="hidden overflow-x-auto rounded-md border border-neutral-200 dark:border-neutral-800 sm:block">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-xs dark:bg-neutral-900">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-neutral-600">
                          #
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-neutral-600">
                          Foydalanuvchi ID
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-neutral-600">
                          Xom ball
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-neutral-600">
                          θ (Qobiliyat)
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-neutral-600">
                          T-bahosi
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-neutral-600">
                          Baho
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissionsSorted.map((submission, index) => (
                        <tr
                          key={submission.id}
                          className={`border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/60 dark:hover:bg-neutral-900/50 ${getGradeColor(
                            submission.rasch_score
                              ? gradeFromT(submission.rasch_score)
                              : "Ega emas"
                          )}`}
                        >
                          <td className="px-3 py-2 text-center font-mono text-xs">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                            {submission.user.telegram_id}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {calculateRowScore(submission)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {submission.rasch_ability?.toFixed(4) ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-medium">
                            {submission.rasch_score?.toFixed(2) ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-center font-medium">
                            {submission.rasch_score
                              ? gradeFromT(submission.rasch_score)
                              : "Ega emas"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="grid gap-3 sm:hidden">
                  {submissionsSorted.map((submission, index) => (
                    <div
                      key={submission.id}
                      className={`rounded-md border p-3 text-sm ${getGradeColor(
                        submission.rasch_score
                          ? gradeFromT(submission.rasch_score)
                          : "Ega emas"
                      )}`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">#{index + 1}</span>
                        <span className="font-medium">
                          {submission.rasch_score
                            ? gradeFromT(submission.rasch_score)
                            : "Ega emas"}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                        <div>
                          To‘g‘ri javoblar: {calculateRowScore(submission)}
                        </div>
                        <div>
                          θ: {submission.rasch_ability?.toFixed(4) ?? "—"}
                        </div>
                        <div>
                          T-bahosi: {submission.rasch_score?.toFixed(2) ?? "—"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Questions Difficulty Table */}
            <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
              <h2 className="mb-4 text-lg font-semibold sm:text-xl">
                Savollar qiyinligi
              </h2>
              <div className="overflow-x-auto">
                <div className="hidden overflow-x-auto rounded-md border border-neutral-200 dark:border-neutral-800 sm:block">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-xs dark:bg-neutral-900">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-neutral-600">
                          Savol #
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-neutral-600">
                          Qiyinlik
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {questionDifficultiesSorted.map(
                        ({ questionId, questionLabel, difficulty }) => (
                          <tr
                            key={questionId}
                            className="border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/60 dark:hover:bg-neutral-900/50"
                          >
                            <td className="px-3 py-2">{questionLabel}</td>
                            <td className="px-3 py-2 text-right font-mono font-medium">
                              {difficulty.toFixed(4)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="grid gap-3 sm:hidden">
                  {questionDifficultiesSorted.map(
                    ({ questionLabel, difficulty }) => (
                      <div
                        key={questionLabel}
                        className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800"
                      >
                        <div className="mb-1 font-medium">{questionLabel}</div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                          Qiyinlik:{" "}
                          <span className="font-mono font-medium">
                            {difficulty.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!isCalculated && (
          <div className="rounded-md border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-700">
              <svg
                className="h-6 w-6 text-neutral-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              Bu yerda Rasch moduli asosida hisoblangan natijalar ko‘rsatiladi.
              Hisoblashni boshlang va natijalaringiz shu yerda paydo bo‘ladi.
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Natijalarni ko‘rish uchun yuqoridagi tugmani bosing va hisoblashni
              boshlang.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
