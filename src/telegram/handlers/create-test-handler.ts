import { updateUserCommand } from "@/dbs/bot-servers";
import { showCreateTestMenu } from "@/telegram/menu/create-test";
import { sendProductionErrors } from "../notifications/sendProductionErrors";

export async function handleCreateTestCommand(chatId: number, userId: number) {
  await updateUserCommand(userId.toString(), "create_test");
  try {
    await showCreateTestMenu(chatId);
  } catch (error) {
    sendProductionErrors("Error showing create test menu: " + error);
    console.error("Error showing create test menu:", error);
  }
}
