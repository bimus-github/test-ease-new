import { updateUserCommand } from "@/dbs/bot-servers";
import { showCatMenu } from "@/telegram/menu/cat";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";

export async function handleCatCommand(chatId: number, userId: number) {
  await updateUserCommand(userId.toString(), "cat");
  try {
    await showCatMenu(chatId);
  } catch (error) {
    sendProductionErrors(error, `handleCatCommand - userId: ${userId}`);
    console.error("Error showing CAT menu:", error);
  }
}
