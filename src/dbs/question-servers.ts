import { supabase } from "@/lib/supabase";
import { Question, QuestionForm } from "@/types/question";
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
      sendProductionErrors("Error creating question: " + error);
      console.error("Error creating question:", error);
      return null;
    }

    return data;
  } catch (error) {
    sendProductionErrors("Error creating question: " + error);
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
      sendProductionErrors("Error fetching question by ID: " + error);
      console.error("Error fetching question by ID:", error);
      return null;
    }

    return data;
  } catch (error) {
    sendProductionErrors("Error fetching question by ID: " + error);
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
      sendProductionErrors("Error updating question: " + error);
      console.error("Error updating question:", error);
      return null;
    }

    return data;
  } catch (error) {
    sendProductionErrors("Error updating question: " + error);
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
      sendProductionErrors("Error deleting question: " + error);
      console.error("Error deleting question:", error);
      return false;
    }

    return true;
  } catch (error) {
    sendProductionErrors("Error deleting question: " + error);
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
      sendProductionErrors("Error fetching questions by test: " + error);
      console.error("Error fetching questions by test:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    sendProductionErrors("Error fetching questions by test: " + error);
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
        sendProductionErrors("Error updating question order: " + error);
        console.error("Error updating question order:", error);
        return false;
      }
    }

    return true;
  } catch (error) {
    sendProductionErrors("Error updating question order: " + error);
    console.error("Database error updating question order:", error);
    return false;
  }
}
