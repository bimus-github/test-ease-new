import { MY_TESTS_ROUTE } from "@/constants/routes";
import { sendTelegramMessage } from "@/telegram/bot";

export async function showMyTestsMenu(chatId: number | string) {
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🧪 Testlarimni ochish",
          web_app: {
            url: MY_TESTS_ROUTE(chatId),
          },
        },
      ],
    ],
  };

  return sendTelegramMessage(
    chatId,
    `🧪 Testlaringiz\n\nTestlarni ko‘rish va boshqarish uchun veb-ilovani oching.`,
    { parse_mode: "Markdown", reply_markup: keyboard }
  );
}
