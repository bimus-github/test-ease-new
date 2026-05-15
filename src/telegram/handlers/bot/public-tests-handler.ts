import { updateUserCommand } from "@/dbs/bot-servers";
import { showPublicTestsMenu } from "@/telegram/menu/public-tests";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";

export async function handlePublicTestsCommand(chatId: number, userId: number) {
  await updateUserCommand(userId.toString(), "public_tests");
  try {
    await showPublicTestsMenu(chatId);
  } catch (error) {
    sendProductionErrors(error, `handlePublicTestsCommand - userId: ${userId}`);
    console.error("Error showing public tests menu:", error);
  }
}
