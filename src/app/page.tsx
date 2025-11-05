"use client";

import { useState } from "react";
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
    // Add questions to each submission for FullSubmission type
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
      // Create a copy of submissions for calculation (calculateRasch mutates in-place)
      const submissionsCopy = submissions.map((s) => ({ ...s }));
      const result = calculateRasch(submissionsCopy, Questions);

      // Prepare data for console.log
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

      // Console.log results (requirement 2a)
      console.log("=== Savollar qiyinligi ===");
      console.log(questionDifficultiesArray);
      console.log("=== Topshiriqlar ballari ===");
      console.log(submissionScoresArray);
      console.log("=== Umumiy statistika ===");
      console.log(result.statistics);

      // Update state with modified submissions
      setSubmissions(submissionsCopy);
      setCalculationResults(result);
      setIsCalculated(true);
    } catch (error) {
      console.error("Rasch hisoblashda xatolik:", error);
      alert("Rasch hisoblashda xatolik: " + (error as Error).message);
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
    if (grade === "C dan quyi")
      return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
    return "";
  };

  // Prepare question difficulties sorted by difficulty
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
        .sort((a, b) => b.difficulty - a.difficulty) // Hardest to easiest
    : [];

  // Prepare submissions sorted by T-score
  const submissionsSorted = [...submissions].sort((a, b) => {
    const scoreA = a.rasch_score ?? -Infinity;
    const scoreB = b.rasch_score ?? -Infinity;
    return scoreB - scoreA; // Highest to lowest
  });

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rasch sinov sahifasi</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Topshiriqlar: {submissions.length} | Savollar: {Questions.length}
          </p>
        </div>
        <button
          onClick={handleCalculateRasch}
          disabled={isCalculating}
          className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {isCalculating
            ? "Hisoblanmoqda..."
            : "Rasch ma'lumotlari va savollar qiyinligini yangilash"}
        </button>
      </div>

      {isCalculated && calculationResults && (
        <>
          {/* Umumiy Statistika */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Umumiy statistika</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-3 text-neutral-700 dark:text-neutral-300">
                  Talabalarning qobiliyati (θ)
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      O'rtacha:
                    </span>
                    <span className="font-mono">
                      {calculationResults.statistics.ability.mean.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Standart og'ish:
                    </span>
                    <span className="font-mono">
                      {calculationResults.statistics.ability.stdDev.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Minimal:
                    </span>
                    <span className="font-mono">
                      {calculationResults.statistics.ability.min.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Maksimal:
                    </span>
                    <span className="font-mono">
                      {calculationResults.statistics.ability.max.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-neutral-700 dark:text-neutral-300">
                  Savollar qiyinligi
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      O'rtacha:
                    </span>
                    <span className="font-mono">
                      {calculationResults.statistics.difficulty.mean.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Standart og'ish:
                    </span>
                    <span className="font-mono">
                      {calculationResults.statistics.difficulty.stdDev.toFixed(
                        4
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Minimal:
                    </span>
                    <span className="font-mono">
                      {calculationResults.statistics.difficulty.min.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Maksimal:
                    </span>
                    <span className="font-mono">
                      {calculationResults.statistics.difficulty.max.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-neutral-700 dark:text-neutral-300">
                  Baholar taqsimoti
                </h3>
                <div className="space-y-1 text-sm">
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

          {/* Talabalar ballari jadvali */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Talabalar ballari</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th className="text-left py-2 px-3 font-medium">#</th>
                    <th className="text-left py-2 px-3 font-medium">
                      Topshiriq ID
                    </th>
                    <th className="text-left py-2 px-3 font-medium">
                      Foydalanuvchi ID
                    </th>
                    <th className="text-right py-2 px-3 font-medium">
                      Xom ball
                    </th>
                    <th className="text-right py-2 px-3 font-medium">
                      θ (Qobiliyat)
                    </th>
                    <th className="text-right py-2 px-3 font-medium">
                      Z-bahosi
                    </th>
                    <th className="text-right py-2 px-3 font-medium">
                      T-bahosi
                    </th>
                    <th className="text-center py-2 px-3 font-medium">Baho</th>
                  </tr>
                </thead>
                <tbody>
                  {submissionsSorted.map((submission, index) => (
                    <tr
                      key={submission.id}
                      className={`border-b border-neutral-100 dark:border-neutral-800 hover:opacity-80 ${getGradeColor(
                        submission.rasch_score
                          ? gradeFromT(submission.rasch_score)
                          : "Ega emas"
                      )}`}
                    >
                      <td className="py-2 px-3 font-mono text-xs text-center">
                        {index + 1}
                      </td>
                      <td className="py-2 px-3 font-mono text-xs">
                        {submission.id}
                      </td>
                      <td className="py-2 px-3 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                        {submission.user.telegram_id}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {calculateRowScore(submission)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {submission.rasch_ability?.toFixed(4) ?? "—"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {submission.rasch_ability?.toFixed(4) ?? "—"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-medium">
                        {submission.rasch_score?.toFixed(2) ?? "—"}
                      </td>
                      <td className="py-2 px-3 text-center font-medium">
                        {submission.rasch_score
                          ? gradeFromT(submission.rasch_score)
                          : "Ega emas"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Savollar qiyinligi jadvali */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Savollar qiyinligi</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th className="text-left py-2 px-3 font-medium">Savol #</th>
                    <th className="text-left py-2 px-3 font-medium">
                      Savol ID
                    </th>
                    <th className="text-right py-2 px-3 font-medium">
                      Qiyinlik
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {questionDifficultiesSorted.map(
                    ({ questionId, questionLabel, difficulty }) => (
                      <tr
                        key={questionId}
                        className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <td className="py-2 px-3">{questionLabel}</td>
                        <td className="py-2 px-3 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                          {questionId}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {difficulty.toFixed(4)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
