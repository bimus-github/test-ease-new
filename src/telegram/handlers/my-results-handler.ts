"use server";
import { sendTelegramMessage } from "@/telegram/bot";
import { MY_RESULTS_ROUTE } from "@/constants/routes";
import { ScoringType } from "@/types/test";
import { getFullSubmissionsByUserId } from "@/dbs/submission-servers";
import { FullSubmission } from "@/types/submission";
import { gradeFromT, percentageFromT } from "@/lib/helpers";

export async function handleMyResultsCommand(chatId: number, userId: number) {
  try {
    const submissions = await getFullSubmissionsByUserId(userId.toString());

    if (!submissions || submissions.length === 0) {
      await sendTelegramMessage(
        chatId,
        "📭 Hali natijalar yo‘q. Natijalarni ko‘rish uchun testni boshlang."
      );
      return;
    }

    let text = "🧪 So‘nggi 3 natijangiz\n\n";

    submissions
      .slice(0, 3)
      .forEach((submission: FullSubmission, index: number) => {
        const No = index + 1;
        const testTitle = submission.test.title;
        const testCode = submission.test.code;
        const testTypeText =
          submission.test.scoring_type === ScoringType.RASCH_SCORING
            ? "Rasch baholash"
            : "Oddiy baholash";
        const startedAt = submission.started_at;
        const submittedAt = submission.submitted_at;
        const questionCount = submission.answers.length;
        const rowScore = submission.row_score;
        const raschScore = submission.rasch_score ?? "—";
        const raschAbility = submission.rasch_ability ?? "—";
        const raschGrade = submission.rasch_score
          ? gradeFromT(submission.rasch_score)
          : "—";
        const raschPercentage = submission.rasch_score
          ? percentageFromT(submission.rasch_score)
          : "—";

        text += `${No}. ${testTitle} (${testCode})\n`;
        text += `📋 Test turi: ${testTypeText}\n`;
        text += `📅 Boshlangan: ${startedAt}\n`;
        text += `📅 Yuborilgan: ${submittedAt}\n`;
        text += `📊 Tog'ri javoblar: ${rowScore}\n`;
        text += `📊 Rasch ball: ${raschScore}\n`;
        text += `📊 Rasch qobiliyat: ${raschAbility}\n`;
        text += `📊 Savollar soni: ${questionCount}\n`;
        text += `📊 Rasch bahosi: ${raschGrade} (${raschPercentage})\n`;
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
