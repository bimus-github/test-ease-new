import { SendMessageParams, TelegramApiResponse } from "@/types/telegram";

const TELEGRAM_API_URL = "https://api.telegram.org/bot";

/**
 * Get the bot token from environment variables
 */
function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables");
  }
  return token;
}

/**
 * Send a message to a Telegram chat
 */
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  options?: Partial<SendMessageParams>
): Promise<TelegramApiResponse> {
  const token = getBotToken();
  const url = `${TELEGRAM_API_URL}${token}/sendMessage`;

  const body: SendMessageParams = {
    chat_id: chatId,
    text,
    ...options,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    // console.log("Telegram API response:", JSON.stringify(data, null, 2));

    if (data.ok) {
      return data;
    } else {
      console.error("Error sending Telegram message:", data);
      throw new Error(data.description);
    }
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    throw error;
  }
}

/**
 * Set webhook URL for the bot
 * This should be called once to configure the webhook
 */
export async function setWebhook(
  webhookUrl: string
): Promise<TelegramApiResponse> {
  const token = getBotToken();
  const url = `${TELEGRAM_API_URL}${token}/setWebhook`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: webhookUrl }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error setting webhook:", error);
    throw error;
  }
}

/**
 * Delete webhook (useful for development/testing)
 */
export async function deleteWebhook(): Promise<TelegramApiResponse> {
  const token = getBotToken();
  const url = `${TELEGRAM_API_URL}${token}/deleteWebhook`;

  try {
    const response = await fetch(url, {
      method: "POST",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting webhook:", error);
    throw error;
  }
}

/**
 * Get webhook info
 */
export async function getWebhookInfo(): Promise<TelegramApiResponse> {
  const token = getBotToken();
  const url = `${TELEGRAM_API_URL}${token}/getWebhookInfo`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting webhook info:", error);
    throw error;
  }
}

/**
 * Send chat action (typing indicator)
 * Shows "typing..." indicator to the user while bot processes
 */
export async function sendChatAction(
  chatId: number | string,
  action: "typing" | "upload_photo" | "upload_document" = "typing"
): Promise<TelegramApiResponse> {
  const token = getBotToken();
  const url = `${TELEGRAM_API_URL}${token}/sendChatAction`;

  const body = {
    chat_id: chatId,
    action,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending chat action:", error);
    throw error;
  }
}
