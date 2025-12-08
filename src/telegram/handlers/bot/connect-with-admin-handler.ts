import { updateUserCommand } from "@/dbs/bot-servers";
import { sendTelegramMessage } from "../../bot";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";

/**
 * Handle connect_with_admin command
 * Provides a link to contact the bot admin
 */
export async function handleConnectWithAdminCommand(chatId: number) {
  await updateUserCommand(String(chatId), "connect_with_admin");
  try {
    const adminUsername = process.env.NEXT_PUBLIC_TG_ADMIN_USERNAME;
    
    if (!adminUsername) {
      await sendTelegramMessage(
        chatId,
        "❌ Admin username topilmadi. Iltimos, bot sozlamalarini tekshiring."
      );
      return;
    }

    const adminLink = `https://t.me/${adminUsername.replace("@", "")}`;
    const message = 
      `👋 *Admin bilan bog'lanish*\n\n` +
      `Agar sizda:\n` +
      `💡 *Takliflar* - Botni yaxshilash bo'yicha fikr-mulohazalar\n` +
      `🤔 *Savollar* - Bot ishlashida qiyinchiliklar\n` +
      `🚀 *Shunday bot kerakmi?* - O'zingiz uchun shunga o'xshash bot yaratish istagi\n\n` +
      `bo'lsa, [Muhammad Amin](${adminLink}) bilan bog'laning!\n\n` +
      `📨 Xabar yuborish uchun quyidagi havolani bosing va xabaringizni yuboring.`;

    await sendTelegramMessage(
      chatId,
      message,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    sendProductionErrors(error, `handleConnectWithAdminCommand - chatId: ${chatId}`);
    console.error("Error sending connect with admin message:", error);
  }
}

