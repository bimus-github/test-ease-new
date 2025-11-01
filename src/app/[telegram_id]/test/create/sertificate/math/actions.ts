"use server";

import { createTestWithQuestions } from "@/dbs/test-servers";
import { QuestionForm } from "@/types/question";
import { TestForm } from "@/types/test";
import { sendTestCreationNotification } from "@/telegram/notifications/sendTestCreation";

export async function createTestQuestionsAction(
  form: TestForm,
  questions: QuestionForm[],
  telegramId: string
) {
  const testWithQuestions = await createTestWithQuestions(
    { ...form, teacher_id: telegramId },
    questions
  );

  if (testWithQuestions) {
    // Send notification (don't await to avoid blocking)
    sendTestCreationNotification(telegramId, testWithQuestions).catch(
      (error) => {
        console.error("Failed to send notification:", error);
      }
    );
  }

  return testWithQuestions;
}
