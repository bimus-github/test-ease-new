"use server";

import { sendTelegramMessage } from "../bot";

const adminId = process.env.NEXT_PUBLIC_TG_ADMIN || "7847738077";

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
  try {
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
    
    await sendTelegramMessage(adminId, message, {
      parse_mode: "Markdown",
    });
  } catch (sendError) {
    // Fallback to console.error to prevent circular failures
    // This handles cases where sendTelegramMessage itself fails
    console.error("Failed to send production error notification:", sendError);
    console.error("Original error:", error);
    if (context) {
      console.error("Context:", context);
    }
  }
}
