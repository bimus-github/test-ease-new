import { supabase } from "@/lib/supabase";
import { AttemptStatus, TestAttempt, AttemptFull } from "@/types/attempt";
import { AnswerWithQuestion } from "@/types/answer";
import { dateTimeLocalToISO } from "@/lib/utils";

function logDbError(context: string, error: unknown) {
  console.error(`[DB] ${context}:`, error);
}

export async function createAttempt(
  testId: string,
  userId: string
): Promise<TestAttempt | null> {
  try {
    const { data, error } = await supabase
      .from("test_attempts")
      .insert({
        test_id: testId,
        user_id: userId,
        status: AttemptStatus.STARTED,
        started_at: dateTimeLocalToISO(new Date().toISOString()),
      })
      .select("*")
      .single();

    if (error) {
      logDbError("createAttempt", error);
      return null;
    }
    return data as TestAttempt;
  } catch (error) {
    logDbError("createAttempt", error);
    return null;
  }
}

export async function getAttemptByTestAndUser(
  testId: string,
  userId: string
): Promise<TestAttempt | null> {
  try {
    const { data, error } = await supabase
      .from("test_attempts")
      .select("*")
      .eq("test_id", testId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logDbError("getAttemptByTestAndUser", error);
      return null;
    }
    return (data as TestAttempt) || null;
  } catch (error) {
    logDbError("getAttemptByTestAndUser", error);
    return null;
  }
}

export async function getSubmittedAttemptByTestAndUser(
  testId: string,
  userId: string
): Promise<TestAttempt | null> {
  try {
    const { data, error } = await supabase
      .from("test_attempts")
      .select("*")
      .eq("test_id", testId)
      .eq("user_id", userId)
      .eq("status", AttemptStatus.SUBMITTED)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logDbError("getSubmittedAttemptByTestAndUser", error);
      return null;
    }
    return (data as TestAttempt) || null;
  } catch (error) {
    logDbError("getSubmittedAttemptByTestAndUser", error);
    return null;
  }
}

export async function getAttemptFull(
  attemptId: string
): Promise<AttemptFull | null> {
  try {
    // Fetch attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("test_attempts")
      .select(
        `
        *,
        test:test_id(id, title, code, scoring_type, created_at, updated_at)
      `
      )
      .eq("id", attemptId)
      .single();

    if (attemptError || !attempt) {
      logDbError("getAttemptFull.attempt", attemptError);
      return null;
    }

    // Fetch answers with questions
    const { data: answers, error: answersError } = await supabase
      .from("answers")
      .select(
        `id, attempt_id, question_id, answer_text, selected_options, answered_at, created_at, updated_at,
         question:questions(id, test_id, question_label, question_text, question_type, question_order, points, is_required, is_multiple_answers, options, correct_answer, correct_options, created_at, updated_at)`
      )
      .eq("attempt_id", attemptId);

    if (answersError) {
      logDbError("getAttemptFull.answers", answersError);
      return null;
    }

    return {
      ...(attempt as TestAttempt),
      answers: (answers as unknown as AnswerWithQuestion[]) || [],
    } as AttemptFull;
  } catch (error) {
    logDbError("getAttemptFull", error);
    return null;
  }
}

export async function updateAttemptStatus(
  attemptId: string,
  status: AttemptStatus,
  submittedAt?: string
): Promise<TestAttempt | null> {
  try {
    const { data, error } = await supabase
      .from("test_attempts")
      .update({ status, submitted_at: submittedAt })
      .eq("id", attemptId)
      .select("*")
      .single();

    if (error) {
      logDbError("updateAttemptStatus", error);
      return null;
    }
    return data as TestAttempt;
  } catch (error) {
    logDbError("updateAttemptStatus", error);
    return null;
  }
}

export async function calculateAndUpdateScore(
  attemptId: string
): Promise<TestAttempt | null> {
  try {
    // Try RPC if available
    const { data: scoreData, error: rpcError } = await supabase.rpc(
      "calculate_attempt_score",
      { attempt_uuid: attemptId }
    );

    if (rpcError) {
      logDbError("calculateAndUpdateScore.rpc", rpcError);
    }

    const score = typeof scoreData === "number" ? scoreData : null;

    const { data, error } = await supabase
      .from("test_attempts")
      .update({ score })
      .eq("id", attemptId)
      .select("*")
      .single();

    if (error) {
      logDbError("calculateAndUpdateScore.update", error);
      return null;
    }
    return data as TestAttempt;
  } catch (error) {
    logDbError("calculateAndUpdateScore", error);
    return null;
  }
}

export async function listAttemptsByUser(
  userId: string,
  page: number = 0,
  limit: number = 20
): Promise<TestAttempt[]> {
  try {
    const from = page * limit;
    const to = from + limit - 1;
    const { data, error } = await supabase
      .from("test_attempts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      logDbError("listAttemptsByUser", error);
      return [];
    }
    return (data as TestAttempt[]) || [];
  } catch (error) {
    logDbError("listAttemptsByUser", error);
    return [];
  }
}

export async function deleteDraftAttempt(attemptId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("test_attempts")
      .delete()
      .eq("id", attemptId)
      .eq("status", AttemptStatus.STARTED);

    if (error) {
      logDbError("deleteDraftAttempt", error);
      return false;
    }
    return true;
  } catch (error) {
    logDbError("deleteDraftAttempt", error);
    return false;
  }
}

export async function getAttemptStatusByAttemptId(
  attemptId: string
): Promise<AttemptStatus | null> {
  try {
    const { data, error } = await supabase
      .from("test_attempts")
      .select("status")
      .eq("id", attemptId)
      .single();

    if (error) {
      logDbError("getAttemptStatus", error);
      return null;
    }
    return (data.status as AttemptStatus) || null;
  } catch (error) {
    logDbError("getAttemptStatus", error);
    return null;
  }
}

export async function getAttemptsByUserId(
  userId: string,
  limit: number = 20
): Promise<AttemptFull[]> {
  try {
    // first get ids of attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from("test_attempts")
      .select("id")
      .eq("user_id", userId)
      .limit(limit);

    if (attemptsError) {
      logDbError("getAttemptsByUserId.attempts", attemptsError);
      return [];
    }

    const attemptIds = attempts.map((attempt) => attempt.id);

    const attemptsFull = await Promise.all(
      attemptIds.map(async (attemptId) => {
        const attempt = await getAttemptFull(attemptId);
        return attempt;
      })
    );

    return attemptsFull.filter((attempt) => attempt !== null) as AttemptFull[];
  } catch (error) {
    logDbError("getAttemptsByUserId", error);
    return [];
  }
}
