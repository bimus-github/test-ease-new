import { handleCreateTestCommand } from "@/telegram/handlers/bot/create-test-handler";
import { handleHelpCommand } from "@/telegram/handlers/bot/help-command-handler";
import { handleStartCommand } from "@/telegram/handlers/bot/start-handler";
import { handleMyTestsCommand } from "@/telegram/handlers/bot/my-tests-handler";
import { handleMyResultsCommand } from "@/telegram/handlers/bot/my-results-handler";
import { handleConnectWithAdminCommand } from "@/telegram/handlers/bot/connect-with-admin-handler";
import { handleMyBankCommand } from "@/telegram/handlers/bot/my-bank-handler";
import { handleCatCommand } from "@/telegram/handlers/bot/cat-handler";
import { handlePublicTestsCommand } from "@/telegram/handlers/bot/public-tests-handler";
import { sendTelegramMessage } from "@/telegram/bot";

const tgBotName = process.env.NEXT_PUBLIC_TG_BOT_NAME || "test_ease_uz_bot";

/**
 * Handle bot commands
 */
export async function handleCommand(chatId: number, userId: number, command: string) {
    const commandName = command.split(" ")[0].toLowerCase();
  
    switch (commandName) {
      case "/start":
        await handleStartCommand(chatId);
        break;
  
      case "/help":
        await handleHelpCommand(chatId);
        break;
  
      case "/create_test":
        await handleCreateTestCommand(chatId, userId);
        break;
  
      case "/my_tests":
        await handleMyTestsCommand(chatId, userId);
        break;
  
      case "/my_results":
        await handleMyResultsCommand(chatId, userId);
        break;

      case "/my_bank":
        await handleMyBankCommand(chatId, userId);
        break;

      case "/cat":
        await handleCatCommand(chatId, userId);
        break;

      case "/public_tests":
        await handlePublicTestsCommand(chatId, userId);
        break;

      case "/connect_with_admin":
        await handleConnectWithAdminCommand(chatId);
        break;
  
      default:
        await sendTelegramMessage(
          chatId,
          `❓ Noma’lum buyruq: ${commandName}\n\nMavjud buyruqlarni ko‘rish uchun /help yuboring.`
        );
    }
  }
  