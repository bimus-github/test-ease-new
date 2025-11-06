import { formatLocalDate } from "@/lib/utils";
import { Test, TestWithQuestions } from "@/types/test";
import { sendTelegramMessage } from "../bot";

/**
 * Send test creation notification to teacher's Telegram chat
 * @param telegramId - Teacher's Telegram ID
 * @param test - Created test (with or without questions)
 */
export async function sendTestCreationNotification(
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

    // Format scoring type
    const scoringText =
      scoring_type === "simple_scoring" ? "Oddiy baholash" : "Rasch baholash";

    // Build message
    let message = `✅ *Test muvaffaqiyatli yaratildi!*\n\n`;
    message += `📝 *Sarlavha:* ${title}\n`;
    message += `🔑 *Test kodi:* \`${code}\`\n`;
    if (questions) {
      message += `📊 *Savollar:* ${questions.length}\n`;
    }
    message += `📌 *Holat:* ${status === "active" ? "Faol" : "Nofaol"}\n`;
    message += `⏰ *Tugash vaqti:* ${formatLocalDate(end_date)}\n\n`;

    // Add optional information if provided
    if (scoring_type) {
      message += `📋 *Baholash:* ${scoringText}\n`;
    }

    if (description) {
      message += `📄 *Tavsif:* ${description}\n`;
    }

    if (instructions) {
      message += `🎯 *Ko‘rsatmalar:* ${instructions}\n`;
    }

    message += `\nTest kodini o‘quvchilaringiz bilan ulashing!`;

    await sendTelegramMessage(telegramId, message, {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Error sending test creation notification:", error);
    // Don't throw error to avoid blocking test creation
  }
}
