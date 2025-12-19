import { getTestStats } from "@/dbs/test-servers";
import { sendTelegramMessage } from "@/telegram/bot";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";
import { ScoringType } from "@/types/test";
import { scoringTypeText } from "@/lib/helpers";

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

        // Format tests per scoring type
        const scoringTypeStats = Object.entries(stats.tests_per_scoring_type || {})
            .map(([type, count]) => {
                const scoringType = type as ScoringType;
                return `${scoringTypeText(scoringType)}: ${count}`;
            })
            .join('\n        ');

        // Format top tests (limit to top 10)
        const topTestsEntries = Object.entries(stats.top_tests || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        const topTestsText = topTestsEntries.length > 0
            ? topTestsEntries
                .map(([testId, count], index) => `${index + 1}. Test ${testId}: ${count} submissions`)
                .join('\n        ')
            : 'No tests with submissions yet';

        const message = `🧪 Test stats: 
        Total tests: ${stats.total_tests}
        Total active tests: ${stats.total_active_tests}
        Total inactive tests: ${stats.total_inactive_tests}
        New tests today: ${stats.new_tests_today}
        New tests week: ${stats.new_tests_week}
        Avg tests since start(per day): ${stats.avg_tests_since_start}
        
        Tests per scoring type:
        ${scoringTypeStats}
        
        Top 10 tests by submissions:
        ${topTestsText}`;
        
        await sendTelegramMessage(tgGroupId, message, {
            parse_mode: "Markdown",
            
        });
    } catch (error) {
        sendProductionErrors(error, `handleGetTestStatsCommand - chatId: ${tgGroupId}`);
    }
}