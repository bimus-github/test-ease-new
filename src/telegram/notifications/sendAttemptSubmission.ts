"use server";
import { sendTelegramMessage } from "../bot";
import { answersListText, calculateRowScore } from "@/lib/helpers";
import { ScoringType } from "@/types/test";
import { TEST_RESULT_ROUTE } from "@/constants/routes";
import { sendProductionErrors } from "./sendProductionErrors";
import { getFullSubmission } from "@/dbs/submission-servers";

export async function sendAttemptSubmissionNotification(opts: {
  telegramId: string | number;
  attemptId: string;
}) {
  try {
    const { telegramId, attemptId } = opts;
    const result = await getFullSubmission(attemptId);
    if (!result) return;

    const attempt = result;
    const test = attempt.test;

    const totalQuestions = attempt.answers.length;
    const correctAnswersCount = calculateRowScore(attempt);
    const answersList = answersListText(attempt);

    const textOfRaschScoring =
      test?.scoring_type === ScoringType.RASCH_SCORING
        ? `Rasch bali test yakunlangandan keyin hisoblab beriladi.`
        : "";

    const text =
      `✅ Urinish yuborildi\n\n` +
      `📝 Test: ${attempt.test.title}\n` +
      `📊 Javoblar: ${correctAnswersCount}/${totalQuestions}\n\n` +
      `${textOfRaschScoring ? textOfRaschScoring + "\n\n" : ""}` +
      `Javoblar ro‘yxati:\n\n` +
      `${answersList}\n\n` +
      `Natijangizni ko‘rish uchun quyidagi tugmani bosing.`;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "📝 Mening natijam",
            web_app: {
              url: TEST_RESULT_ROUTE(attemptId, telegramId),
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
    console.error("Error sending attempt submission notification:", error);
    sendProductionErrors(error, `sendAttemptSubmissionNotification - attemptId: ${opts.attemptId}`);
  }
}
