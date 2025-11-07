"use server";

import { sendTelegramMessage } from "../bot";

const adminId = process.env.NEXT_PUBLIC_TG_ADMIN || "7847738077";

export async function sendProductionErrors(error: any) {
  const errorMessage = `❌ Production error: ${JSON.stringify(error, null, 2)}`;
  await sendTelegramMessage(adminId, errorMessage);
}
