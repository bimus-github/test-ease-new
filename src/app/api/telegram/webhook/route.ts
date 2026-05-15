import { NextRequest, NextResponse } from "next/server";
import { TelegramUpdate, TelegramMessage } from "@/types/telegram";
import { middlewarePipeline } from "@/telegram/middleware";
import { MiddlewareContext } from "@/telegram/middleware/types";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";
import { handleMessage } from "./handles/messages";
import { handleCreateTestCallback, CALLBACK_PREFIXES } from "@/telegram/menu/create-test";
import { handleBroadcastConfirmation } from "@/telegram/handlers/group/broadcast-confirmation-handler";

/**
 * Handle incoming webhook requests from Telegram
 */
export async function POST(request: NextRequest) {
  try {
    // Optional webhook secret verification.
    // Skipped if TELEGRAM_WEBHOOK_SECRET is not set or still has the placeholder value.
    // To enable: set a real value in env AND re-register webhook with the same secret_token.
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const secretIsConfigured =
      !!expectedSecret &&
      expectedSecret.length >= 8 &&
      expectedSecret !== "your_webhook_secret_for_security";
    if (secretIsConfigured) {
      const providedSecret = request.headers.get("x-telegram-bot-api-secret-token");
      if (providedSecret !== expectedSecret) {
        console.warn("❌ Webhook secret mismatch — rejecting request");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Get the raw body
    const body = await request.text();

    // Parse the update
    const update: TelegramUpdate = JSON.parse(body);

    // Log the update for debugging
    console.log("📨 Received update:", {
      update_id: update.update_id,
      type: Object.keys(update).filter((key) => key !== "update_id")[0],
      user_id: update.message?.from?.id || update.callback_query?.from?.id,
    });

    // Handle message updates
    if (update.message) {
      const context: MiddlewareContext = {
        update,
        message: update.message,
        user: update.message.from!,
        chatId: update.message.chat.id,
        userId: update.message.from!.id,
        command: update.message.text?.startsWith("/")
          ? update.message.text.split(" ")[0]
          : undefined,
        text: update.message.text,
      };

      // Run middleware pipeline (user sync)
      const middlewareResult = await middlewarePipeline.execute(context);

      if (!middlewareResult.success || !middlewareResult.shouldContinue) {
        sendProductionErrors(middlewareResult.error, `webhook POST - middleware failed, userId: ${context.userId}`);
        console.error("Middleware failed:", middlewareResult.error);
        return NextResponse.json({ ok: true });
      }

      // Continue with command handling
      await handleMessage(update.message);
    }

    // Handle callback queries (inline keyboard)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message?.chat.id;
      const callbackData = callbackQuery.data;
      const callbackQueryId = callbackQuery.id;
      const userId = callbackQuery.from?.id;

      if (chatId && callbackData && callbackQueryId && userId) {
        // Handle create test menu callbacks
        if (callbackData.startsWith(CALLBACK_PREFIXES.CREATE_TEST_SCORING)) {
          await handleCreateTestCallback(chatId, callbackQueryId, callbackData);
        }
        // Handle broadcast confirmation callbacks
        else if (
          callbackData.startsWith(CALLBACK_PREFIXES.CONFIRM_BROADCAST) ||
          callbackData.startsWith(CALLBACK_PREFIXES.CANCEL_BROADCAST)
        ) {
          await handleBroadcastConfirmation(
            callbackQueryId,
            userId,
            callbackData,
            chatId
          );
        }
        // Add other callback handlers here as needed
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Telegram webhook error:", error);
    sendProductionErrors(error, "webhook POST");
    return NextResponse.json(
      {
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests for webhook verification and health checks
 */
export async function GET() {
  try {
    return NextResponse.json({
      status: "Webhook endpoint is running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error("❌ Error in webhook health check:", error);
    sendProductionErrors(error, "webhook GET - health check");
    return NextResponse.json(
      {
        status: "Webhook endpoint is running but error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}





/**
 * Handle other HTTP methods
 */
export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
