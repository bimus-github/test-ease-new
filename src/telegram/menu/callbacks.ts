import { TelegramApiResponse } from "@/types/telegram";

const FETCH_TIMEOUT_MS = 10000; // 10 seconds timeout

/**
 * Check if an error is a network error
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const networkErrorCodes = ['emfile', 'ebusy', 'econnrefused', 'etimedout', 'enotfound', 'eai_again', 'aborted'];
    if (networkErrorCodes.some(code => message.includes(code))) {
      return true;
    }
    if (message.includes('fetch failed') || message.includes('networkerror') || message.includes('aborted')) {
      return true;
    }
    const cause = (error as any).cause;
    if (cause instanceof Error) {
      const causeMessage = cause.message.toLowerCase();
      if (networkErrorCodes.some(code => causeMessage.includes(code))) {
        return true;
      }
    }
    const code = (error as any).code;
    const syscall = (error as any).syscall;
    if (code && typeof code === 'string' && networkErrorCodes.some(netErr => code.toLowerCase().includes(netErr))) {
      return true;
    }
    if (syscall === 'getaddrinfo' || syscall === 'connect' || error.name === 'AbortError') {
      return true;
    }
  }
  return false;
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response: Response | null = null;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    // Log error but don't throw for network errors to prevent cascading failures
    if (isNetworkError(error)) {
      console.error("Network error answering callback query (non-fatal):", error);
      // Return a minimal response to prevent upstream errors
      return { ok: false, error_code: 0, description: "Network error" } as TelegramApiResponse;
    }
    
    console.error("Error answering callback query:", error);
    throw error;
  }
}
