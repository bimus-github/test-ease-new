import { sendTelegramMessage } from "@/telegram/bot";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";
import { answerCallbackQuery } from "@/telegram/menu/callbacks";
import { CALLBACK_PREFIXES } from "@/telegram/menu/create-test";
import { sendBroadcastToAllUsers } from "../../notifications/sendBroadcastNotification";

const adminId = process.env.NEXT_PUBLIC_TG_ADMIN || "7847738077";

/**
 * Handle broadcast confirmation callback
 * Processes confirm/cancel actions from admin's preview message
 */
export async function handleBroadcastConfirmation(
  callbackQueryId: string,
  userId: number,
  callbackData: string,
  chatId: number
): Promise<void> {
  try {
    // Check if user is admin
    if (userId.toString() !== adminId) {
      await answerCallbackQuery(callbackQueryId, "❌ Bu buyruq faqat admin uchun.");
      return;
    }

    // Answer the callback query first
    await answerCallbackQuery(callbackQueryId);

    // Handle cancel
    if (callbackData.startsWith(CALLBACK_PREFIXES.CANCEL_BROADCAST)) {
      // Extract group chatId from callback data
      // Format: cancel_broadcast:<groupChatId>
      const groupChatId = callbackData.replace(
        `${CALLBACK_PREFIXES.CANCEL_BROADCAST}:`,
        ""
      );

      // Send cancellation message to both admin's private chat and the group
      await sendTelegramMessage(
        chatId,
        "❌ Xabar yuborish bekor qilindi."
      );

      if (groupChatId && groupChatId !== chatId.toString()) {
        await sendTelegramMessage(
          groupChatId,
          "❌ Xabar yuborish bekor qilindi."
        );
      }
      return;
    }

    // Handle confirm
    if (callbackData.startsWith(CALLBACK_PREFIXES.CONFIRM_BROADCAST)) {
      // Extract group chatId and encoded message
      // Format: confirm_broadcast:<groupChatId>:<encodedMessage>
      const dataPart = callbackData.replace(
        CALLBACK_PREFIXES.CONFIRM_BROADCAST,
        ""
      );
      
      const parts = dataPart.split(":");
      if (parts.length < 2) {
        await sendTelegramMessage(
          chatId,
          "❌ Xabar ma'lumotlarini ajratishda xatolik yuz berdi."
        );
        return;
      }

      const groupChatId = parts[0];
      const encodedMessage = parts.slice(1).join(":"); // In case message contains colons

      let message: string;
      try {
        message = Buffer.from(encodedMessage, "base64").toString("utf-8");
      } catch (error) {
        await sendTelegramMessage(
          chatId,
          "❌ Xabar dekodlashda xatolik yuz berdi."
        );
        sendProductionErrors(
          error,
          `handleBroadcastConfirmation - decode error, callbackData: ${callbackData}`
        );
        return;
      }

      // Send confirmation that broadcast is starting to group
      await sendTelegramMessage(
        groupChatId,
        "📢 Xabar barcha foydalanuvchilarga yuborilmoqda...\n\nBu biroz vaqt olishi mumkin."
      );

      // Start broadcast with progress updates
      const stats = await sendBroadcastToAllUsers(message, {
        delayMs: 100, // 100ms delay between messages
        parseMode: "Markdown",
        onProgress: async (progress) => {
          // Send progress update to group every 50 users
          const progressMessage = 
            `📊 *Progress:* ${progress.sent}/${progress.total} foydalanuvchilar\n` +
            `   ✅ Muvaffaqiyatli: ${progress.success}\n` +
            `   ❌ Xatolik: ${progress.failed}`;
          
          await sendTelegramMessage(groupChatId, progressMessage, {
            parse_mode: "Markdown",
          });
        },
      });

      // Create result message
      const resultMessage = 
        `✅ Xabar yuborish yakunlandi!\n\n` +
        `📊 *Statistika:*\n` +
        `   • Jami foydalanuvchilar: ${stats.total}\n` +
        `   • Muvaffaqiyatli: ${stats.success}\n` +
        `   • Xatolik: ${stats.failed}\n\n` +
        `📝 *Xabar matni:*\n\`${message.substring(0, 100)}${message.length > 100 ? "..." : ""}\``;

      // Send results to both admin's private chat and the group
      await sendTelegramMessage(chatId, resultMessage, {
        parse_mode: "Markdown",
      });

      await sendTelegramMessage(groupChatId, resultMessage, {
        parse_mode: "Markdown",
      });
    }
  } catch (error) {
    sendProductionErrors(
      error,
      `handleBroadcastConfirmation - callbackQueryId: ${callbackQueryId}, userId: ${userId}, callbackData: ${callbackData}`
    );
    
    await sendTelegramMessage(
      chatId,
      "❌ Xabar yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
    );
  }
}

