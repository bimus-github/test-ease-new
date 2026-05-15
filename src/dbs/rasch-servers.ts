"use server";
import { supabase } from "@/lib/supabase";
import { getTestWithQuestions } from "@/dbs/test-servers";
import { getFullSubmissions } from "@/dbs/submission-servers";
import type { FullSubmission } from "@/types/submission";
import { calculateRasch } from "@/lib/rasch";
import { sendRaschResultsNotification } from "@/telegram/notifications/sendRaschResultsNotification";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";
import { isPast } from "@/lib/utils";

function logDbError(context: string, error: unknown) {
  console.error(`[RASCH] ${context}:`, error);
}

export async function calculateRaschForTest(testId: string): Promise<{
  updatedQuestions: number;
  updatedSubmissions: number;
}> {
  let updatedQuestions = 0;
  let updatedSubmissions = 0;

  try {
    // Load test with questions
    const test = await getTestWithQuestions(testId);
    if (!test) {
      sendProductionErrors("Test not found", `calculateRaschForTest - testId: ${testId}`);
      throw new Error("Test not found");
    }

    // Ensure test ended
    if (!isPast(test.end_date)) {
      sendProductionErrors("Test has not ended yet", `calculateRaschForTest - testId: ${testId}`);
      throw new Error("Test has not ended yet");
    }

    // Load full submissions
    const submissions: FullSubmission[] = await getFullSubmissions(testId);
    if (!submissions.length || !test.questions?.length) {
      sendProductionErrors("Insufficient data for Rasch calculation", `calculateRaschForTest - testId: ${testId}`);
      throw new Error("Insufficient data for Rasch calculation");
    }

    const totalQuestions = test.questions.length;
    const isPerfect = (s: FullSubmission) =>
      s.row_score !== undefined && s.row_score !== null && s.row_score === totalQuestions;
    const isZero = (s: FullSubmission) =>
      s.row_score === undefined || s.row_score === null || s.row_score === 0;
    const isSubmissionValid = (s: FullSubmission) => !isZero(s) && !isPerfect(s);

    // Compute Rasch only on non-extreme submissions (JML diverges at extremes)
    const validSubmissions = submissions.filter(isSubmissionValid);
    const { questionDifficulties, scoredSubmissions } = calculateRasch(
      validSubmissions,
      test.questions,
      { maxIter: 200, tol: 1e-4 }
    );

    const scoredSubmissionsMap = new Map(
      scoredSubmissions.map((s) => [s.id, s])
    );

    const questionUpdates = Array.from(questionDifficulties.entries()).map(
      ([id, difficulty]) => ({
        question_id: id,
        difficulty: difficulty,
      })
    );

    // Floor/ceiling abilities for extreme cases on the same logit scale as fitted thetas
    const FLOOR_ABILITY = -5;
    const CEILING_ABILITY = 5;

    const submissionUpdates = submissions.map((s) => {
      const scored = scoredSubmissionsMap.get(s.id);
      if (scored) {
        return {
          submission_id: s.id,
          rasch_score: Number(scored.rasch_score.toFixed(2)),
          rasch_ability: Number(scored.rasch_ability.toFixed(4)),
        };
      }

      // Extreme case (all wrong or all correct): assign floor/ceiling
      const ability = isPerfect(s) ? CEILING_ABILITY : FLOOR_ABILITY;
      const tScore = isPerfect(s) ? 80 : 20;
      return {
        submission_id: s.id,
        rasch_score: tScore,
        rasch_ability: ability,
      };
    });

    const { data, error } = await supabase.rpc("bulk_update_rasch_results", {
      p_test_id: testId,
      p_question_difficulties: questionUpdates,
      p_submission_scores: submissionUpdates,
    });

    if (error) {
      sendProductionErrors(error, `calculateRaschForTest - bulk_update_rasch_results, testId: ${testId}`);
      logDbError("bulk_update_rasch_results", error);
    } else if (data && data.length > 0) {
      updatedQuestions = data[0].updated_questions || 0;
      updatedSubmissions = data[0].updated_submissions || 0;
    }

    // Mark test as calculated
    const { error: testErr } = await supabase
      .from("tests")
      .update({
        isRaschCalculated: true,
        rasch_calculated_at: new Date().toISOString(),
      })
      .eq("id", testId);
    if (testErr) {
      sendProductionErrors(testErr, `calculateRaschForTest - update test flags, testId: ${testId}`);
      logDbError("update test flags", testErr);
    }

    return { updatedQuestions, updatedSubmissions };
  } catch (err) {
    sendProductionErrors(err, `calculateRaschForTest - testId: ${testId}`);
    logDbError("calculateRaschForTest", err);
    return { updatedQuestions, updatedSubmissions };
  }
}
