import { sendTelegramMessage } from "@/telegram/bot";
import { TelegramApiResponse } from "@/lib/types/telegram";

export async function showMainMenu(
  chatId: number | string
): Promise<TelegramApiResponse> {
  const keyboard = {
    inline_keyboard: [
      [
        { text: "👤 Profile", callback_data: "menu_profile" },
        { text: "📊 Stats", callback_data: "menu_stats" },
      ],
      [
        { text: "🆔 My ID", callback_data: "menu_myid" },
        { text: "❓ Help", callback_data: "menu_help" },
      ],
      [
        { text: "🎯 Test Code", callback_data: "menu_test" },
        { text: "🏠 Main Menu", callback_data: "menu_main" },
      ],
    ],
  };

  return sendTelegramMessage(
    chatId,
    `🎛️ *Test Ease Bot Menu*\n\n` +
      `Choose an option below or use commands:\n\n` +
      `• /start - Welcome message\n` +
      `• /help - Show help\n` +
      `• /myid - Show your ID\n` +
      `• /profile - View profile\n` +
      `• /stats - Bot statistics\n` +
      `• /menu - Show this menu\n\n` +
      `Or send a test code like: ABC123`,
    {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }
  );
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
): Promise<TelegramApiResponse> {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;

  const body = {
    callback_query_id: callbackQueryId,
    text: text || "✅ Done",
    show_alert: false,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return response.json();
}
