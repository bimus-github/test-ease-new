import { formatLocalDate } from "@/lib/utils";
import { TestWithQuestions } from "@/types/test";
import { sendTelegramMessage } from "../bot";

/**
 * Send test update notification to teacher's Telegram chat
 * @param telegramId - Teacher's Telegram ID
 * @param testWithQuestions - Updated test with questions data
 */
export async function sendTestUpdateNotification(
  telegramId: string,
  testWithQuestions: TestWithQuestions
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
      questions,
    } = testWithQuestions;

    const scoringText =
      scoring_type === "simple_scoring" ? "Oddiy baholash" : "Rasch baholash";

    let message = `✏️ *Test muvaffaqiyatli yangilandi!*\n\n`;
    message += `📝 *Sarlavha:* ${title}\n`;
    message += `🔑 *Test kodi:* \`${code}\`\n`;
    message += `📊 *Savollar:* ${questions.length}\n`;
    message += `📌 *Holat:* ${status === "active" ? "Faol" : "Nofaol"}\n`;
    message += `⏰ *Tugash vaqti:* ${formatLocalDate(end_date)}\n\n`;

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
    console.error("Error sending test update notification:", error);
  }
}
