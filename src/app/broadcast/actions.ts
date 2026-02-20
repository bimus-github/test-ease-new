"use server";

import { getAllUsers } from "@/dbs/bot-servers";
import { sendTelegramMessage } from "@/telegram/bot";

export type BroadcastState = {
  status: "idle" | "success" | "error";
  message: string;
  total: number;
  sent: number;
  failed: number;
  blocked: number;
};

const getErrorText = (error: unknown): string => {
  if (error && typeof error === "object") {
    const maybeDescription = (error as { description?: unknown }).description;
    if (typeof maybeDescription === "string") {
      return maybeDescription;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error ?? "");
};

const isBlockedError = (error: unknown): boolean => {
  const err = error as { isBlocked?: boolean };
  if (err?.isBlocked === true) return true;
  const text = getErrorText(error).toLowerCase();
  return text.includes("blocked") || text.includes("deactivated");
};

export async function broadcastMessageAction(
  prevState: BroadcastState,
  formData: FormData
): Promise<BroadcastState> {
  const rawMessage = formData.get("message");
  const message = typeof rawMessage === "string" ? rawMessage.trim() : "";

  if (!message) {
    return {
      ...prevState,
      status: "error",
      message: "Xabar matni bo'sh.",
    };
  }

  const PAGE_SIZE = 500;
  const users: { telegram_id: string }[] = [];
  let page = 0;
  let chunk: Awaited<ReturnType<typeof getAllUsers>>;
  do {
    chunk = await getAllUsers(page, PAGE_SIZE);
    users.push(...chunk.map((u) => ({ telegram_id: u.telegram_id })));
    page++;
  } while (chunk.length === PAGE_SIZE);

  if (users.length === 0) {
    return {
      status: "success",
      message: "Yuborish uchun foydalanuvchi topilmadi.",
      total: 0,
      sent: 0,
      failed: 0,
      blocked: 0,
    };
  }

  let sent = 0;
  let failed = 0;
  let blocked = 0;

  for (const user of users) {
    try {
      await sendTelegramMessage(user.telegram_id, message);
      sent += 1;
    } catch (error) {
      if (isBlockedError(error)) {
        blocked += 1;
      } else {
        failed += 1;
      }
    }
  }

  const total = users.length;
  return {
    status: "success",
    message: `Yuborildi: ${sent}/${total}. Bloklangan: ${blocked}. Xato: ${failed}.`,
    total,
    sent,
    failed,
    blocked,
  };
}
