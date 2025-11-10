import { supabase } from "@/lib/supabase";
import { Submission, FullSubmission, Answer } from "@/types/submission";
import { calculateRowScore } from "@/lib/helpers";
import { sendSubmissionNotification } from "@/telegram/notifications/sendSubmissionNotification";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";

function logDbError(context: string, error: unknown) {
  console.error(`[DB] ${context}:`, error);
  sendProductionErrors("Error in database operation: " + error);
}

/**
 * Start a new submission (track start time)
 * @param userTgId - User's Telegram ID
 * @param testId - Test UUID
 * @returns Submission object or null if failed
 */
export async function startSubmission(
  userTgId: string,
  testId: string
): Promise<Submission | null> {
  try {
    // check if submission already exists
    const { is_submitted } = await checkSubmissionStatusByUserAndTest(
      userTgId,
      testId
    );

    if (is_submitted) {
      logDbError("startSubmission", "Submission already exists");
      return null;
    }

    const { data, error } = await supabase
      .from("submissions")
      .insert({
        user_tg_id: userTgId,
        test_id: testId,
        started_at: new Date().toISOString(),
        answers: [],
      })
      .select()
      .single();

    if (error) {
      logDbError("startSubmission", error);
      return null;
    }

    return data as Submission;
  } catch (error) {
    logDbError("startSubmission", error);
    return null;
  }
}

/**
 * Submit a submission with answers
 * @param submissionId - Submission UUID
 * @param answers - Array of answers
 * @returns Submission object or null if failed
 */
