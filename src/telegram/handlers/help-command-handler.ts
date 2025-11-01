import { updateUserCommand } from "@/dbs/bot-servers";
import { sendTelegramMessage } from "../bot";

/**
 * Handle help command
 */
export async function handleHelpCommand(chatId: number) {
  await updateUserCommand(String(chatId), "help");
  await sendTelegramMessage(
    chatId,
    `📚 *Test Ease Bot yordam*\n\n` +
      `*Mavjud buyruqlar:*\n` +
      `• /start - Xush kelibsiz va ko‘rsatmalar\n` +
      `• /help - Ushbu yordam xabari\n` +
      `• /create_test - Test yaratish\n` +
      `• /my_tests - Testlarimni ko‘rish\n` +
      `• /my_results - Natijalarni ko‘rish\n` +
      `• /myid - Telegram ID raqamingiz\n\n` +
      `*Qanday foydalaniladi:*\n` +
      `1️⃣ O‘qituvchingizdan test kodi oling\n` +
      `2️⃣ Menga kodni yuboring (masalan: ABC123)\n` +
      `3️⃣ Sizga test havolasini yuboraman\n` +
      `4️⃣ Testni yakunlab, natijalaringizni oling!\n\n` +
      `*Yordam kerakmi?* O‘qituvchingiz bilan bog‘laning! 👨‍🏫`,
    { parse_mode: "Markdown" }
  );
}
