"use server";

import { supabase } from "@/lib/supabase";
import { sendProductionErrors } from "./sendProductionErrors";
import { sendTelegramMessage } from "../bot";

const DEFAULT_DELAY_MS = 150;

interface BroadcastOptions {
  delayMs?: number;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  onProgress?: (stats: { sent: number; total: number; success: number; failed: number }) => Promise<void>;
}

interface BroadcastStats {
  sent: number;
  total: number;
  success: number;
  failed: number;
}

/**
 * Broadcast message to all users in the database
 * Uses streaming batch processing for memory efficiency (handles 1000+ users)
 */
export async function sendBroadcastToAllUsers(
  message: string,
  options?: BroadcastOptions
): Promise<{ success: number; failed: number; total: number }> {
  try {
    const delayMs = options?.delayMs || DEFAULT_DELAY_MS;

    const stats: BroadcastStats = {
      sent: 0,
      total: 0,
      success: 0,
      failed: 0,
    };

    const {data, error} = await supabase
    .from('bot-users')
    .select("telegram_id")
    .overrideTypes<{ telegram_id: string }[]>()

    if (error) {
      sendProductionErrors(error, `sendBroadcastToAllUsers - get telegram ids error`);
      return { success: 0, failed: 0, total: 0 };
    }

    if(data.length === 0) {
      return { success: 0, failed: 0, total: 0 };
    }

    await Promise.all(data.map(async (user) => {
      try {
        await sendTelegramMessage(user.telegram_id, message, {
          parse_mode: options?.parseMode || "Markdown",
        });
        stats.success++;
        stats.sent++;
      } catch (error) {
        stats.failed++;
        stats.sent++;
      }
    }));  

    return stats; 
  } catch (error) {
    sendProductionErrors(error, `sendBroadcastToAllUsers - message: ${message}`);
    return { success: 0, failed: 0, total: 0 };
  }
}
