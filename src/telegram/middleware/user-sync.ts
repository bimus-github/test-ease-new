import { getUserProfile, saveOrUpdateUser } from "@/dbs/bot-servers";
import { MiddlewareContext, MiddlewareResult } from "./types";
import { sendProductionErrors } from "../notifications/sendProductionErrors";
import { sendTelegramMessage } from "../bot";

const adminId = process.env.NEXT_PUBLIC_TG_ADMIN || "7847738077";

export async function userSyncMiddleware(
  context: MiddlewareContext
): Promise<MiddlewareResult> {
  const { userId, user } = context;

  try {
    // Always check if user exists in database
    const dbUser = await getUserProfile(userId.toString());

    if (!dbUser) {
      // User not found, create them
      console.log(`👤 Creating new user: ${userId}`);
      const savedUser = await saveOrUpdateUser(
        {
          id: user.id,
          is_bot: user.is_bot,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          language_code: user.language_code,
          is_premium: user.is_premium,
        },
        "register"
      );

      // Send notification to admin
      sendTelegramMessage(adminId, `👤 Creating new user: 
        ${userId}\n\n\`\`\`\n${JSON.stringify(savedUser, null, 2)}\`\`\`
        ${savedUser?.telegram_username ? `Username: @${savedUser.telegram_username}` : ""}
        `);

      if (!savedUser) {
        sendProductionErrors("Failed to create user", `userSyncMiddleware - userId: ${userId}`);
        return {
          success: false,
          shouldContinue: false,
          error: "Failed to create user",
        };
      }

      return {
        success: true,
        user: savedUser,
        shouldContinue: true,
      };
    }

    // Check if user data has changed
    const hasChanges =
      dbUser.telegram_username !== user.username ||
      dbUser.telegram_first_name !== user.first_name ||
      dbUser.telegram_last_name !== user.last_name ||
      dbUser.telegram_language_code !== user.language_code ||
      dbUser.telegram_is_premium !== user.is_premium;

    if (hasChanges) {
      // Update user data
      console.log(`🔄 Updating user data: ${userId}`);
      const updatedUser = await saveOrUpdateUser(
        {
          id: user.id,
          is_bot: user.is_bot,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          language_code: user.language_code,
          is_premium: user.is_premium,
        },
        "update"
      );

      if (!updatedUser) {
        sendProductionErrors("Failed to update user", `userSyncMiddleware - userId: ${userId}`);
        return {
          success: false,
          shouldContinue: false,
          error: "Failed to update user",
        };
      }

      return {
        success: true,
        user: updatedUser,
        shouldContinue: true,
      };
    }

    // No changes needed
    return {
      success: true,
      user: dbUser,
      shouldContinue: true,
    };
  } catch (error) {
    console.error("User sync middleware error:", error);
    sendProductionErrors(error, `userSyncMiddleware - userId: ${userId}`);
    return {
      success: false,
      shouldContinue: false,
      error: "User sync failed",
    };
  }
}
