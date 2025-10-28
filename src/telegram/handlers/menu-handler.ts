import { sendTelegramMessage } from "@/telegram/bot";
import { showMainMenu, answerCallbackQuery } from "@/telegram/menu";
import { TelegramCallbackQuery } from "@/lib/types/telegram";
import { updateUserCommand } from "@/dbs/bot-servers";

/**
 * Handle /menu command
 * Shows the main menu with inline keyboard
 */
export async function handleMenuCommand(chatId: number, userId: number) {
  try {
    await updateUserCommand(userId.toString(), "menu");
    await showMainMenu(chatId);
  } catch (error) {
    console.error("Menu command error:", error);
    await sendTelegramMessage(
      chatId,
      "❌ An error occurred while showing the menu. Please try again."
    );
  }
}

/**
 * Handle callback queries from inline keyboard
 */
export async function handleCallbackQuery(
  callbackQuery: TelegramCallbackQuery
) {
  const chatId = callbackQuery.message?.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;

  if (!chatId) return;

  try {
    // Answer the callback query to remove loading state
    await answerCallbackQuery(callbackQuery.id);

    // Update user command tracking
    await updateUserCommand(userId.toString(), `callback_${data}`);

    // Handle different menu options
    switch (data) {
      case "menu_profile":
        await handleProfileFromMenu(chatId, userId);
        break;

      case "menu_stats":
        await handleStatsFromMenu(chatId, userId);
        break;

      case "menu_myid":
        await handleMyIdFromMenu(chatId, userId);
        break;

      case "menu_help":
        await handleHelpFromMenu(chatId, userId);
        break;

      case "menu_test":
        await handleTestFromMenu(chatId, userId);
        break;

      case "menu_main":
        await showMainMenu(chatId);
        break;

      default:
        await sendTelegramMessage(
          chatId,
          "❓ Unknown menu option. Please try again."
        );
    }
  } catch (error) {
    console.error("Callback query error:", error);
    await sendTelegramMessage(
      chatId,
      "❌ An error occurred while processing your request. Please try again."
    );
  }
}

/**
 * Handle profile from menu
 */
async function handleProfileFromMenu(chatId: number, userId: number) {
  await sendTelegramMessage(
    chatId,
    `👤 *Your Profile*\n\n` +
      `User ID: \`${userId}\`\n` +
      `This is a demo profile view.\n\n` +
      `In a real implementation, this would show:\n` +
      `• Your name and username\n` +
      `• Registration date\n` +
      `• Test history\n` +
      `• Statistics\n\n` +
      `Use /menu to return to the main menu.`,
    { parse_mode: "Markdown" }
  );
}

/**
 * Handle stats from menu
 */
async function handleStatsFromMenu(chatId: number, userId: number) {
  await sendTelegramMessage(
    chatId,
    `📊 *Bot Statistics*\n\n` +
      `This is a demo stats view.\n\n` +
      `In a real implementation, this would show:\n` +
      `• Total users\n` +
      `• Active users today\n` +
      `• Tests completed\n` +
      `• Bot uptime\n\n` +
      `Use /menu to return to the main menu.`,
    { parse_mode: "Markdown" }
  );
}

/**
 * Handle myid from menu
 */
async function handleMyIdFromMenu(chatId: number, userId: number) {
  await sendTelegramMessage(
    chatId,
    `🆔 Your Telegram ID: \`${userId}\`\n\n` +
      `Share this ID with your teacher if needed.\n\n` +
      `Use /menu to return to the main menu.`,
    { parse_mode: "Markdown" }
  );
}

/**
 * Handle help from menu
 */
async function handleHelpFromMenu(chatId: number, userId: number) {
  await sendTelegramMessage(
    chatId,
    `❓ *Help & Instructions*\n\n` +
      `*How to use Test Ease Bot:*\n\n` +
      `1️⃣ Get a test code from your teacher\n` +
      `2️⃣ Send me the code (like: ABC123)\n` +
      `3️⃣ I'll give you a link to take the test\n` +
      `4️⃣ Complete the test and get your results!\n\n` +
      `*Available Commands:*\n` +
      `• /start - Welcome message\n` +
      `• /help - Show this help\n` +
      `• /myid - Show your ID\n` +
      `• /profile - View profile\n` +
      `• /stats - Bot statistics\n` +
      `• /menu - Show main menu\n\n` +
      `*Need more help?* Contact your teacher! 👨‍🏫\n\n` +
      `Use /menu to return to the main menu.`,
    { parse_mode: "Markdown" }
  );
}

/**
 * Handle test from menu
 */
async function handleTestFromMenu(chatId: number, userId: number) {
  await sendTelegramMessage(
    chatId,
    `🎯 *Test Code Entry*\n\n` +
      `To take a test:\n\n` +
      `1️⃣ Get a test code from your teacher\n` +
      `2️⃣ Send me the code (like: ABC123)\n` +
      `3️⃣ I'll validate it and give you the test link\n` +
      `4️⃣ Complete the test and get your results!\n\n` +
      `*Example:* Send \`ABC123\` to start a test\n\n` +
      `Use /menu to return to the main menu.`,
    { parse_mode: "Markdown" }
  );
}
