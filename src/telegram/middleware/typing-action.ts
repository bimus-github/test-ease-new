import { sendChatAction } from "@/telegram/bot";
import { MiddlewareContext, MiddlewareResult } from "./types";

export async function typingActionMiddleware(
  context: MiddlewareContext
): Promise<MiddlewareResult> {
  const { chatId } = context;

  try {
    // Send typing action immediately
    await sendChatAction(chatId, "typing");

    return {
      success: true,
      shouldContinue: true,
    };
  } catch (error) {
    console.error("Typing action middleware error:", error);
    // Don't fail the request if typing action fails (graceful degradation)
    return {
      success: true,
      shouldContinue: true,
    };
  }
}
