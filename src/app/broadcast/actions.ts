"use server";

import { getAllUsers } from "@/dbs/bot-servers";
import { sendTelegramMessage } from "@/telegram/bot";

const BATCH_SIZE = 150;

export type BroadcastState = {
  status: "idle" | "success" | "error";
  message: string;
  total: number;
  sent: number;
  failed: number;
  blocked: number;
  /** Chunked: more batches left */
  hasMore?: boolean;
  /** Next page index for "Send next batch" */
  nextPage?: number;
  /** Message text to resubmit for next batch */
  lastMessage?: string;
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
  return (
    text.includes("blocked") ||
    text.includes("deactivated") ||
    text.includes("chat not found")
  );
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

  const rawPage = formData.get("page");
  const page = typeof rawPage === "string" ? Math.max(0, parseInt(rawPage, 10) || 0) : 0;

  const chunk = await getAllUsers(page, BATCH_SIZE);
  const users = chunk.map((u) => ({ telegram_id: u.telegram_id }));

  if (users.length === 0) {
    return {
      status: "success",
      message:
        page === 0
          ? "Yuborish uchun foydalanuvchi topilmadi."
          : "Barcha batchlar yuborildi.",
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
  const hasMore = chunk.length === BATCH_SIZE;
  const nextPage = page + 1;

  return {
    status: "success",
    message: hasMore
      ? `Batch yuborildi: ${sent}/${total}. Bloklangan: ${blocked}. Xato: ${failed}. Keyingi batchni yuborish uchun tugmani bosing.`
      : `Yuborildi: ${sent}/${total}. Bloklangan: ${blocked}. Xato: ${failed}.`,
    total,
    sent,
    failed,
    blocked,
    ...(hasMore && { hasMore: true, nextPage, lastMessage: message }),
  };
}
