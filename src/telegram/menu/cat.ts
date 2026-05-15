import { CAT_ROUTE } from "@/constants/routes";
import { sendTelegramMessage } from "@/telegram/bot";
import { sendProductionErrors } from "../notifications/sendProductionErrors";

export async function showCatMenu(chatId: number | string) {
  try {
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "🚀 Adaptive testni boshlash",
            web_app: { url: CAT_ROUTE(chatId) },
          },
        ],
      ],
    };

    return sendTelegramMessage(
      chatId,
      `🧠 *Adaptive test*\n\nBu test sizning darajangizga moslashadi. Har savoldan keyin keyingi savol sizning natijangizga qarab tanlanadi — qiyin yoki oson bo'lib boradi.\n\n• 5-20 ta savol\n• Aniq baholash (T-bahosi + grade)\n• Tezroq va aniqroq oddiy testlardan`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  } catch (error) {
    sendProductionErrors(error, `showCatMenu - chatId: ${chatId}`);
    console.error("Error showing CAT menu:", error);
  }
}
