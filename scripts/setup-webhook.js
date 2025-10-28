#!/usr/bin/env node

/**
 * Telegram Bot Webhook Setup Script
 *
 * This script helps you set up the Telegram bot webhook after deployment.
 *
 * Usage:
 *   node scripts/setup-webhook.js <webhook-url>
 *
 * Example:
 *   node scripts/setup-webhook.js https://your-app.vercel.app/api/telegram
 */

import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

/**
 * Set webhook URL for the bot
 */
async function setWebhook(webhookUrl) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not defined");
    }

    const url = `https://api.telegram.org/bot${token}/setWebhook`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: [
          "message",
          "callback_query",
          "inline_query",
          "chosen_inline_result",
        ],
        drop_pending_updates: true,
      }),
    });

    const result = await response.json();

    if (result.ok) {
      console.log("✅ Webhook set successfully:", webhookUrl);
      return true;
    } else {
      console.error("❌ Failed to set webhook:", result);
      return false;
    }
  } catch (error) {
    console.error("❌ Error setting webhook:", error);
    return false;
  }
}

/**
 * Get current webhook info
 */
async function getWebhookInfo() {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not defined");
    }

    const url = `https://api.telegram.org/bot${token}/getWebhookInfo`;
    const response = await fetch(url);
    const result = await response.json();

    return result;
  } catch (error) {
    console.error("❌ Error getting webhook info:", error);
    return null;
  }
}

/**
 * Test webhook endpoint
 */
async function testWebhook(webhookUrl) {
  try {
    const response = await fetch(webhookUrl, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Webhook test successful:", data);
      return true;
    } else {
      console.error("❌ Webhook test failed:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing webhook:", error);
    return false;
  }
}

async function setupWebhook(webhookUrl) {
  console.log("🤖 Setting up Telegram bot webhook...");
  console.log(`📍 Webhook URL: ${webhookUrl}`);

  // Check if bot token is available
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error(
      "❌ TELEGRAM_BOT_TOKEN is not defined in environment variables"
    );
    process.exit(1);
  }

  try {
    // Test webhook endpoint first
    console.log("🔍 Testing webhook endpoint...");
    const testResult = await testWebhook(webhookUrl);

    if (!testResult) {
      console.error("❌ Webhook endpoint is not accessible");
      console.log(
        "💡 Make sure your app is deployed and the endpoint is working"
      );
      process.exit(1);
    }

    console.log("✅ Webhook endpoint is accessible");

    // Get current webhook info
    console.log("📊 Getting current webhook info...");
    const currentInfo = await getWebhookInfo();

    if (currentInfo?.ok) {
      console.log("Current webhook info:", {
        url: currentInfo.result.url,
        has_custom_certificate: currentInfo.result.has_custom_certificate,
        pending_update_count: currentInfo.result.pending_update_count,
      });
    }

    // Set new webhook
    console.log("🔧 Setting new webhook...");
    const success = await setWebhook(webhookUrl);

    if (success) {
      console.log("✅ Webhook set successfully!");
      console.log("🎉 Your Telegram bot is now ready to receive updates");

      // Get updated webhook info
      const updatedInfo = await getWebhookInfo();
      if (updatedInfo?.ok) {
        console.log("Updated webhook info:", {
          url: updatedInfo.result.url,
          pending_update_count: updatedInfo.result.pending_update_count,
        });
      }
    } else {
      console.error("❌ Failed to set webhook");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error setting up webhook:", error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const webhookUrl = process.argv[2];

  if (!webhookUrl) {
    console.error("❌ Please provide webhook URL");
    console.log("Usage: node scripts/setup-webhook.js <webhook-url>");
    console.log(
      "Example: node scripts/setup-webhook.js https://your-app.vercel.app/api/telegram"
    );
    process.exit(1);
  }

  await setupWebhook(webhookUrl);
}

// Run the script
main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
