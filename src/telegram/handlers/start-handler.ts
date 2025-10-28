import { sendTelegramMessage } from "@/telegram/bot";

/**
 * Handle /start command
 * Welcome message with instructions
 * Note: User is already synced by middleware
 */
export async function handleStartCommand(chatId: number) {
  await sendTelegramMessage(
    chatId,
    `🎓 *Welcome to Test Ease!*\n\n` +
      `I'm your test-taking assistant! 📝\n\n` +
      `*How it works:*\n` +
      `1️⃣ Your teacher will give you a test code\n` +
      `2️⃣ Send me that code (like: ABC123)\n` +
      `3️⃣ I'll give you a link to take the test\n` +
      `4️⃣ Complete the test and get your results!\n\n` +
      `*Ready to start?*\n` +
      `Just send me your test code when you have one!\n\n` +
      `*Available commands:*\n` +
      `• /menu - Show main menu with buttons\n` +
      `• /myid - Show your Telegram ID\n` +
      `• /help - Show this help message\n\n` +
      `*Need help?* Contact your teacher! 👨‍🏫`,
    { parse_mode: "Markdown" }
  );
}
