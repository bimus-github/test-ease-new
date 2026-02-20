import { SendMessageParams, TelegramApiResponse } from "@/types/telegram";
import { sendProductionErrors } from "./notifications/sendProductionErrors";

const TELEGRAM_API_URL = "https://api.telegram.org/bot";
const FETCH_TIMEOUT_MS = 10000; // 10 seconds timeout

/**
 * Check if an error is a network error (should not trigger error notifications)
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const errorString = String(error).toLowerCase();
    
    // Check for network error codes
    const networkErrorCodes = ['emfile', 'ebusy', 'econnrefused', 'etimedout', 'enotfound', 'eai_again', 'aborted'];
    const hasNetworkError = networkErrorCodes.some(code => 
      message.includes(code) || errorString.includes(code)
    );
    
    if (hasNetworkError) {
      return true;
    }
    
    // Check for fetch failures
    if (message.includes('fetch failed') || message.includes('networkerror') || message.includes('aborted')) {
      return true;
    }
    
    // Check error cause
    const cause = (error as any).cause;
    if (cause instanceof Error) {
      const causeMessage = cause.message.toLowerCase();
      if (networkErrorCodes.some(code => causeMessage.includes(code))) {
        return true;
      }
      if (causeMessage.includes('api.telegram.org')) {
        return true;
      }
    }
    
    // Check error code/syscall properties
    const code = (error as any).code;
    const syscall = (error as any).syscall;
    
    if (code && typeof code === 'string') {
      const codeLower = code.toLowerCase();
      if (networkErrorCodes.some(netErr => codeLower.includes(netErr))) {
        return true;
      }
    }
    
    if (syscall === 'getaddrinfo' || syscall === 'connect') {
      return true;
    }
    
    // Check for AbortError
    if (error.name === 'AbortError' || message.includes('aborted')) {
      return true;
    }
  }
  
  // Check if error object has properties indicating network issues
  if (error && typeof error === 'object') {
    const errorObj = error as any;
    if (errorObj.code && typeof errorObj.code === 'string') {
      const codeLower = errorObj.code.toLowerCase();
      if (['emfile', 'ebusy', 'econnrefused', 'etimedout', 'aborted'].includes(codeLower)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get the bot token from environment variables
 */
function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    sendProductionErrors(
      "TELEGRAM_BOT_TOKEN is not set in environment variables",
      "getBotToken"
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

  // Add timeout using AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response | null = null;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    // console.log("Telegram API response:", JSON.stringify(data, null, 2));

    if (data.ok) {
      return data;
    } else {
      // Handle rate limiting (429 Too Many Requests)
      if (data.error_code === 429) {
        const retryAfter = data.parameters?.retry_after || 1;
        console.warn(`⚠️ Rate limited by Telegram. Retry after ${retryAfter} seconds.`);
        
        // Create a special error with retry_after info
        const rateLimitError: any = new Error(`Too Many Requests: retry after ${retryAfter}`);
        rateLimitError.code = 429;
        rateLimitError.retryAfter = retryAfter;
        rateLimitError.isRateLimit = true;
        throw rateLimitError;
      }
      
      // Handle user blocking bot or deactivated users (403 Forbidden) - this is expected, don't log as error
      if (data.error_code === 403) {
        const description = data.description?.toLowerCase() || "";
        if (
          description.includes("bot was blocked") ||
          description.includes("blocked by the user") ||
          description.includes("chat not found") ||
          description.includes("user is deactivated") ||
          description.includes("deactivated")
        ) {
          // User blocked bot or deactivated - this is expected, create a silent error
          const blockedError: any = new Error(data.description || "User unavailable");
          blockedError.code = 403;
          blockedError.isBlocked = true;
          blockedError.isDeactivated = description.includes("deactivated");
          throw blockedError;
        }
      }

      // Handle chat not found (400) - user deleted account or never started bot, treat like blocked
      if (data.error_code === 400) {
        const description = data.description?.toLowerCase() || "";
        if (description.includes("chat not found")) {
          const blockedError: any = new Error(data.description || "Chat not found");
          blockedError.code = 400;
          blockedError.isBlocked = true;
          throw blockedError;
        }
      }

      // API returned an error (non-network issue)
      console.error("Error sending Telegram message:", data);
      // Only notify for non-network errors
      if (!isNetworkError(data)) {
        sendProductionErrors(data, `sendTelegramMessage - chatId: ${chatId}`);
      }
      throw new Error(data.description || "Telegram API error");
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Ensure response body is consumed/closed on error
    if (response?.body) {
      try {
        await response.body.cancel();
      } catch (cancelError) {
        // Ignore cancel errors
      }
    }

    // Don't log blocked/unavailable users as errors - this is expected behavior
    if ((error as any)?.isBlocked || (error as any)?.code === 403 || (error as any)?.code === 400) {
      throw error;
    }
    
    console.error("Error sending Telegram message:", error);
    
    // Only send error notifications for non-network errors to prevent loops
    if (!isNetworkError(error)) {
      sendProductionErrors(error, `sendTelegramMessage - chatId: ${chatId}`);
    }
    
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response: Response | null = null;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: webhookUrl }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (response?.body) {
      try {
        await response.body.cancel();
      } catch (cancelError) {
        // Ignore cancel errors
      }
    }

    console.error("Error setting webhook:", error);
    if (!isNetworkError(error)) {
      sendProductionErrors(error, `setWebhook - url: ${webhookUrl}`);
    }
    throw error;
  }
}

