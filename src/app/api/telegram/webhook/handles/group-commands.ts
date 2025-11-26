
import { handleGroupStartCommand } from "@/telegram/handlers/group/start-group-handler";
import { sendTelegramMessage } from "@/telegram/bot";
import { handleGetTestStatsCommand } from "@/telegram/handlers/group/get-test-stats";
import { handleGetUserStatsCommand } from "@/telegram/handlers/group/get-user-stats";
import { handleGetSubmissionStatsCommand } from "@/telegram/handlers/group/get-submission-stats";

const tgBotName = process.env.NEXT_PUBLIC_TG_BOT_NAME || "test_ease_uz_bot";

/**
 * Handle bot commands
 */
export async function handleGroupCommand(chatId: number, userId: number, command: string) {
    const commandName = command.split(" ")[0].toLowerCase();
  
    switch (commandName) {
        case `/start@${tgBotName}`:
            console.log('handleCommand', chatId, userId, command);
            await handleGroupStartCommand(chatId);
            break;
        case `/get_test_stats@${tgBotName}`:
        case `/get_test_stats`:
            await handleGetTestStatsCommand();
            break;
        case `/get_user_stats@${tgBotName}`:
        case `/get_user_stats`:
            await handleGetUserStatsCommand();
            break;
        case `/get_submission_stats@${tgBotName}`:
        case `/get_submission_stats`:
            await handleGetSubmissionStatsCommand();
            break;
        default:
            await sendTelegramMessage(chatId, `❓ Noma’lum buyruq: ${commandName}\n\nMavjud buyruqlarni ko‘rish uchun /help yuboring.`);
    }
}