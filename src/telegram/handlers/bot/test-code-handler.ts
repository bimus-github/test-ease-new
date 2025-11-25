import { getTestByCode } from "@/dbs/test-servers";
import { sendTelegramMessage } from "../../bot";
import { TAKE_TEST_ROUTE, TEST_RESULT_ROUTE } from "@/constants/routes";
import { checkSubmissionStatusByUserAndTest } from "@/dbs/submission-servers";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";

/**
 * Handle test code input
 */
export async function handleTestCode(
  chatId: number,
  userId: number,
  testCode: string
) {
  try {
    const test = await getTestByCode(testCode);

    if (!test) {
      await sendTelegramMessage(
        chatId,
        `❌ Test kodi \`${testCode}\` topilmadi.\n\nKodini tekshirib qayta yuboring yoki o‘qituvchingiz bilan bog‘laning.`,
        { parse_mode: "Markdown" }
      );
      return;
    }

    // Check if user already has a submitted submission for this test
    const {
      id: existingSubmissionId,
      is_submitted: existingSubmissionIsSubmitted,
    } = await checkSubmissionStatusByUserAndTest(userId.toString(), test.id);

    if (existingSubmissionIsSubmitted) {
      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "📝 Natijangizni ko‘rish",
              web_app: {
                url: TEST_RESULT_ROUTE(existingSubmissionId, userId.toString()),
              },
            },
          ],
        ],
      };
      await sendTelegramMessage(
        chatId,
        `📝 Siz testni tugatgansiz. Natijangizni ko‘rish`,
        { parse_mode: "Markdown", reply_markup: keyboard }
      );
      return;
    }

    if (test.status !== "active") {
      await sendTelegramMessage(
        chatId,
        `⏸️ Bu test hozir faol emas.\n\n📝 ${test.title}`
      );
      return;
    }

    if (test.end_date && new Date(test.end_date) < new Date()) {
      await sendTelegramMessage(
        chatId,
        `⏰ Bu testning muddati tugagan.\n\n📝 ${
          test.title
        }\nTugash vaqti: ${new Date(test.end_date).toLocaleString()}`
      );
      return;
    }

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "📝 Testni boshlash",
            web_app: {
              url: TAKE_TEST_ROUTE(test.id, userId),
            },
          },
        ],
      ],
    };

    await sendTelegramMessage(
      chatId,
      `✅ Test topildi!\n\n` +
        `📝 *${test.title}*\n` +
        `🔑 Kod: \`${test.code}\`\n` +
        `${test.description ? `📄 ${test.description}\n` : ""}` +
        `${
          test.end_date
            ? `⏰ Tugash vaqti: ${new Date(test.end_date).toLocaleString()}\n`
            : ""
        }` +
        `\nQuyidagi tugmani bosib testni boshlang.`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  } catch (error) {
    console.error("Error handling test code:", error);
    await sendTelegramMessage(
      chatId,
      "❌ Test kodini qayta ishlashda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring."
    );
    sendProductionErrors(error, `handleTestCode - testCode: ${testCode}, userId: ${userId}`);
    console.error("Error handling test code:", error);
  }
}
