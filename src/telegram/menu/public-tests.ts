import { PUBLIC_TESTS_ROUTE } from "@/constants/routes";
import { sendTelegramMessage } from "@/telegram/bot";
import { sendProductionErrors } from "../notifications/sendProductionErrors";

export async function showPublicTestsMenu(chatId: number | string) {
  try {
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "🌍 Public testlarni ko'rish",
            web_app: { url: PUBLIC_TESTS_ROUTE(chatId) },
          },
        ],
      ],
    };

    return sendTelegramMessage(
      chatId,
      `🌍 *Public testlar*\n\nBoshqa o'qituvchilarning ochiq testlarini topib, mashq qiling. Har testda top 10 o'quvchi ko'rinadi — siz ham eng yuqori o'rinlarga chiqishingiz mumkin.`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  } catch (error) {
    sendProductionErrors(error, `showPublicTestsMenu - chatId: ${chatId}`);
    console.error("Error showing public tests menu:", error);
  }
}
