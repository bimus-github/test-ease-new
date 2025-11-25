import { sendTelegramMessage } from "@/telegram/bot";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";

const tgBotName = process.env.NEXT_PUBLIC_TG_BOT_NAME || "test_ease_uz_bot";

/**
 * Handle /start command
 * Welcome message with instructions
 * Note: User is already synced by middleware
 */
export async function handleGroupStartCommand(chatId: number) {
  try {
    console.log('handleGroupStartCommand', chatId);
    await sendTelegramMessage(
      chatId,
      `🎓 *Test Ease Group’ga xush kelibsiz!*\n\n` +
      `Bu guruh admin tomonidan yurutilgan guruhdir.\n\n` +
      `Guruh admin uchun yordamchi bo'lob hismat qiladi.\n\n` +
      `Hozirda mavjud buyruqlar:\n` +
      `• \`/start@${tgBotName}\` - Botni ishga tushirish tugmasi\n` +
      `• \`/get_users_stats@${tgBotName}\` - Botni ishga tushirish tugmasi\n` +
      `• \`/get_tests_stats@${tgBotName}\` - Botni ishga tushirish tugmasi\n` +
      `\n\n*Yordam kerakmi?* O‘qituvchingiz bilan bog‘laning! 👨‍🏫`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    sendProductionErrors(error, `handleStartCommand - chatId: ${chatId}`);
    console.error("Error sending start message:", error);
  }
}
