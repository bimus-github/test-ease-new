import { supabase } from "@/lib/supabase";
import { AnswerForm, AnswerWithQuestion } from "@/types/answer";

function logDbError(context: string, error: unknown) {
  console.error(`[DB] ${context}:`, error);
}

export async function createAnswersBulk(
  attemptId: string,
  answers: AnswerForm[]
): Promise<boolean> {
  try {
    if (!answers || answers.length === 0) return true;

    const normalized = answers.map((a) => ({
      ...a,
      attempt_id: attemptId,
      answer_text: a.answer_text?.trim() || null,
      selected_options: a.selected_options ?? null,
    }));

    const { error } = await supabase
      .from("answers")
      .insert(normalized)
      .select();

    if (error) {
      logDbError("createAnswersBulk", error);
      return false;
    }
    return true;
  } catch (error) {
    logDbError("createAnswersBulk", error);
    return false;
  }
}

export async function upsertAnswer(
  attemptId: string,
  answer: AnswerForm
): Promise<boolean> {
  try {
    const normalized = {
      ...answer,
      attempt_id: attemptId,
      answer_text: answer.answer_text?.trim() || null,
      selected_options: answer.selected_options ?? null,
    };

    const { error } = await supabase
      .from("answers")
      .upsert(normalized, { onConflict: "attempt_id,question_id" })
      .select();

    if (error) {
      logDbError("upsertAnswer", error);
      return false;
    }
    return true;
  } catch (error) {
    logDbError("upsertAnswer", error);
    return false;
  }
}

export async function listAnswersByAttempt(
  attemptId: string
): Promise<AnswerWithQuestion[]> {
  try {
    const { data, error } = await supabase
      .from("answers")
      .select(
        `id, attempt_id, question_id, answer_text, selected_options, answered_at, created_at, updated_at,
         question:questions(id, test_id, question_label, question_text, question_type, question_order, points, is_required, is_multiple_answers, options, correct_answer, correct_options, created_at, updated_at)`
      )
      .eq("attempt_id", attemptId);

    if (error) {
      logDbError("listAnswersByAttempt", error);
      return [];
    }

    return (data as unknown as AnswerWithQuestion[]) || [];
  } catch (error) {
    logDbError("listAnswersByAttempt", error);
    return [];
  }
}

export async function deleteAnswersByAttempt(
  attemptId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("answers")
      .delete()
      .eq("attempt_id", attemptId);

    if (error) {
      logDbError("deleteAnswersByAttempt", error);
      return false;
    }
    return true;
  } catch (error) {
    logDbError("deleteAnswersByAttempt", error);
    return false;
  }
}
