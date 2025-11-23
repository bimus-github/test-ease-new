"use server";
import { supabase } from "@/lib/supabase";
import { getTestWithQuestions } from "@/dbs/test-servers";
import { getFullSubmissions } from "@/dbs/submission-servers";
import type { FullSubmission } from "@/types/submission";
import { calculateRasch } from "@/lib/rasch";
import { sendRaschResultsNotification } from "@/telegram/notifications/sendRaschResultsNotification";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";

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
    if (!test.end_date || new Date(test.end_date) > new Date()) {
      sendProductionErrors("Test has not ended yet", `calculateRaschForTest - testId: ${testId}`);
      throw new Error("Test has not ended yet");
    }

    // Load full submissions
    const submissions: FullSubmission[] = await getFullSubmissions(testId);
    if (!submissions.length || !test.questions?.length) {
      sendProductionErrors("Insufficient data for Rasch calculation", `calculateRaschForTest - testId: ${testId}`);
      throw new Error("Insufficient data for Rasch calculation");
    }

    const isSubmissionValid = (s: FullSubmission) => {
      return (
        s.row_score !== undefined && s.row_score !== null && s.row_score !== 0
      );
    };
    // Compute Rasch
    const validSubmissions = submissions.filter(isSubmissionValid);
    const { questionDifficulties, scoredSubmissions } = calculateRasch(
      validSubmissions,
      test.questions,
      { maxIter: 200, tol: 1e-4 }
    );

    // Create a map of submission ID to scored submission for quick lookup
    const scoredSubmissionsMap = new Map(
      scoredSubmissions.map((s) => [s.id, s])
    );

    const questionUpdates = Array.from(questionDifficulties.entries()).map(
      ([id, difficulty]) => ({
        question_id: id,
        difficulty: difficulty,
      })
    );

    const submissionUpdates = submissions.map((s) => {
      const scoredSubmission = scoredSubmissionsMap.get(s.id);
      return {
        submission_id: s.id,
        rasch_score: scoredSubmission?.rasch_score != null 
          ? Number(scoredSubmission.rasch_score.toFixed(2)) 
          : 0,
        rasch_ability: scoredSubmission?.rasch_ability != null
          ? Number(scoredSubmission.rasch_ability.toFixed(4))
          : 0,
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

    // Send notifications to all users with their Rasch results
    if (updatedSubmissions > 0 && submissions.length > 0) {
      // Reload submissions to get updated Rasch scores from database
      const updatedSubmissionsList = await getFullSubmissions(testId);

      // Send notifications in parallel (but don't await to avoid blocking)
      updatedSubmissionsList.filter(isSubmissionValid).forEach((submission) => {
        if (submission.rasch_score != null) {
          sendRaschResultsNotification(submission).catch((error) => {
            sendProductionErrors(error, `calculateRaschForTest - notification, submissionId: ${submission.id}`);
            console.error(
              `Failed to send Rasch notification for submission ${submission.id}:`,
              error
            );
          });
        }
      });
    }

    return { updatedQuestions, updatedSubmissions };
  } catch (err) {
    sendProductionErrors(err, `calculateRaschForTest - testId: ${testId}`);
    logDbError("calculateRaschForTest", err);
    return { updatedQuestions, updatedSubmissions };
  }
}
