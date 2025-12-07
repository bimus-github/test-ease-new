"use server";

import { checkTestCode, createTestWithQuestions } from "@/dbs/test-servers";
import { QuestionForm } from "@/types/question";
import { TestForm } from "@/types/test";
import { sendTestCreationNotification } from "@/telegram/notifications/sendTestCreation";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";

export async function createTestQuestionsAction(
  form: TestForm,
  questions: QuestionForm[],
  telegramId: string
) {
  const testWithQuestions = await createTestWithQuestions(
    { ...form, teacher_id: telegramId },
    questions
  );

  if (testWithQuestions && testWithQuestions.teacher_id) {
    // Send notification (don't await to avoid blocking)
    sendTestCreationNotification(testWithQuestions.teacher_id, testWithQuestions).catch(
      (error) => {
        console.error("Failed to send notification:", error);
        sendProductionErrors(error, "createTestQuestionsAction - notification");
      }
    );
  }

  return testWithQuestions;
}

export async function checkTestCodeAction(code: string) {
  return await checkTestCode(code);
}
