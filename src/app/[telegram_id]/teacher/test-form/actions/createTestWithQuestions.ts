"use server";

import { checkTestCode, createTestWithQuestions } from "@/dbs/test-servers";
import { QuestionForm } from "@/types/question";
import { TestForm, TestWithQuestions } from "@/types/test";
import { sendTestCreationNotification } from "@/telegram/notifications/sendTestCreation";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";
import { ensureISOString, formatLocalDate } from "@/lib/utils";

export async function createTestQuestionsAction(
  form: TestForm,
  questions: QuestionForm[],
  telegramId: string
) {
  // form.end_date should already be converted to ISO on client side
  // createTestWithQuestions uses ensureISOString as safety net
  const testWithQuestions = await createTestWithQuestions(
    { ...form, teacher_id: telegramId },
    questions
  );

  if (!testWithQuestions) {
    return null;
  }

  const result: TestWithQuestions = {
    ...testWithQuestions,
    end_date: formatLocalDate(testWithQuestions.end_date)
  };

  if (testWithQuestions && testWithQuestions.teacher_id) {
    // Send notification (don't await to avoid blocking)
    sendTestCreationNotification(testWithQuestions.teacher_id, result).catch(
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
