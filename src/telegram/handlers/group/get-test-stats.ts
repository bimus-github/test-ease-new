import { getTestStats } from "@/dbs/test-servers";
import { sendTelegramMessage } from "@/telegram/bot";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";

const tgGroupId = process.env.NEXT_PUBLIC_TG_GROUP_ID || "-1002968643520";

export async function handleGetTestStatsCommand() {
    try {
        const stats = await getTestStats()

        if (!stats) {
            await sendTelegramMessage(tgGroupId, "🧪 No stats found", {
                parse_mode: "Markdown",
            });
            return;
        }

        const message = `🧪 Test stats: 
        Total tests: ${stats.total_tests}\n
        Total active tests: ${stats.total_active_tests}\n
        Total inactive tests: ${stats.total_inactive_tests}\n
        New tests today: ${stats.new_tests_today}\n
        New tests week: ${stats.new_tests_week}\n
        Avg tests since start(per day): ${stats.avg_tests_since_start}\n
        `;
        
        await sendTelegramMessage(tgGroupId, message, {
            parse_mode: "Markdown",
            
        });
    } catch (error) {
        sendProductionErrors(error, `handleGetTestStatsCommand - chatId: ${tgGroupId}`);
    }
}