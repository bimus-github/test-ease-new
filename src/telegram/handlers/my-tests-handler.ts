import { updateUserCommand } from "@/dbs/bot-servers";
import { getTestsByTeacher } from "@/dbs/test-servers";
import { sendTelegramMessage } from "@/telegram/bot";
import { showMyTestsMenu } from "@/telegram/menu/my-tests";
import { TestStatus } from "@/types/test";
import { sendProductionErrors } from "../notifications/sendProductionErrors";

export async function handleMyTestsCommand(chatId: number, userId: number) {
  try {
    await updateUserCommand(userId.toString(), "my_tests");

    const tests = await getTestsByTeacher(userId.toString(), 0, 50);

    if (!tests || tests.length === 0) {
      await sendTelegramMessage(
        chatId,
        "📭 Siz hali hech qanday test yaratmagansiz.\n\nBirinchi testni yaratish uchun /create_test buyrug‘idan foydalaning!"
      );

      await showMyTestsMenu(chatId);
      return;
    }

    const top = tests.slice(0, 10);
    const lines = top.map((t, i) => {
      const statusIcon = t.status === TestStatus.ACTIVE ? "🟢" : "⚪️";
      return `${i + 1}. ${t.title} (${statusIcon} ${t.status})\n   Code: \`${
        t.code
      }\``;
    });

    const moreNote =
      tests.length > 10 ? `\n…yana ${tests.length - 10} ta.` : "";

    await sendTelegramMessage(
      chatId,
      `🧪 Testlaringiz (so‘ngi 10 ta)\n\n${lines.join(
        "\n\n"
      )}${moreNote}\n\nMaslahat: Talabalarga test kodini ulashing — ular testni topshirishlari mumkin bo‘ladi.`,
      { parse_mode: "Markdown" }
    );

    await showMyTestsMenu(chatId);
  } catch (error) {
    sendProductionErrors("Error sending my tests message: " + error);
    console.error("Error sending my tests message:", error);
  }
}
