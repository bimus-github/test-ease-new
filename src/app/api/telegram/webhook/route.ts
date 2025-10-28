import { NextRequest, NextResponse } from "next/server";
import { TelegramUpdate, TelegramMessage } from "@/lib/types/telegram";
import { sendTelegramMessage } from "@/telegram/bot";
import { handleStartCommand } from "@/telegram/handlers/start-handler";
import {
  handleMenuCommand,
  handleCallbackQuery,
} from "@/telegram/handlers/menu-handler";
import { updateUserCommand } from "@/dbs/bot-servers";
import { middlewarePipeline } from "@/telegram/middleware";
import { MiddlewareContext } from "@/telegram/middleware/types";

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
        console.error("Middleware failed:", middlewareResult.error);
        return NextResponse.json({ ok: true });
      }

      // Continue with command handling
      await handleMessage(update.message);
    }

    // Handle callback queries (inline keyboard)
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Telegram webhook error:", error);

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
    await sendTelegramMessage(
      chatId,
      "❌ An error occurred while processing your message. Please try again."
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

    case "/menu":
      await handleMenuCommand(chatId, userId);
      break;

    case "/help":
      await handleHelpCommand(chatId);
      await updateUserCommand(userId.toString(), "help");
      break;

    case "/myid":
      await handleMyIdCommand(chatId, userId);
      await updateUserCommand(userId.toString(), "myid");
      break;

    default:
      await sendTelegramMessage(
        chatId,
        `❓ Unknown command: ${commandName}\n\nUse /help to see available commands.`
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
      `📝 I received your message: "${text}"\n\n` +
        `Send me a test code (like ABC123) or use /help to see available commands.`
    );
  }
}

/**
 * Handle help command
 */
async function handleHelpCommand(chatId: number) {
  await sendTelegramMessage(
    chatId,
    `📚 *Test Ease Bot Help*\n\n` +
      `*Available commands:*\n` +
      `• /start - Welcome message and instructions\n` +
      `• /help - Show this help message\n` +
      `• /menu - Show main menu with buttons\n` +
      `• /myid - Show your Telegram ID\n\n` +
      `*How to use:*\n` +
      `1️⃣ Get a test code from your teacher\n` +
      `2️⃣ Send me the code (like: ABC123)\n` +
      `3️⃣ I'll give you a link to take the test\n` +
      `4️⃣ Complete the test and get your results!\n\n` +
      `*Need help?* Contact your teacher! 👨‍🏫`,
    { parse_mode: "Markdown" }
  );
}

/**
 * Handle myid command
 */
async function handleMyIdCommand(chatId: number, userId: number) {
  await sendTelegramMessage(
    chatId,
    `🆔 Your Telegram ID: \`${userId}\`\n\n` +
      `Share this ID with your teacher if needed.`,
    { parse_mode: "Markdown" }
  );
}

/**
 * Check if text looks like a test code
 */
function isTestCode(text: string): boolean {
  // Simple pattern: 3-6 alphanumeric characters
  const testCodePattern = /^[A-Za-z0-9]{3,6}$/;
  return testCodePattern.test(text.trim());
}

/**
 * Handle test code input
 */
async function handleTestCode(
  chatId: number,
  userId: number,
  testCode: string
) {
  // For now, just acknowledge the test code
  // In a real implementation, you'd validate the code and provide a test link
  await sendTelegramMessage(
    chatId,
    `🎯 Test code received: \`${testCode}\`\n\n` +
      `✅ Code format looks valid!\n\n` +
      `*Next steps:*\n` +
      `1️⃣ I'm checking if this test is available...\n` +
      `2️⃣ If valid, I'll send you the test link\n` +
      `3️⃣ Complete the test and get your results!\n\n` +
      `*Note:* This is a demo. In the real version, I would validate the code with your teacher's system.`,
    { parse_mode: "Markdown" }
  );
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
