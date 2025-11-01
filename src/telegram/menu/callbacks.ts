import { TelegramApiResponse } from "@/types/telegram";

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
