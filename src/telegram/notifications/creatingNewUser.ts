import { TGUser } from "@/types/tg-user";
import { sendTelegramMessage } from "../bot";
import { tgGroupThreads } from "@/constants/tg-group-threads";
import { sendProductionErrors } from "./sendProductionErrors";

const tgGroupId = process.env.NEXT_PUBLIC_TG_GROUP_ID || "-1002968643520";

export  async function sendCreatingNewUserNotification(  user: TGUser) {
    try {

        const message = `👤 Creating new user: 
        Telegram ID: ${user.telegram_id}\n
        Name: ${user.telegram_first_name} ${user.telegram_last_name}\n
        Username: ${user.telegram_username ? `@${user.telegram_username}` : "No username"}\n
        Language: ${user.telegram_language_code}\n
        Is Premium: ${user.telegram_is_premium ? "Yes" : "No"}\n
        Last Command: ${user.last_command}\n
        Last Interaction At: ${user.last_interaction_at}\n
        Started At: ${user.started_at}\n
        `;

        await sendTelegramMessage(tgGroupId, message, {
            parse_mode: "Markdown",
            message_thread_id: tgGroupThreads.find(thread => thread.name === "Users")?.id,
        });
    } catch (error: any) {
        sendProductionErrors(error, "sendCreatingNewUserNotification");
    }
}