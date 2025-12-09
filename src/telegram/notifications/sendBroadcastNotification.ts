"use server";
import { sendTelegramMessage } from "../bot";
import { getAllUsers } from "@/dbs/bot-servers";
import { sendProductionErrors } from "./sendProductionErrors";

/**
 * Broadcast message to all users in the database
 * Uses streaming batch processing for memory efficiency (handles 1000+ users)
 * @param message - Message text to send to all users
 * @param options - Optional configuration
 * @returns Statistics about the broadcast
 */
export async function sendBroadcastToAllUsers(
  message: string,
  options?: {
    delayMs?: number; // Delay between messages (default: 100ms, Telegram limit: 30 msg/sec)
    parseMode?: "HTML" | "Markdown" | "MarkdownV2";
    onProgress?: (stats: { sent: number; total: number; success: number; failed: number }) => Promise<void>;
  }
): Promise<{ success: number; failed: number; total: number }> {
  // Default 150ms delay (~6.7 msg/sec) to stay safely under Telegram's 30 msg/sec limit
  // Increased from 100ms to be more conservative and avoid rate limits
  const delayMs = options?.delayMs || 150;
  let success = 0;
  let failed = 0;
  let total = 0;
  let sent = 0;
  const PROGRESS_UPDATE_INTERVAL = 50; // Send progress update every 50 users
  
  // Safety limits to prevent infinite loops
  const MAX_PAGES = 1000; // Maximum 1000 pages (100,000 users) - safety limit
  const MAX_USERS = 100000; // Absolute maximum users to process
  const startTime = Date.now();
  const MAX_DURATION_MS = 30 * 60 * 1000; // 30 minutes maximum duration

  try {
    // Stream users in batches - process as we fetch (memory efficient)
    let page = 0;
    const limit = 100; // Fetch 100 users per page
    let hasMore = true;

    console.log(`📢 Starting broadcast...`);

    // Process users page by page without loading all into memory
    while (hasMore) {
      // Safety check: prevent infinite loops
      if (page >= MAX_PAGES) {
        console.error(`⚠️ Maximum page limit reached (${MAX_PAGES} pages). Stopping broadcast.`);
        throw new Error(`Maximum page limit reached (${MAX_PAGES} pages). This prevents infinite loops.`);
      }
      
      if (total >= MAX_USERS) {
        console.error(`⚠️ Maximum user limit reached (${MAX_USERS} users). Stopping broadcast.`);
        throw new Error(`Maximum user limit reached (${MAX_USERS} users). This prevents infinite loops.`);
      }
      
      // Check if we've exceeded maximum duration
      if (Date.now() - startTime > MAX_DURATION_MS) {
        console.error(`⚠️ Maximum duration exceeded (${MAX_DURATION_MS / 1000 / 60} minutes). Stopping broadcast.`);
        throw new Error(`Maximum duration exceeded. Broadcast stopped after ${Math.round((Date.now() - startTime) / 1000 / 60)} minutes.`);
      }
      // Fetch batch of users
      const users = await getAllUsers(page, limit);
      
      if (users.length === 0) {
        hasMore = false;
        break;
      }

      total += users.length;

      // Process each user in the current batch immediately
      for (const user of users) {
        try {
          await sendTelegramMessage(
            user.telegram_id,
            message,
            {
              parse_mode: options?.parseMode || "Markdown",
            }
          );
          success++;
          sent++;

          // Send progress update periodically (every PROGRESS_UPDATE_INTERVAL users)
          if (options?.onProgress && sent % PROGRESS_UPDATE_INTERVAL === 0) {
            await options.onProgress({ sent, total, success, failed });
          }

          // Add delay between messages to avoid rate limiting
          if (delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        } catch (error: any) {
          // Handle rate limiting - wait and retry once
          if (error?.isRateLimit && error?.retryAfter) {
            const retryAfter = error.retryAfter;
            console.warn(`⏳ Rate limited. Waiting ${retryAfter} seconds before continuing...`);
            
            // Wait for the retry_after period + a small buffer
            await new Promise((resolve) => setTimeout(resolve, (retryAfter + 1) * 1000));
            
            // Try sending again (only once to avoid infinite retries)
            try {
              await sendTelegramMessage(
                user.telegram_id,
                message,
                {
                  parse_mode: options?.parseMode || "Markdown",
                }
              );
              success++;
              sent++;
              console.log(`✅ Retry successful for user ${user.telegram_id}`);
            } catch (retryError: any) {
              // If retry also fails, mark as failed
              failed++;
              sent++;
              console.error(`❌ Retry failed for user ${user.telegram_id}:`, retryError);
            }
          } else {
            failed++;
            sent++;
            
            // Handle specific Telegram errors silently
            // Check for blocked user (403) or other expected errors
            if (error?.isBlocked || error?.code === 403) {
              // User blocked bot - this is expected, just log
              console.log(`⚠️ User ${user.telegram_id} blocked the bot`);
            } else {
              const errorMessage = error?.message?.toLowerCase() || "";
              if (
                errorMessage.includes("chat not found") ||
                errorMessage.includes("user not found") ||
                errorMessage.includes("blocked") ||
                errorMessage.includes("bot was blocked")
              ) {
                // User blocked bot or doesn't exist - this is expected, just log
                console.log(`⚠️ User ${user.telegram_id} not reachable (blocked or not found)`);
              } else {
                // Other errors - log but continue
                console.error(`❌ Error sending to user ${user.telegram_id}:`, error);
              }
            }
          }

          // Still send progress updates on errors
          if (options?.onProgress && sent % PROGRESS_UPDATE_INTERVAL === 0) {
            await options.onProgress({ sent, total, success, failed });
          }

          // Add delay even on errors to maintain rate limiting
          // Use longer delay after rate limit errors
          const currentDelay = error?.isRateLimit ? delayMs * 2 : delayMs;
          if (currentDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, currentDelay));
          }
        }
      }

      // Check if we have more pages
      if (users.length < limit) {
        hasMore = false;
      } else {
        page++;
      }
    }

    // Send final progress update if callback provided
    if (options?.onProgress && sent > 0) {
      await options.onProgress({ sent, total, success, failed });
    }

    console.log(`✅ Broadcast completed: ${success} successful, ${failed} failed out of ${total} total`);

    return { success, failed, total };
  } catch (error) {
    sendProductionErrors(
      error,
      `sendBroadcastToAllUsers - total: ${total}, success: ${success}, failed: ${failed}`
    );
    throw error;
  }
}

