import { sendTelegramMessage } from "@/telegram/bot";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";
import { CALLBACK_PREFIXES } from "@/telegram/menu/create-test";

const adminId = process.env.NEXT_PUBLIC_TG_ADMIN || "7847738077";

/**
 * Handle /send_msg_to_admin command
 * Sends a preview message to admin's private chat with confirmation buttons
 * Admin-only command
 */
export async function handleSendMessagePreviewCommand(
  chatId: number,
  userId: number,
  command: string
): Promise<void> {
  try {
    // Check if user is admin
    if (userId.toString() !== adminId) {
      await sendTelegramMessage(
        chatId,
        "❌ Bu buyruq faqat admin uchun. Sizda bu buyruqni bajarish huquqi yo'q."
      );
      return;
    }

    // Parse message from command
    // Format: /send_msg_to_admin <message> or /send_msg_to_admin@botname <message>
    const parts = command.split(" ");
    
    // Remove command part (first part)
    if (parts.length < 2) {
      await sendTelegramMessage(
        chatId,
        "❌ Noto'g'ri format. Format: `/send_msg_to_admin Xabar matni`\n\nMasalan: `/send_msg_to_admin Salom, bu test xabari!`",
        { parse_mode: "Markdown" }
      );
      return;
    }

    // Join all parts after the command as the message
    const message = parts.slice(1).join(" ");

    if (!message || message.trim().length === 0) {
      await sendTelegramMessage(
        chatId,
        "❌ Xabar bo'sh bo'lishi mumkin emas. Iltimos, xabar matnini kiriting."
      );
      return;
    }

    // Encode message and group chatId for callback data (base64)
    // Format: confirm_broadcast:<groupChatId>:<encodedMessage>
    // Note: Telegram callback_data has 64-byte limit. If exceeded, Telegram will reject it
    // and our error handling will catch it. For very long messages, use /send_msg instead.
    const encodedMessage = Buffer.from(message).toString("base64");
    const callbackData = `${CALLBACK_PREFIXES.CONFIRM_BROADCAST}${chatId}:${encodedMessage}`;

    // Create preview message for admin
    const previewText = 
      `📋 *Xabar ko'rib chiqish*\n\n` +
      `Quyidagi xabarni barcha foydalanuvchilarga yuborishni tasdiqlaysizmi?\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `${message}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Tasdiqlash uchun quyidagi tugmalardan birini bosing:`;

    // Create inline keyboard with confirm and cancel buttons
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "✅ Tasdiqlash va yuborish",
            callback_data: callbackData,
          },
        ],
        [
          {
            text: "❌ Bekor qilish",
            callback_data: `${CALLBACK_PREFIXES.CANCEL_BROADCAST}:${chatId}`,
          },
        ],
      ],
    };

    // Send preview to admin's private chat
    await sendTelegramMessage(adminId, previewText, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });

    // Send confirmation to group
    await sendTelegramMessage(
      chatId,
      `✅ Xabar ko'rib chiqish uchun admin shaxsiy chatiga yuborildi.`
    );
  } catch (error) {
    sendProductionErrors(
      error,
      `handleSendMessagePreviewCommand - chatId: ${chatId}, userId: ${userId}`
    );
    
    await sendTelegramMessage(
      chatId,
      "❌ Xabar ko'rib chiqishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
    );
  }
}

