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

        // Format top teachers
        const topTeachersEntries = Object.entries(stats.top_teachers || {})
            .sort((a, b) => b[1].total_tests - a[1].total_tests)
            .slice(0, 15);
        
        const topTeachersText = topTeachersEntries.length > 0
            ? topTeachersEntries
                .map(([username, data], index) => {
                    const displayName = data.user.telegram_first_name || username || 'Unknown';
                    return `${index + 1}. @${username || 'no_username'} (${displayName}): ${data.total_tests} tests`;
                })
                .join('\n        ')
            : 'No teachers with tests yet';

        // Format top students
        const topStudentsEntries = Object.entries(stats.top_students || {})
            .sort((a, b) => b[1].total_submissions - a[1].total_submissions)
            .slice(0, 15);
        
        const topStudentsText = topStudentsEntries.length > 0
            ? topStudentsEntries
                .map(([username, data], index) => {
                    const displayName = data.user.telegram_first_name || username || 'Unknown';
                    return `${index + 1}. @${username || 'no_username'} (${displayName}): ${data.total_submissions} submissions`;
                })
                .join('\n        ')
            : 'No students with submissions yet';

        const message = `👤 User stats:
        Total users: ${stats.total_users}
        Active users today: ${stats.active_today}
        Active users week: ${stats.active_week}
        Premium users: ${stats.premium_users}
        Avg days since start: ${stats.avg_days_since_start}
        
        Top 15 teachers by tests created:
        ${topTeachersText}
        
        Top 15 students by submissions:
        ${topStudentsText}`;

        await sendTelegramMessage(tgGroupId, message, {
            parse_mode: "Markdown",
        });
    } catch (error) {
        sendProductionErrors(error, `handleGetUserStatsCommand - chatId: ${tgGroupId}`);
    }
}