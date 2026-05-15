import { updateUserCommand } from "@/dbs/bot-servers";
import { showMyBankMenu } from "@/telegram/menu/my-bank";
import { sendProductionErrors } from "../../notifications/sendProductionErrors";

export async function handleMyBankCommand(chatId: number, userId: number) {
  await updateUserCommand(userId.toString(), "my_bank");
  try {
    await showMyBankMenu(chatId);
  } catch (error) {
    sendProductionErrors(error, `handleMyBankCommand - userId: ${userId}`);
    console.error("Error showing my bank menu:", error);
  }
}
