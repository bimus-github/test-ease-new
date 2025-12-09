import { sendTelegramMessage } from "@/telegram/bot";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";
import { sendBroadcastToAllUsers } from "../../notifications/sendBroadcastNotification";

const tgGroupId = process.env.NEXT_PUBLIC_TG_GROUP_ID || "-1002968643520";
const adminId = process.env.NEXT_PUBLIC_TG_ADMIN || "7847738077";

/**
 * Handle /send_msg command
 * Sends a message to all users in the database
 * Admin-only command
 */
export async function handleSendMessageCommand(
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
    // Format: /send_msg <message> or /send_msg@botname <message>
    const parts = command.split(" ");
    
    // Remove command part (first part)
    if (parts.length < 2) {
      await sendTelegramMessage(
        chatId,
        "❌ Noto'g'ri format. Format: `/send_msg Xabar matni`\n\nMasalan: `/send_msg Salom, bu test xabari!`",
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

    // Send confirmation that broadcast is starting
    await sendTelegramMessage(
      chatId,
      "📢 Xabar barcha foydalanuvchilarga yuborilmoqda...\n\nBu biroz vaqt olishi mumkin."
    );

    // Start broadcast
    const stats = await sendBroadcastToAllUsers(message, {
      delayMs: 150, // 150ms delay between messages (safer rate limit)
      parseMode: "Markdown",
    });

    // Send completion message with statistics
    const resultMessage = 
      `✅ Xabar yuborish yakunlandi!\n\n` +
      `📊 *Statistika:*\n` +
      `   • Jami foydalanuvchilar: ${stats.total}\n` +
      `   • Muvaffaqiyatli: ${stats.success}\n` +
      `   • Xatolik: ${stats.failed}\n\n` +
      `📝 *Xabar matni:*\n\`${message.substring(0, 100)}${message.length > 100 ? "..." : ""}\``;

    await sendTelegramMessage(chatId, resultMessage, {
      parse_mode: "Markdown",
    });
  } catch (error) {
    sendProductionErrors(
      error,
      `handleSendMessageCommand - chatId: ${chatId}, userId: ${userId}`
    );
    
    await sendTelegramMessage(
      chatId,
      "❌ Xabar yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
    );
  }
}

