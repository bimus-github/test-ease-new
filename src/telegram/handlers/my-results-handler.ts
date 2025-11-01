"use server";
import { sendTelegramMessage } from "@/telegram/bot";
import { MY_RESULTS_ROUTE } from "@/constants/routes";
import { getAttemptsByUserId } from "@/dbs/attempt-servers";
import { calculateRowScore } from "@/lib/helpers";
import { ScoringType } from "@/types/test";

export async function handleMyResultsCommand(chatId: number, userId: number) {
  try {
    const attempts = await getAttemptsByUserId(String(userId), 3);

    if (attempts.length === 0) {
      await sendTelegramMessage(
        chatId,
        "📭 Hali natijalar yo‘q. Natijalarni ko‘rish uchun testni boshlang."
      );
      return;
    }

    let text = "🧪 So‘nggi 3 natijangiz\n\n";

    attempts.forEach((attempt, index) => {
      const No = index + 1;
      const testTitle = attempt.test.title;
      const testCode = attempt.test.code;
      const testTypeText =
        attempt.test.scoring_type === ScoringType.RASCH_SCORING
          ? "Rasch baholash"
          : "Oddiy baholash";
      const startedAt = attempt.started_at;
      const submittedAt = attempt.submitted_at;
      const questionCount = attempt.answers.length;
      const rowScore = calculateRowScore(attempt.answers);

      text += `${No}. ${testTitle} (${testCode})\n`;
      text += `📋 Test turi: ${testTypeText}\n`;
      text += `📅 Boshlangan: ${startedAt}\n`;
      text += `📅 Yuborilgan: ${submittedAt}\n`;
      text += `📊 Xom ball: ${rowScore}\n`;
      text += `📊 Savollar soni: ${questionCount}\n`;
      text += `\n\n`;
    });

    const url = MY_RESULTS_ROUTE(chatId);

    const keyboard = {
      inline_keyboard: [
        [{ text: "🧪 Natijalarimni ochish", web_app: { url } }],
      ],
    };

    await sendTelegramMessage(chatId, text, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  } catch (err) {
    console.error("/my_results handler error", err);
    await sendTelegramMessage(
      chatId,
      "❌ Natijalarni olishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring."
    );
  }
}
