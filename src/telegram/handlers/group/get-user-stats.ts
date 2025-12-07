import { sendTelegramMessage } from "@/telegram/bot";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";
import { getBotStats } from "@/dbs/bot-servers";

const tgGroupId = process.env.NEXT_PUBLIC_TG_GROUP_ID || "-1002968643520";

export async function handleGetUserStatsCommand() {
    try {
        const stats = await getBotStats()

        if (!stats) {
            await sendTelegramMessage(tgGroupId, "👤 No stats found", {
                parse_mode: "Markdown",
            });
            return;
        }

        const message = `👤 User stats:
        Total users: ${stats.total_users}\n
        Active users today: ${stats.active_today}\n
        Active users week: ${stats.active_week}\n
        Premium users: ${stats.premium_users}\n
        Avg days since start: ${stats.avg_days_since_start}\n
        `;

        await sendTelegramMessage(tgGroupId, message, {
            parse_mode: "Markdown",
        });
    } catch (error) {
        sendProductionErrors(error, `handleGetUserStatsCommand - chatId: ${tgGroupId}`);
    }
}