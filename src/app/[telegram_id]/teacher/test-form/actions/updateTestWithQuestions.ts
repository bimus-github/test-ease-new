"use server";
import { updateTest } from "@/dbs/test-servers";
import { UpdateQuestionForm } from "@/types/question";
import { TestForm, TestWithQuestions } from "@/types/test";
import { ensureISOString, formatLocalDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { sendTestUpdateNotification } from "@/telegram/notifications/sendTestUpdate";

export async function updateTestWithQuestionsAction(
    testId: string,
    form: TestForm,
    questions: UpdateQuestionForm[]
  ): Promise<TestWithQuestions | null> {
    try {
      // Update the test
      // form.end_date should already be converted to ISO on client side
      // ensureISOString provides safety net for edge cases
      const updatedTest = await updateTest(testId, {
        ...form,
        end_date: ensureISOString(form.end_date),
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
        end_date: formatLocalDate(updatedTest.end_date)
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