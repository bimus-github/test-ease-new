"use server";
import { supabase } from "@/lib/supabase";
import { getTestWithQuestions } from "@/dbs/test-servers";
import { getFullSubmissions } from "@/dbs/submission-servers";
import type { FullSubmission } from "@/types/submission";
import { calculateRasch } from "@/lib/rasch";

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
    if (!test) throw new Error("Test not found");

    // Ensure test ended
    if (!test.end_date || new Date(test.end_date) > new Date()) {
      throw new Error("Test has not ended yet");
    }

    // Load full submissions
    const submissions: FullSubmission[] = await getFullSubmissions(testId);
    if (!submissions.length || !test.questions?.length) {
      throw new Error("Insufficient data for Rasch calculation");
    }

    // Compute Rasch
    const { questionDifficulties } = calculateRasch(
      submissions,
      test.questions,
      200,
      1e-4
    );

    const questionUpdates = Array.from(questionDifficulties.entries()).map(
      ([id, difficulty]) => ({
        question_id: id,
        difficulty: difficulty,
      })
    );

    const submissionUpdates = submissions.map((s) => ({
      submission_id: s.id,
      rasch_score: Number(s.rasch_score!.toFixed(2)),
      rasch_ability: Number(s.rasch_ability!.toFixed(4)),
    }));

    const { data, error } = await supabase.rpc("bulk_update_rasch_results", {
      p_test_id: testId,
      p_question_difficulties: questionUpdates,
      p_submission_scores: submissionUpdates,
    });

    if (error) {
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
    if (testErr) logDbError("update test flags", testErr);

    return { updatedQuestions, updatedSubmissions };
  } catch (err) {
    logDbError("calculateRaschForTest", err);
    return { updatedQuestions, updatedSubmissions };
  }
}
