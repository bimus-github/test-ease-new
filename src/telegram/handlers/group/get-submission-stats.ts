import { getSubmissionStats } from "@/dbs/submission-servers";
import { sendTelegramMessage } from "@/telegram/bot";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";

const tgGroupId = process.env.NEXT_PUBLIC_TG_GROUP_ID || "-1002968643520";

export async function handleGetSubmissionStatsCommand() {
    try {
        const stats = await getSubmissionStats()
        
        if (!stats) {
            await sendTelegramMessage(tgGroupId, "🧪 No stats found", {
                parse_mode: "Markdown",
            });
            return;
        }
        
        const message = `🧪 Submission stats:
        Total submissions: ${stats.total_submissions}\n
        New submissions today: ${stats.new_submissions_today}\n
        New submissions week: ${stats.new_submissions_week}\n
        Avg submissions since start(per day): ${stats.avg_submissions_since_start}\n
        `;
        await sendTelegramMessage(tgGroupId, message, {
            parse_mode: "Markdown",
        });
    } catch (error) {
        sendProductionErrors(error, `handleGetSubmissionStatsCommand - chatId: ${tgGroupId}`);
    }
}