import { QUESTION_BANK_ROUTE } from "@/constants/routes";
import { sendTelegramMessage } from "@/telegram/bot";
import { sendProductionErrors } from "../notifications/sendProductionErrors";

export async function showMyBankMenu(chatId: number | string) {
  try {
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "📚 Savol bankimni ochish",
            web_app: { url: QUESTION_BANK_ROUTE(chatId) },
          },
        ],
      ],
    };

    return sendTelegramMessage(
      chatId,
      `📚 Savol bankim\n\nTest yaratish jarayonida saqlangan savollarni ko'rib boshqarish uchun ochishingiz mumkin.`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  } catch (error) {
    sendProductionErrors(error, `showMyBankMenu - chatId: ${chatId}`);
    console.error("Error showing my bank menu:", error);
  }
}
