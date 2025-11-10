"use server";

import { getTestWithQuestions, updateTest } from "@/dbs/test-servers";
import { UpdateQuestionForm } from "@/types/question";
import { TestForm } from "@/types/test";
import { supabase } from "@/lib/supabase";
import { dateTimeLocalToISO } from "@/lib/utils";
import { TestWithQuestions } from "@/types/test";
import { sendTestUpdateNotification } from "@/telegram/notifications/sendTestUpdate";

export async function getTestWithQuestionsAction(testId: string) {
  return await getTestWithQuestions(testId);
}

export async function updateTestWithQuestionsAction(
  testId: string,
  form: TestForm,
  questions: UpdateQuestionForm[]
): Promise<TestWithQuestions | null> {
  try {
    // Update the test
    const updatedTest = await updateTest(testId, {
      ...form,
      end_date: form.end_date ? dateTimeLocalToISO(form.end_date) : undefined,
    });

    if (!updatedTest) {
      console.error("Failed to update test");
      return null;
    }

    // Upsert new questions
    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .upsert(
        questions.map((q) => ({ ...q, test_id: testId })),
        { onConflict: "id" }
      )
      .select();

    if (questionsError) {
      console.error("Error inserting new questions:", questionsError);
      return null;
    }

    const result: TestWithQuestions = {
      ...updatedTest,
      questions: questionsData || [],
    };
    // Fire-and-forget notification
    if (form.teacher_id) {
      sendTestUpdateNotification(form.teacher_id, result).catch((error) =>
        console.error("Failed to send notification:", error)
      );
    }

    return result;
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
}
