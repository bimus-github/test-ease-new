import { config } from "dotenv";

config({ path: ".env.local" });

async function setBotCommands() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("❌ TELEGRAM_BOT_TOKEN not found in environment variables");
    process.exit(1);
  }

  const commands = [
    { command: "start", description: "Start the bot and register" },
    { command: "help", description: "Get help information" },
    { command: "menu", description: "Show main menu with buttons" },
    { command: "myid", description: "Show your Telegram ID" },
    { command: "profile", description: "View your profile" },
    { command: "stats", description: "View bot statistics" },
  ];

  console.log("🤖 Setting up Telegram bot commands...");
  console.log("Commands to set:", commands);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/setMyCommands`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commands }),
      }
    );

    const result = await response.json();

    if (result.ok) {
      console.log("✅ Bot commands set successfully!");
      console.log("📋 Commands configured:");
      commands.forEach((cmd) => {
        console.log(`   • /${cmd.command} - ${cmd.description}`);
      });
    } else {
      console.error("❌ Failed to set commands:", result);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error setting commands:", error);
    process.exit(1);
  }
}

// Run the setup
setBotCommands().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
