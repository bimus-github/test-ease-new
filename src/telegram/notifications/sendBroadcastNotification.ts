"use server";
import { sendTelegramMessage } from "../bot";
import { getAllUsers } from "@/dbs/bot-servers";
import { sendProductionErrors } from "./sendProductionErrors";

// Guard to prevent multiple simultaneous broadcasts
let isBroadcasting = false;

// Constants
const DEFAULT_DELAY_MS = 150; // ~6.7 msg/sec (safe under 30 msg/sec limit)
const PROGRESS_UPDATE_INTERVAL = 50;
const BATCH_SIZE = 100;
const MAX_PAGES = 1000; // Safety: max 100,000 users
const MAX_USERS = 100000;
const MAX_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface BroadcastStats {
  sent: number;
  total: number;
  success: number;
  failed: number;
}

interface BroadcastOptions {
  delayMs?: number;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  onProgress?: (stats: BroadcastStats) => Promise<void>;
}

/**
 * Check if error indicates user is unreachable (blocked, deactivated, etc.)
 */
function isUnreachableUser(error: any): boolean {
  if (error?.isBlocked || error?.code === 403) {
    return true;
  }
  const message = error?.message?.toLowerCase() || "";
  return (
    message.includes("chat not found") ||
    message.includes("user not found") ||
    message.includes("blocked") ||
    message.includes("bot was blocked") ||
    message.includes("deactivated")
  );
}

/**
 * Send message to a single user with retry logic for rate limits
 */
async function sendToUser(
  userId: string,
  message: string,
  parseMode: "HTML" | "Markdown" | "MarkdownV2",
  delayMs: number
): Promise<{ success: boolean; error?: any }> {
  try {
    await sendTelegramMessage(userId, message, { parse_mode: parseMode });
    return { success: true };
  } catch (error: any) {
    // Handle rate limiting - retry once after waiting
    if (error?.isRateLimit && error?.retryAfter) {
      const retryAfter = error.retryAfter;
      console.warn(`⏳ Rate limited. Waiting ${retryAfter}s for user ${userId}...`);
      
      await new Promise((resolve) => setTimeout(resolve, (retryAfter + 1) * 1000));
      
      try {
        await sendTelegramMessage(userId, message, { parse_mode: parseMode });
        return { success: true };
      } catch (retryError) {
        return { success: false, error: retryError };
      }
    }
    
    return { success: false, error };
  }
}

/**
 * Wait for specified delay
 */
function wait(delayMs: number): Promise<void> {
  return delayMs > 0 
    ? new Promise((resolve) => setTimeout(resolve, delayMs))
    : Promise.resolve();
}

/**
 * Send progress update if callback provided and interval reached
 */
async function maybeSendProgress(
  stats: BroadcastStats,
  onProgress?: (stats: BroadcastStats) => Promise<void>
): Promise<void> {
  if (onProgress && stats.sent % PROGRESS_UPDATE_INTERVAL === 0) {
    await onProgress(stats);
  }
}

/**
 * Check safety limits to prevent infinite loops
 */
function checkSafetyLimits(page: number, total: number, startTime: number): void {
  if (page >= MAX_PAGES) {
    throw new Error(`Safety limit: Maximum pages reached (${MAX_PAGES})`);
  }
  if (total >= MAX_USERS) {
    throw new Error(`Safety limit: Maximum users reached (${MAX_USERS})`);
  }
  const elapsed = Date.now() - startTime;
  if (elapsed > MAX_DURATION_MS) {
    throw new Error(`Safety limit: Maximum duration exceeded (${Math.round(elapsed / 1000 / 60)} minutes)`);
  }
}

/**
 * Broadcast message to all users in the database
 * Uses streaming batch processing for memory efficiency (handles 1000+ users)
 */
export async function sendBroadcastToAllUsers(
  message: string,
  options?: BroadcastOptions
): Promise<{ success: number; failed: number; total: number }> {
  // Prevent multiple simultaneous broadcasts
  if (isBroadcasting) {
    throw new Error("Broadcast is already in progress. Please wait for it to complete.");
  }

  isBroadcasting = true;
  const delayMs = options?.delayMs || DEFAULT_DELAY_MS;
  const parseMode = options?.parseMode || "Markdown";
  
  const stats: BroadcastStats = {
    sent: 0,
    total: 0,
    success: 0,
    failed: 0,
  };

  const startTime = Date.now();

  try {
    console.log(`📢 Starting broadcast...`);

    // Stream users in batches - process as we fetch (memory efficient)
    for (let page = 0; ; page++) {
      // Safety checks
      checkSafetyLimits(page, stats.total, startTime);

      // Fetch batch
      const users = await getAllUsers(page, BATCH_SIZE);
      if (users.length === 0) break;

      stats.total += users.length;

      // Process each user in batch
      for (const user of users) {
        const result = await sendToUser(user.telegram_id, message, parseMode, delayMs);

        stats.sent++;
        if (result.success) {
          stats.success++;
        } else {
          stats.failed++;
          
          // Log unreachable users silently
          if (isUnreachableUser(result.error)) {
            const errorType = result.error?.isDeactivated ? "deactivated" : "blocked";
            console.log(`⚠️ User ${user.telegram_id} is ${errorType}`);
          } else {
            console.error(`❌ Error sending to user ${user.telegram_id}:`, result.error);
          }
        }

        // Send progress update periodically
        await maybeSendProgress(stats, options?.onProgress);

        // Rate limiting delay
        await wait(delayMs);
      }

      // Check if we have more pages
      if (users.length < BATCH_SIZE) break;
    }

    // Send final progress update
    if (options?.onProgress && stats.sent > 0) {
      await options.onProgress(stats);
    }

    console.log(
      `✅ Broadcast completed: ${stats.success} successful, ${stats.failed} failed out of ${stats.total} total`
    );

    return {
      success: stats.success,
      failed: stats.failed,
      total: stats.total,
    };
  } catch (error) {
    sendProductionErrors(
      error,
      `sendBroadcastToAllUsers - total: ${stats.total}, success: ${stats.success}, failed: ${stats.failed}`
    );
    throw error;
  } finally {
    isBroadcasting = false;
  }
}
