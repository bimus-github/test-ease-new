"use server";

import { tgGroupThreads } from "@/constants/tg-group-threads";
import { sendTelegramMessage } from "../bot";

const tgGroupId = process.env.NEXT_PUBLIC_TG_GROUP_ID || "-1002968643520";

// Guard to prevent concurrent error notification attempts and infinite loops
let isNotifyingErrors = false;
let errorNotificationQueue: Array<{ error: unknown; context?: string }> = [];

/**
 * Check if an error is related to Telegram API or network issues
 */
function isTelegramApiError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const errorString = String(error).toLowerCase();
    
    // Check for network errors
    const networkErrorCodes = ['emfile', 'ebusy', 'econnrefused', 'etimedout', 'enotfound', 'eai_again'];
    const hasNetworkError = networkErrorCodes.some(code => 
      message.includes(code) || errorString.includes(code)
    );
    
    if (hasNetworkError) {
      return true;
    }
    
    // Check for fetch failures
    if (message.includes('fetch failed') || message.includes('networkerror')) {
      return true;
    }
    
    // Check if error is from Telegram API (causes will have api.telegram.org)
    const cause = (error as any).cause;
    if (cause instanceof Error) {
      const causeMessage = cause.message.toLowerCase();
      const causeString = String(cause).toLowerCase();
      
      if (causeMessage.includes('api.telegram.org') || causeString.includes('api.telegram.org')) {
        return true;
      }
      
      if (networkErrorCodes.some(code => 
        causeMessage.includes(code) || causeString.includes(code)
      )) {
        return true;
      }
    }
    
    // Check error code/syscall properties
    const errno = (error as any).errno;
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
  }
  
  // Check if error object has properties indicating network issues
  if (error && typeof error === 'object') {
    const errorObj = error as any;
    if (errorObj.code && typeof errorObj.code === 'string') {
      const codeLower = errorObj.code.toLowerCase();
      if (['emfile', 'ebusy', 'econnrefused', 'etimedout'].includes(codeLower)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Safely format an error into a readable string
 * Handles Error objects, strings, and other types
 */
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message || String(error);
  }
  
  if (typeof error === "string") {
    return error;
  }
  
  if (typeof error === "object" && error !== null) {
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return String(error);
    }
  }
  
  return String(error);
}

/**
 * Get stack trace from error if available
 */
function getStackTrace(error: unknown): string | null {
  if (error instanceof Error && error.stack) {
    return error.stack;
  }
  return null;
}

/**
 * Send production error notification to admin via Telegram
 * 
 * @param error - The error to report (Error object, string, or any other type)
 * @param context - Optional context information to help with debugging
 * 
 * @example
 * ```ts
 * try {
 *   // some code
 * } catch (error) {
 *   sendProductionErrors(error, "User registration failed");
 * }
 * ```
 */
export async function sendProductionErrors(
  error: unknown,
  context?: string
): Promise<void> {
  // Check if this is a Telegram API error - if so, only log to console
  // This prevents infinite loops when Telegram API is unreachable
  if (isTelegramApiError(error)) {
    console.error("⚠️ Production Error (Telegram unreachable, logged to console only):");
    console.error("Error:", error);
    if (context) {
      console.error("Context:", context);
    }
    return;
  }
  
  // Guard against concurrent calls
  if (isNotifyingErrors) {
    // Queue error for later if already processing
    errorNotificationQueue.push({ error, context });
    return;
  }
  
  try {
    isNotifyingErrors = true;
    
    const errorMessage = formatError(error);
    const stackTrace = getStackTrace(error);
    const timestamp = new Date().toISOString();
    
    let message = `❌ *Production Error*\n\n`;
    message += `🕐 *Time:* \`${timestamp}\`\n`;
    
    if (context) {
      message += `📍 *Context:* ${context}\n`;
    }
    
    message += `\n*Error:*\n\`\`\`\n${errorMessage}\`\`\``;
    
    if (stackTrace) {
      // Limit stack trace to first 1000 chars to avoid message length issues
      const truncatedStack = stackTrace.length > 1000 
        ? stackTrace.substring(0, 1000) + "\n... (truncated)"
        : stackTrace;
      message += `\n\n*Stack Trace:*\n\`\`\`\n${truncatedStack}\`\`\``;
    }
    
    await sendTelegramMessage(tgGroupId, message, {
      parse_mode: "Markdown",
      message_thread_id: tgGroupThreads.find(thread => thread.name === "Errors")?.id,
    });
  } catch (sendError) {
    // If sending via Telegram fails (especially if it's a network error), 
    // only log to console to prevent infinite loops
    if (isTelegramApiError(sendError)) {
      console.error("⚠️ Failed to send production error notification (Telegram unreachable):");
      console.error("Send error:", sendError);
      console.error("Original error:", error);
      if (context) {
        console.error("Context:", context);
      }
    } else {
      // Non-network errors: log but don't try again
      console.error("Failed to send production error notification:", sendError);
      console.error("Original error:", error);
      if (context) {
        console.error("Context:", context);
      }
    }
  } finally {
    isNotifyingErrors = false;
    
    // Process queued errors if any (but only one at a time)
    if (errorNotificationQueue.length > 0) {
      const nextError = errorNotificationQueue.shift();
      if (nextError) {
        // Use setTimeout to prevent stack overflow from recursion
        setTimeout(() => {
          sendProductionErrors(nextError.error, nextError.context).catch(() => {
            // Ignore errors from queued notifications
          });
        }, 0);
      }
    }
  }
}
