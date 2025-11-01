import { updateUserCommand } from "@/dbs/bot-servers";
import { showCreateTestMenu } from "@/telegram/menu/create-test";

export async function handleCreateTestCommand(chatId: number, userId: number) {
  await updateUserCommand(userId.toString(), "create_test");
  await showCreateTestMenu(chatId);
}
