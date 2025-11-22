import { NextRequest, NextResponse } from "next/server";
import { TelegramUpdate, TelegramMessage } from "@/types/telegram";
import { sendTelegramMessage } from "@/telegram/bot";
import { handleStartCommand } from "@/telegram/handlers/start-handler";
import { updateUserCommand } from "@/dbs/bot-servers";
import { middlewarePipeline } from "@/telegram/middleware";
import { MiddlewareContext } from "@/telegram/middleware/types";
import { handleCreateTestCommand } from "@/telegram/handlers/create-test-handler";
import { handleMyTestsCommand } from "@/telegram/handlers/my-tests-handler";
import { handleMyResultsCommand } from "@/telegram/handlers/my-results-handler";
import { handleTestCode } from "@/telegram/handlers/test-code-handler";
import { handleHelpCommand } from "@/telegram/handlers/help-command-handler";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";
import { isTestCode } from "@/lib/helpers";

/**
 * Handle incoming webhook requests from Telegram
 */
export async function POST(request: NextRequest) {
  try {
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
 * Handle incoming messages
 */
async function handleMessage(message: TelegramMessage) {
  const chatId = message.chat.id;
  const userId = message.from?.id;
  const text = message.text;

  if (!userId || !text) {
    return;
  }

  try {
    // Update user command tracking
    await updateUserCommand(userId.toString(), "message");

    // Handle commands
    if (text.startsWith("/")) {
      await handleCommand(chatId, userId, text);
    } else {
      // Handle regular messages
      await handleRegularMessage(chatId, userId, text);
    }
  } catch (error) {
    console.error("Error handling message:", error);
    sendProductionErrors(error, `handleMessage - chatId: ${chatId}, userId: ${userId}`);
    await sendTelegramMessage(
      chatId,
      "❌ Xabaringizni qayta ishlashda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring."
    );
  }
}

/**
 * Handle bot commands
 */
async function handleCommand(chatId: number, userId: number, command: string) {
  const commandName = command.split(" ")[0].toLowerCase();

  switch (commandName) {
    case "/start":
      await handleStartCommand(chatId);
      break;

    case "/help":
      await handleHelpCommand(chatId);
      break;

    case "/create_test":
      await handleCreateTestCommand(chatId, userId);
      break;

    case "/my_tests":
      await handleMyTestsCommand(chatId, userId);
      break;

    case "/my_results":
      await handleMyResultsCommand(chatId, userId);
      break;

    default:
      await sendTelegramMessage(
        chatId,
        `❓ Noma’lum buyruq: ${commandName}\n\nMavjud buyruqlarni ko‘rish uchun /help yuboring.`
      );
  }
}

/**
 * Handle regular (non-command) messages
 */
async function handleRegularMessage(
  chatId: number,
  userId: number,
  text: string
) {
  // Check if it's a test code (simple pattern matching)
  if (isTestCode(text)) {
    await handleTestCode(chatId, userId, text);
  } else {
    // Default response for regular messages
    await sendTelegramMessage(
      chatId,
      `📝 Xabaringiz qabul qilindi: "${text}"\n\n` +
        `Agar test kodini yuborgan bo'lsangiz, xatolik yuz berdi.\n` +
        `Test tekshirib qayta yuboring yoki o'qituvchingiz bilan bog'laning.\n` +
        `Kodda '_' yoki bo'sh joylar bo'lmasligi kerak.`
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
