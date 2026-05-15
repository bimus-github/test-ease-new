import { getTestByCode } from "@/dbs/test-servers";
import { sendTelegramMessage } from "../../bot";
import { TAKE_TEST_ROUTE, TEST_RESULT_ROUTE } from "@/constants/routes";
import { checkSubmissionStatusByUserAndTest } from "@/dbs/submission-servers";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";
import { isPast, formatUzbekistanDate } from "@/lib/utils";

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
      const looksValid = /^[A-Z0-9]{4,10}$/i.test(testCode);
      const hint = looksValid
        ? `Bunday kod tizimda yo'q. Iltimos:\n• Kod harflarini diqqat bilan tekshiring (kichik/katta harf)\n• O'qituvchingiz bilan qayta tasdiqlang\n• Yoki /public_tests orqali ochiq testlardan tanlang`
        : `Bu test kodiga o'xshamaydi. Test kodi odatda 4-10 ta harf/raqamdan iborat bo'ladi (masalan: \`ABC123\`).\n\nAgar oddiy xabar yozmoqchi bo'lsangiz, /help orqali yordam ko'ring.`;
      await sendTelegramMessage(
        chatId,
        `❌ Test kodi \`${testCode}\` topilmadi.\n\n${hint}`,
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
        `⏸️ Bu test hozir faol emas.\n\n📝 *${test.title}*\n\nO'qituvchingiz testni vaqtinchalik to'xtatib qo'ygan. Iltimos, keyinroq qayta urinib ko'ring yoki o'qituvchingiz bilan bog'laning.`,
        { parse_mode: "Markdown" }
      );
      return;
    }

    if (isPast(test.end_date)) {
      await sendTelegramMessage(
        chatId,
        `⏰ *Bu testning muddati tugagan*\n\n📝 ${test.title}\n📅 Tugash vaqti: ${formatUzbekistanDate(test.end_date)}\n\nAfsuski, endi bu testni topshirib bo'lmaydi.\n\n💡 Boshqa testlarni /public_tests dan topishingiz mumkin.`,
        { parse_mode: "Markdown" }
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
            ? `⏰ Tugash vaqti: ${formatUzbekistanDate(test.end_date)}\n`
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