/**
 * Delete webhook (useful for development/testing)
 */
export async function deleteWebhook(): Promise<TelegramApiResponse> {
  const token = getBotToken();
  const url = `${TELEGRAM_API_URL}${token}/deleteWebhook`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response: Response | null = null;

  try {
    response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (response?.body) {
      try {
        await response.body.cancel();
      } catch (cancelError) {
        // Ignore cancel errors
      }
    }

    console.error("Error deleting webhook:", error);
    if (!isNetworkError(error)) {
      sendProductionErrors(error, "deleteWebhook");
    }
    throw error;
  }
}

/**
 * Get webhook info
 */
export async function getWebhookInfo(): Promise<TelegramApiResponse> {
  const token = getBotToken();
  const url = `${TELEGRAM_API_URL}${token}/getWebhookInfo`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response: Response | null = null;

  try {
    response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (response?.body) {
      try {
        await response.body.cancel();
      } catch (cancelError) {
        // Ignore cancel errors
      }
    }

    console.error("Error getting webhook info:", error);
    if (!isNetworkError(error)) {
      sendProductionErrors(error, "getWebhookInfo");
    }
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response: Response | null = null;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (response?.body) {
      try {
        await response.body.cancel();
      } catch (cancelError) {
        // Ignore cancel errors
      }
    }

    console.error("Error sending chat action:", error);
    if (!isNetworkError(error)) {
      sendProductionErrors(error, `sendChatAction - chatId: ${chatId}, action: ${action}`);
    }
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

  // Show upload action (non-blocking - ignore errors)
  sendChatAction(chatId, "upload_document").catch(() => {
    // Ignore errors from chat action
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS * 2); // Longer timeout for file uploads
  let response: Response | null = null;

  try {
    // If file is a string (URL or file_id), send directly
    if (typeof fileContent === "string") {
      const body = {
        chat_id: chatId,
        document: fileContent,
        caption,
      };

      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      if (data.ok) {
        return data;
      } else {
        throw new Error(data.description || "Telegram API error");
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

    response = await fetch(url, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.ok) {
      return data;
    } else {
      throw new Error(data.description || "Telegram API error");
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (response?.body) {
      try {
        await response.body.cancel();
      } catch (cancelError) {
        // Ignore cancel errors
      }
    }

    console.error("Error sending Telegram document:", error);
    if (!isNetworkError(error)) {
      sendProductionErrors(error, `sendTelegramDocument - chatId: ${chatId}, filename: ${filename}`);
    }
    throw error;
  }
}
