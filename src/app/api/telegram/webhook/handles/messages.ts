import { updateUserCommand } from "@/dbs/bot-servers";
import { TelegramMessage } from "@/types/telegram";
import { handleCommand } from "./commands";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";
import { sendTelegramMessage } from "@/telegram/bot";
import { isTestCode } from "@/lib/helpers";
import { handleTestCode } from "@/telegram/handlers/bot/test-code-handler";

/**
 * Handle incoming messages
 */
export async function handleMessage(message: TelegramMessage) {
    const chatId = message.chat.id;
    const chatType = message.chat.type;
    const userId = message.from?.id;
    const text = message.text;
  
    if (!userId || !text) {
      return;
    }
  
    try {
      // Update user command tracking
      await updateUserCommand(userId.toString(), "message");
  
      // Handle commands
      if (text.startsWith("/")) {
        if (chatType === "group" || chatType === "supergroup") {
          // await handleGroupCommand(chatId, userId, text);
        } else {  
          await handleCommand(chatId, userId, text);
        }
      } else {
        if (chatType === "group" || chatType === "supergroup") {
          // await handleGroupMessage(chatId, userId, text);
        } else {
          await handleRegularMessage(chatId, userId, text);
        }
      }
    } catch (error) {
      console.error("Error handling message:", error);
      sendProductionErrors(error, `handleMessage - chatId: ${chatId}, userId: ${userId}`);
      await sendTelegramMessage(
        chatId,
        "❌ Xabaringizni qayta ishlashda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring."
      );
    }
  }


/**
 * Handle regular (non-command) messages
 */
async function handleRegularMessage(
    chatId: number,
    userId: number,
    text: string
  ) {
    // Check if it's a test code (simple pattern matching)
    if (isTestCode(text)) {
      await handleTestCode(chatId, userId, text);
    } else {
      // Default response for regular messages
      await sendTelegramMessage(
        chatId,
        `📝 Xabaringiz qabul qilindi: "${text}"\n\n` +
          `Agar test kodini yuborgan bo'lsangiz, xatolik yuz berdi.\n` +
          `Test tekshirib qayta yuboring yoki o'qituvchingiz bilan bog'laning.\n` +
          `Kodda '_' yoki bo'sh joylar bo'lmasligi kerak.`
      );
    }
  }