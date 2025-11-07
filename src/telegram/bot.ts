import { SendMessageParams, TelegramApiResponse } from "@/types/telegram";
import { sendProductionErrors } from "./notifications/sendProductionErrors";

const TELEGRAM_API_URL = "https://api.telegram.org/bot";

/**
 * Get the bot token from environment variables
 */
function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    sendProductionErrors(
      "TELEGRAM_BOT_TOKEN is not set in environment variables"
    );
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
      sendProductionErrors(data);
      throw new Error(data.description);
    }
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    sendProductionErrors(error);
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
    sendProductionErrors(error);
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
    sendProductionErrors(error);
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
    sendProductionErrors(error);
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
    sendProductionErrors("Error sending chat action: " + error);
    throw error;
  }
}

/**
 * Send a document/file to a Telegram chat
 */
export async function sendTelegramDocument(
  chatId: number | string,
  fileContent: Buffer | Uint8Array | string,
  filename: string,
  caption?: string
): Promise<TelegramApiResponse> {
  const token = getBotToken();
  const url = `${TELEGRAM_API_URL}${token}/sendDocument`;

  try {
    // Show upload action
    await sendChatAction(chatId, "upload_document");

    // If file is a string (URL or file_id), send directly
    if (typeof fileContent === "string") {
      const body = {
        chat_id: chatId,
        document: fileContent,
        caption,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.ok) {
        return data;
      } else {
        throw new Error(data.description);
      }
    }

    // If file is a Buffer/Uint8Array, send as multipart/form-data
    const formData = new FormData();
    // Convert Buffer to Uint8Array for Blob compatibility
    const fileArray =
      fileContent instanceof Buffer
        ? new Uint8Array(
            fileContent.buffer,
            fileContent.byteOffset,
            fileContent.byteLength
          )
        : fileContent;
    const blob = new Blob([fileArray as BlobPart], {
      type: "application/vnd.ms-excel",
    });
    formData.append("document", blob, filename);
    formData.append("chat_id", String(chatId));
    if (caption) {
      formData.append("caption", caption);
    }

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.ok) {
      return data;
    } else {
      throw new Error(data.description);
    }
  } catch (error) {
    console.error("Error sending Telegram document:", error);
    sendProductionErrors("Error sending Telegram document: " + error);
    throw error;
  }
}