export async function submitSubmission(
  submissionId: string,
  answers: Answer[]
): Promise<Submission | null> {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .update({
        answers,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", submissionId)
      .select()
      .single();

    if (error) {
      logDbError("submitSubmission", error);
      return null;
    }

    // Send notification to teacher about the submission
    if (data) {
      // Get full submission data for notification
      const fullSubmission = await getFullSubmission(submissionId);
      if (fullSubmission) {
        sendSubmissionNotification(fullSubmission).catch((error) => {
          console.error("Error sending submission notification:", error);
          // Don't throw - notification failure shouldn't block submission
        });
      }
    }

    return data as Submission;
  } catch (error) {
    logDbError("submitSubmission", error);
    return null;
  }
}

/**
 * Get full submissions by test_id using the full_submissions view
 * @param testId - Test UUID
 * @returns Array of FullSubmission objects with calculated row_score
 */
export async function getFullSubmissions(
  testId: string
): Promise<FullSubmission[]> {
  try {
    // Auto-submit any expired submissions before fetching
    await supabase.rpc("auto_submit_expired_submissions");

    const { data, error } = await supabase
      .from("full_submissions")
      .select("*")
      .eq("test_id", testId)
      // .order("submitted_at", { ascending: false })
      .order("rasch_score", { ascending: false });

    if (error) {
      logDbError("getFullSubmissions", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Map results and calculate row_score for each submission
    const fullSubmissions: FullSubmission[] = data.map((item: any) => {
      const fullSubmission: FullSubmission = {
        id: item.id,
        started_at: item.started_at,
        submitted_at: item.submitted_at,
        rasch_score: item.rasch_score,
        rasch_ability: item.rasch_ability,
        created_at: item.created_at,
        updated_at: item.updated_at,
        answers: item.answers,
        test: item.test,
        user: item.user,
        questions: item.questions || [],
        row_score: calculateRowScore(item),
      };

      return fullSubmission;
    });

    return fullSubmissions;
  } catch (error) {
    logDbError("getFullSubmissions", error);
    return [];
  }
}

/**
 * Check if a submission has been submitted
 * @param submissionId - Submission UUID
 * @returns boolean indicating if submission is submitted
 */
export async function checkSubmissionStatus(
  submissionId: string
): Promise<boolean> {
  try {
    // Auto-submit any expired submissions before fetching
    await supabase.rpc("auto_submit_expired_submissions");

    const { data, error } = await supabase
      .from("submissions")
      .select("submitted_at")
      .eq("id", submissionId)
      .single();

    if (error) {
      logDbError("checkSubmissionStatus", error);
      return false;
    }

    // Check if submitted_at exists and is not an empty string
    return data && data.submitted_at != null && data.submitted_at !== "";
  } catch (error) {
    logDbError("checkSubmissionStatus", error);
    return false;
  }
}

export async function checkSubmissionStatusByUserAndTest(
  userId: string,
  testId: string
): Promise<{
  id: string;
  is_submitted: boolean;
  started_at: string;
}> {
  try {
    // Auto-submit any expired submissions before fetching
    await supabase.rpc("auto_submit_expired_submissions");

    const { data, error } = await supabase
      .from("submissions")
      .select("id, submitted_at, started_at, created_at")
      .eq("user_tg_id", userId)
      .eq("test_id", testId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logDbError("checkSubmissionStatusByUserAndTest", error);
      return { id: "", is_submitted: false, started_at: "" };
    }

    return {
      id: data?.id || "",
      is_submitted: !!data && !!data.submitted_at,
      started_at: data?.started_at || "",
    };
  } catch (error) {
    logDbError("checkSubmissionStatusByUserAndTest", error);
    return { id: "", is_submitted: false, started_at: "" };
  }
}

/**
 * Get full submissions by user_tg_id using the full_submissions view
 * @param userId - User's Telegram ID
 * @returns Array of FullSubmission objects with calculated row_score
 */
export async function getFullSubmissionsByUserId(
  userId: string
): Promise<FullSubmission[]> {
  try {
    // Auto-submit any expired submissions before fetching
    await supabase.rpc("auto_submit_expired_submissions");

    const { data, error } = await supabase
      .from("full_submissions")
      .select("*")
      .eq("user_tg_id", userId)
      .not("submitted_at", "is", null)
      .not("submitted_at", "is", "")
      .not("submitted_at", "is", undefined)
      .order("submitted_at", { ascending: false })
      .order("rasch_score", { ascending: false });

    if (error) {
      logDbError("getFullSubmissionsByUserId", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Map results and calculate row_score for each submission
    const fullSubmissions: FullSubmission[] = data.map((item: any) => {
      const fullSubmission: FullSubmission = {
        id: item.id,
        started_at: item.started_at,
        submitted_at: item.submitted_at,
        rasch_score: item.rasch_score,
        rasch_ability: item.rasch_ability,
        created_at: item.created_at,
        updated_at: item.updated_at,
        answers: item.answers,
        test: item.test,
        user: item.user,
        questions: item.questions || [],
      };

      // Calculate row_score
      fullSubmission.row_score = calculateRowScore(fullSubmission);

      return fullSubmission;
    });

    return fullSubmissions;
  } catch (error) {
    logDbError("getFullSubmissionsByUserId", error);
    return [];
  }
}

/**
 * Get a single full submission by submission ID using the full_submissions view
 * @param submissionId - Submission UUID
 * @returns FullSubmission object with calculated row_score or null if not found
 */
export async function getFullSubmission(
  submissionId: string
): Promise<FullSubmission | null> {
  try {
    // Auto-submit any expired submissions before fetching
    await supabase.rpc("auto_submit_expired_submissions");

    const { data, error } = await supabase
      .from("full_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (error) {
      logDbError("getFullSubmission", error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Map result and calculate row_score
    const fullSubmission: FullSubmission = {
      id: data.id,
      started_at: data.started_at,
      submitted_at: data.submitted_at,
      rasch_score: data.rasch_score,
      rasch_ability: data.rasch_ability,
      created_at: data.created_at,
      updated_at: data.updated_at,
      answers: data.answers,
      test: data.test,
      user: data.user,
      questions: data.questions || [],
      row_score: calculateRowScore(data),
    };

    return fullSubmission;
  } catch (error) {
    logDbError("getFullSubmission", error);
    return null;
  }
}
