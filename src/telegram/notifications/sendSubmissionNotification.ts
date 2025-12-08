"use server";
import { sendTelegramMessage } from "../bot";
import { formatUzbekistanDate } from "@/lib/utils";
import type { FullSubmission } from "@/types/submission";
import { sendProductionErrors } from "./sendProductionErrors";

/**
 * Send submission notification to teacher when a student submits a test
 * @param submission - FullSubmission object with all submission data
 */
export async function sendSubmissionNotification(
  submission: FullSubmission
): Promise<void> {
  try {
    const { test, user, submitted_at, row_score } = submission;

    // Get teacher's telegram ID from test
    const teacherId = test.teacher_id;
    if (!teacherId) {
      console.warn("No teacher_id found in test, skipping notification");
      return;
    }

    // Format user info
    const userName = user.telegram_first_name || "Foydalanuvchi";
    const userLastName = user.telegram_last_name || "";
    const fullName = `${userName}${userLastName ? ` ${userLastName}` : ""}`;
    const username =
      user.telegram_username && user.telegram_username.trim()
        ? `@${user.telegram_username}`
        : "Username yo'q";

    // Format submission date
    const submittedDate = submitted_at ? formatUzbekistanDate(submitted_at) : "—";

    // Get total questions count
    const totalQuestions =
      submission.questions?.length || submission.answers.length;

    // Build message
    let message = `📝 *Yangi topshiriq yuborildi*\n\n`;
    message += `📚 *Test:* ${test.title}\n`;
    message += `🔑 *Test kodi:* \`${test.code}\`\n\n`;
    message += `👤 *Talaba:*\n`;
    message += `   • Ism: ${fullName}\n`;
    message += `   • Username: ${username}\n`;
    message += `   • Telegram ID: \`${user.telegram_id}\`\n\n`;
    message += `📊 *Natija:*\n`;
    message += `   • To'g'ri javoblar: ${row_score ?? "—"}/${totalQuestions}\n`;
    message += `   • Yuborilgan vaqti: ${submittedDate}\n`;

    await sendTelegramMessage(teacherId, message, {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Error sending submission notification:", error);
    sendProductionErrors(error, `sendSubmissionNotification - test: ${submission.test?.code || 'unknown'}, user: ${submission.user?.telegram_id || 'unknown'}`);
    // Don't throw - notification failure shouldn't block submission
  }
}
