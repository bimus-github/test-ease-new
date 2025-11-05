import {
  TelegramMessage,
  TelegramUpdate,
  TelegramUser,
} from "@/types/telegram";
import { TGUser } from "@/types/tg-user";

export interface MiddlewareContext {
  update: TelegramUpdate;
  message: TelegramMessage;
  user: TelegramUser;
  chatId: number;
  userId: number;
  command?: string;
  text?: string;
}

export interface MiddlewareResult {
  success: boolean;
  user?: TGUser; // From database
  shouldContinue: boolean;
  error?: string;
}

export type MiddlewareFunction = (
  context: MiddlewareContext
) => Promise<MiddlewareResult>;
