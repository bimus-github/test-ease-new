"use server";
import { sendTelegramMessage } from "@/telegram/bot";
import { MY_RESULTS_ROUTE } from "@/constants/routes";
import { calculateRowScore } from "@/lib/helpers";
import { ScoringType } from "@/types/test";
import { supabase } from "@/lib/supabase";

export async function handleMyResultsCommand(chatId: number, userId: number) {
  try {
    const { data: submissions, error } = await supabase
      .from("full_submissions")
      .select("*")
      .eq("user_tg_id", String(userId))
      .not("submitted_at", "is", null)
      .neq("submitted_at", "")
      .order("submitted_at", { ascending: false })
      .limit(3);

    if (error) {
      throw error;
    }

    if (!submissions || submissions.length === 0) {
      await sendTelegramMessage(
        chatId,
        "📭 Hali natijalar yo‘q. Natijalarni ko‘rish uchun testni boshlang."
      );
      return;
    }

    let text = "🧪 So‘nggi 3 natijangiz\n\n";

    submissions.forEach((submission: any, index: number) => {
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
      const rowScore = calculateRowScore({
        id: submission.id,
        started_at: submission.started_at,
        submitted_at: submission.submitted_at,
        rasch_score: submission.rasch_score,
        rasch_ability: submission.rasch_ability,
        created_at: submission.created_at,
        updated_at: submission.updated_at,
        answers: submission.answers,
        test: submission.test,
        user: submission.user,
        questions: submission.questions || [],
      } as any);

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
