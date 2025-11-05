import { MiddlewareContext, MiddlewareFunction } from "./types";
import { userSyncMiddleware } from "./user-sync";
import { typingActionMiddleware } from "./typing-action";
import { TelegramUser } from "@/types/telegram";

export class MiddlewarePipeline {
  private middlewares: MiddlewareFunction[] = [];

  constructor() {
    // Add middlewares in order
    this.middlewares = [
      typingActionMiddleware, // Send typing action first
      userSyncMiddleware, // Then sync user data
    ];
  }

  add(middleware: MiddlewareFunction) {
    this.middlewares.push(middleware);
  }

  async execute(context: MiddlewareContext) {
    for (const middleware of this.middlewares) {
      const result = await middleware(context);

      if (!result.success || !result.shouldContinue) {
        return result;
      }

      // Update context with middleware result
      if (result.user) {
        context.user = result.user as unknown as TelegramUser;
      }
    }

    return { success: true, shouldContinue: true };
  }
}

export const middlewarePipeline = new MiddlewarePipeline();

// Export individual middlewares for potential standalone use
export { typingActionMiddleware } from "./typing-action";
export { userSyncMiddleware } from "./user-sync";
