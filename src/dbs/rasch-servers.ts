"use server";
import { supabase } from "@/lib/supabase";
import { getTestById } from "@/dbs/test-servers";
import { getScoringQuestionsByTests } from "@/dbs/question-servers";
import { getSubmissionAnswersByTest } from "@/dbs/submission-servers";
import type { SubmissionAnswers } from "@/types/submission";
import { ScoringType } from "@/types/test";
import { calculateRasch } from "@/lib/rasch";
import { scoreAnswers } from "@/lib/helpers";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";
import { isPast } from "@/lib/utils";

function logDbError(context: string, error: unknown) {
  console.error(`[RASCH] ${context}:`, error);
}

/** Ekstremal (hammasi noto'g'ri / hammasi to'g'ri) natijalar uchun chegara qiymatlar */
const FLOOR_ABILITY = -5;
const CEILING_ABILITY = 5;
const FLOOR_T_SCORE = 20;
const CEILING_T_SCORE = 80;

export type RaschCalculationResult =
  | {
      ok: true;
      updatedQuestions: number;
      updatedSubmissions: number;
      /** JML'dan chetlashtirilgan ekstremal natijalar soni */
      extremeSubmissions: number;
    }
  | { ok: false; error: string };

/**
 * Test uchun Rasch modelini hisoblaydi va natijalarni bazaga yozadi.
 *
 * Xatolar YUTILMAYDI — chaqiruvchi `ok: false` va sababni oladi, shunda
 * o'qituvchiga "hisoblandi" deb yolg'on ko'rsatilmaydi.
 *
 * @param testId - Test UUID
 */
export async function calculateRaschForTest(
  testId: string
): Promise<RaschCalculationResult> {
  try {
    const test = await getTestById(testId);
    if (!test) {
      return { ok: false, error: "Test topilmadi." };
    }

    if (test.scoring_type !== ScoringType.RASCH_SCORING) {
      return { ok: false, error: "Bu test Rasch baholash turida emas." };
    }

    if (!isPast(test.end_date)) {
      return { ok: false, error: "Rasch hisoblash uchun test yakunlanishi kerak." };
    }

    // Savollardan faqat baholashga keraklisi olinadi (matn/media tortilmaydi).
    const questionsByTest = await getScoringQuestionsByTests([testId]);
    const questions = questionsByTest.get(testId) || [];
    if (questions.length === 0) {
      return { ok: false, error: "Testda savollar topilmadi." };
    }

    // Urinishlardan faqat id va javoblar olinadi.
    const submissions = await getSubmissionAnswersByTest(testId);
    if (submissions.length === 0) {
      return { ok: false, error: "Bu testda topshirilgan urinishlar yo'q." };
    }

    const totalQuestions = questions.length;

    // Har bir urinishning xom balini bir marta hisoblab olamiz.
    const rowScores = new Map<string, number>(
      submissions.map((s) => [s.id, scoreAnswers(s.answers, questions).rowScore])
    );

    const isPerfect = (s: SubmissionAnswers) =>
      rowScores.get(s.id) === totalQuestions;
    const isZero = (s: SubmissionAnswers) => (rowScores.get(s.id) ?? 0) === 0;

    // JML ekstremal natijalarda uzoqlashadi — ularni modelga kiritmaymiz.
    const validSubmissions = submissions.filter((s) => !isZero(s) && !isPerfect(s));
    const extremeSubmissions = submissions.length - validSubmissions.length;

    if (validSubmissions.length === 0) {
      return {
        ok: false,
        error:
          "Rasch hisoblash uchun ma'lumot yetarli emas: barcha natijalar ekstremal (0 yoki maksimal ball).",
      };
    }

    const { questionDifficulties, scoredSubmissions } = calculateRasch(
      validSubmissions,
      questions,
      { maxIter: 200, tol: 1e-4 }
    );

    const scoredSubmissionsMap = new Map(scoredSubmissions.map((s) => [s.id, s]));

    const questionUpdates = Array.from(questionDifficulties.entries()).map(
      ([id, difficulty]) => ({
        question_id: id,
        difficulty,
      })
    );

    const submissionUpdates = submissions.map((s) => {
      const scored = scoredSubmissionsMap.get(s.id);
      if (scored) {
        return {
          submission_id: s.id,
          rasch_score: Number(scored.rasch_score.toFixed(2)),
          rasch_ability: Number(scored.rasch_ability.toFixed(4)),
        };
      }

      // Ekstremal holat: chegara qiymat beriladi.
      const perfect = isPerfect(s);
      return {
        submission_id: s.id,
        rasch_score: perfect ? CEILING_T_SCORE : FLOOR_T_SCORE,
        rasch_ability: perfect ? CEILING_ABILITY : FLOOR_ABILITY,
      };
    });

    const { data, error } = await supabase.rpc("bulk_update_rasch_results", {
      p_test_id: testId,
      p_question_difficulties: questionUpdates,
      p_submission_scores: submissionUpdates,
    });

    if (error) {
      sendProductionErrors(
        error,
        `calculateRaschForTest - bulk_update_rasch_results, testId: ${testId}`
      );
      logDbError("bulk_update_rasch_results", error);
      return {
        ok: false,
        error: "Natijalarni saqlashda xatolik yuz berdi (bulk_update_rasch_results).",
      };
    }

    const updatedQuestions = data?.[0]?.updated_questions ?? 0;
    const updatedSubmissions = data?.[0]?.updated_submissions ?? 0;

    // Testni "hisoblangan" deb belgilaymiz — bu bayroq natijalarni ko'rsatishni ochadi.
    const { error: testErr } = await supabase
      .from("tests")
      .update({
        isRaschCalculated: true,
        rasch_calculated_at: new Date().toISOString(),
      })
      .eq("id", testId);

    if (testErr) {
      sendProductionErrors(
        testErr,
        `calculateRaschForTest - update test flags, testId: ${testId}`
      );
      logDbError("update test flags", testErr);
      return {
        ok: false,
        error:
          "Ballar hisoblandi, lekin testni 'hisoblangan' deb belgilashda xatolik yuz berdi.",
      };
    }

    return {
      ok: true,
      updatedQuestions,
      updatedSubmissions,
      extremeSubmissions,
    };
  } catch (err) {
    sendProductionErrors(err, `calculateRaschForTest - testId: ${testId}`);
    logDbError("calculateRaschForTest", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Rasch hisoblashda kutilmagan xatolik.",
    };
  }
}
