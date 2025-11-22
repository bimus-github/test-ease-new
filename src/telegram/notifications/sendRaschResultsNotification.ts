"use server";
import { sendTelegramMessage } from "../bot";
import { gradeFromT, percentageFromT } from "@/lib/helpers";
import { TEST_RESULT_ROUTE } from "@/constants/routes";
import type { FullSubmission } from "@/types/submission";
import { sendProductionErrors } from "./sendProductionErrors";

export async function sendRaschResultsNotification(
  submission: FullSubmission
): Promise<void> {
  try {
    const { user, test, rasch_score, rasch_ability, id, row_score } =
      submission;
    const telegramId = user.telegram_id;

    if (!rasch_score && rasch_score !== 0) {
      console.warn(`No Rasch score for submission ${id}`);
      return;
    }

    const grade = gradeFromT(rasch_score);
    const percentage = percentageFromT(rasch_score);

    // Build test information section
    let testInfo = `📝 *Test:* ${test.title}\n`;
    testInfo += `🔑 *Test kodi:* \`${test.code}\`\n`;

    if (test.description) {
      testInfo += `📄 *Tavsif:* ${test.description}\n`;
    }

    if (test.end_date) {
      const endDate = new Date(test.end_date);
      testInfo += `⏰ *Tugash vaqti:* ${endDate.toLocaleString()}\n`;
    }

    if (submission.questions?.length) {
      testInfo += `📊 *Savollar soni:* ${submission.questions.length}\n`;
    }

    const text =
      `🎉 *Rasch natijalari tayyor!*\n\n` +
      `${testInfo}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `*Sizning natijalaringiz:*\n\n` +
      `📊 *To'g'ri javoblar:* ${row_score}\n` +
      `📊 *Rasch T-bahosi:* ${rasch_score.toFixed(2)}\n` +
      `⭐ *Bahosi:* ${grade}\n` +
      `📈 *Foizi:* ${percentage}\n` +
      `🔢 *Qobiliyat (θ):* ${rasch_ability?.toFixed(4) || "—"}\n\n` +
      `Natijalaringizni to'liq ko'rish uchun quyidagi tugmani bosing.`;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "📊 Mening natijam",
            web_app: {
              url: TEST_RESULT_ROUTE(id, telegramId),
            },
          },
        ],
      ],
    };

    await sendTelegramMessage(telegramId, text, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  } catch (error) {
    console.error(
      `Error sending Rasch results notification for submission ${submission.id}:`,
      error
    );
    sendProductionErrors(error, `sendRaschResultsNotification - submission: ${submission.id}, test: ${submission.test?.code || 'unknown'}`);
    // Don't throw to avoid blocking other notifications
  }
}
