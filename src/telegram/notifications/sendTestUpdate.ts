import { formatUzbekistanDate } from "@/lib/utils";
import { Test, TestWithQuestions } from "@/types/test";
import { sendTelegramMessage } from "../bot";
import { sendProductionErrors } from "./sendProductionErrors";
import { testTypeText } from "@/lib/helpers";
import { ScoringType } from "@/types/test";

/**
 * Send test update notification to teacher's Telegram chat
 * @param telegramId - Teacher's Telegram ID
 * @param test - Updated test (with or without questions)
 */
export async function sendTestUpdateNotification(
  telegramId: string,
  test: Test | TestWithQuestions
): Promise<void> {
  try {
    const {
      title,
      code,
      status,
      end_date,
      scoring_type,
      description,
      instructions,
    } = test;

    const questions = "questions" in test ? test.questions : undefined;

    const scoringText = testTypeText(scoring_type as ScoringType);

    let message = `✏️ *Test muvaffaqiyatli yangilandi!*\n\n`;
    message += `📝 *Sarlavha:* ${title}\n`;
    message += `🔑 *Test kodi:* \`${code}\`\n`;
    if (questions) {
      message += `📊 *Savollar:* ${questions.length}\n`;
    }
    message += `📌 *Holat:* ${status === "active" ? "Faol" : "Nofaol"}\n`;
    message += `⏰ *Tugash vaqti:* ${formatUzbekistanDate(end_date)}\n\n`;

    if (scoring_type) {
      message += `📋 *Baholash:* ${scoringText}\n`;
    }
    if (description) {
      message += `📄 *Tavsif:* ${description}\n`;
    }
    if (instructions) {
      message += `🎯 *Ko‘rsatmalar:* ${instructions}\n`;
    }

    message += `\nTestdagi o‘zgarishlar endi faol.`;

    await sendTelegramMessage(telegramId, message, {
      parse_mode: "Markdown",
    });
  } catch (error) {
    sendProductionErrors(error, `sendTestUpdateNotification - test: ${test.code}`);
    console.error("Error sending test update notification:", error);
  }
}
