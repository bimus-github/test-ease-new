import { updateUserCommand } from "@/dbs/bot-servers";
import { sendTelegramMessage } from "../../bot";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";

/**
 * Handle help command
 */
export async function handleHelpCommand(chatId: number) {
  await updateUserCommand(String(chatId), "help");
  try {
    await sendTelegramMessage(
      chatId,
      `Men sizning test topshirishda yordamchingizman! 📝\n\n` +
        `*Qanday ishlaydi:*\n` +
        `1️⃣ O‘qituvchingiz sizga test kodi beradi\n` +
        `2️⃣ Shu kodni menga yuboring (masalan: ABC123)\n` +
        `3️⃣ Sizga test havolasini yuboraman\n` +
        `4️⃣ Testni yakunlab, natijalaringizni oling!\n\n` +
        `*Boshlashga tayyormisiz?*\n` +
        `Kod bo‘lsa, menga yuboring!\n\n` +
        `*Mavjud buyruqlar:*\n` +
        `• \`/start\` - Botni ishga tushirish tugmasi\n` +
        `• \`/help\` - Yordam xabari\n` +
        `• \`/create_test\` - Test yaratish\n` +
        `• \`/my_tests\` - Testlarimni ko‘rish\n` +
        `• \`/my_results\` - Natijalarni ko'rish` +
        `\n\n*Yordam kerakmi?* O‘qituvchingiz bilan bog‘laning! 👨‍🏫`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    sendProductionErrors(error, `handleHelpCommand - chatId: ${chatId}`);
    console.error("Error sending help message:", error);
  }
}
