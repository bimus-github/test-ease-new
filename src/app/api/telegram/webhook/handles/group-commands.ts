
import { handleGroupStartCommand } from "@/telegram/handlers/group/start-group-handler";
import { sendTelegramMessage } from "@/telegram/bot";

const tgBotName = process.env.NEXT_PUBLIC_TG_BOT_NAME || "test_ease_uz_bot";

/**
 * Handle bot commands
 */
export async function handleCommand(chatId: number, userId: number, command: string) {
    const commandName = command.split(" ")[0].toLowerCase();
  
    switch (commandName) {
        case `/start@${tgBotName}`:
            await handleGroupStartCommand(chatId);
            break;
        default:
            await sendTelegramMessage(chatId, `❓ Noma’lum buyruq: ${commandName}\n\nMavjud buyruqlarni ko‘rish uchun /help yuboring.`);
    }
}