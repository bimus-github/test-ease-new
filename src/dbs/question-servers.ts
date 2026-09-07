import { supabase } from "@/lib/supabase";
import {
  Question,
  QuestionForm,
  ScoringQuestion,
  SCORING_QUESTION_COLUMNS,
} from "@/types/question";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";

/**
 * Create a new question
 * @param questionData - Question form data
 * @returns Question object or null if failed
 */
export async function createQuestion(
  questionData: QuestionForm
): Promise<Question | null> {
  try {
    const { data, error } = await supabase
      .from("questions")
      .insert(questionData)
      .select()
      .single();

    if (error) {
      sendProductionErrors(error, "createQuestion");
      console.error("Error creating question:", error);
      return null;
    }

    return data;
  } catch (error) {
    sendProductionErrors(error, "createQuestion");
    console.error("Database error:", error);
    return null;
  }
}

/**
 * Get question by ID
 * @param id - Question UUID
 * @returns Question object or null if not found
 */
export async function getQuestionById(id: string): Promise<Question | null> {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      sendProductionErrors(error, "getQuestionById");
      console.error("Error fetching question by ID:", error);
      return null;
    }

    return data;
  } catch (error) {
    sendProductionErrors(error, "getQuestionById");
    console.error("Database error:", error);
    return null;
  }
}

/**
 * Update question
 * @param id - Question UUID
 * @param updates - Partial question data to update
 * @returns Updated question object or null if failed
 */
export async function updateQuestion(
  id: string,
  updates: Partial<QuestionForm>
): Promise<Question | null> {
  try {
    const { data, error } = await supabase
      .from("questions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      sendProductionErrors(error, "updateQuestion");
      console.error("Error updating question:", error);
      return null;
    }

    return data;
  } catch (error) {
    sendProductionErrors(error, "updateQuestion");
    console.error("Database error:", error);
    return null;
  }
}

/**
 * Delete question
 * @param id - Question UUID
 * @returns boolean indicating success
 */
export async function deleteQuestion(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("questions").delete().eq("id", id);

    if (error) {
      sendProductionErrors(error, "deleteQuestion");
      console.error("Error deleting question:", error);
      return false;
    }

    return true;
  } catch (error) {
    sendProductionErrors(error, "deleteQuestion");
    console.error("Database error:", error);
    return false;
  }
}

/**
 * Get all questions for a test, ordered by question_order
 * @param testId - Test UUID
 * @returns Array of Question objects
 */
export async function getQuestionsByTest(testId: string): Promise<Question[]> {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("test_id", testId)
      .order("question_order", { ascending: true });

    if (error) {
      sendProductionErrors(error, "getQuestionsByTest");
      console.error("Error fetching questions by test:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    sendProductionErrors(error, "getQuestionsByTest");
    console.error("Database error:", error);
    return [];
  }
}

/**
 * Reorder questions for a test
 * @param testId - Test UUID
 * @param questionOrders - Array of question ID and new order pairs
 * @returns boolean indicating success
 */
export async function reorderQuestions(
  testId: string,
  questionOrders: { id: string; order: number }[]
): Promise<boolean> {
  try {
    // Update each question's order
    for (const { id, order } of questionOrders) {
      const { error } = await supabase
        .from("questions")
        .update({ question_order: order })
        .eq("id", id)
        .eq("test_id", testId); // Extra safety check

      if (error) {
        sendProductionErrors(error, "updateQuestionOrder");
        console.error("Error updating question order:", error);
        return false;
      }
    }

    return true;
  } catch (error) {
    sendProductionErrors(error, "updateQuestionOrder");
    console.error("Database error updating question order:", error);
    return false;
  }
}

/**
 * Bir yoki bir nechta test uchun faqat baholashga kerak bo'lgan savol maydonlarini oladi.
 *
 * Savol matni, variantlari va media URL'lari tortilmaydi — 1000+ urinishli
 * testlarni serverda baholashda bu bir necha o'n MB'ni tejaydi.
 *
 * @param testIds - Test UUID'lari
 * @returns test_id -> ScoringQuestion[] ko'rinishidagi Map
 */
export async function getScoringQuestionsByTests(
  testIds: string[]
): Promise<Map<string, ScoringQuestion[]>> {
  const grouped = new Map<string, ScoringQuestion[]>();

  const uniqueIds = Array.from(new Set(testIds.filter(Boolean)));
  if (uniqueIds.length === 0) return grouped;

  try {
    // PostgREST bir so'rovda 1000 qator qaytaradi — savollarni sahifalab olamiz.
    const pageSize = 1000;
    let from = 0;

    for (;;) {
      const { data, error } = await supabase
        .from("questions")
        .select(SCORING_QUESTION_COLUMNS)
        .in("test_id", uniqueIds)
        .order("id", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) {
        sendProductionErrors(error, "getScoringQuestionsByTests");
        console.error("Error fetching scoring questions:", error);
        return grouped;
      }

      const rows = (data || []) as unknown as ScoringQuestion[];
      for (const row of rows) {
        const list = grouped.get(row.test_id);
        if (list) list.push(row);
        else grouped.set(row.test_id, [row]);
      }

      if (rows.length < pageSize) break;
      from += pageSize;
    }

    return grouped;
  } catch (error) {
    sendProductionErrors(error, "getScoringQuestionsByTests");
    console.error("Database error:", error);
    return grouped;
  }
}
