import { supabase } from "@/lib/supabase";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";
import { BotStats, TelegramUserData, TGUser, UserActivity } from "@/types/tg-user";



/**
 * Save or update a Telegram user in the database
 * @param user - Telegram user data from the API
 * @param command - The command that triggered this save
 * @returns TGUser object or null if failed
 */
export async function saveOrUpdateUser(
  user: TelegramUserData,
  command: string = "start"
): Promise<TGUser | null> {
  try {
    const userData = {
      telegram_id: user.id.toString(),
      telegram_username: user.username,
      telegram_first_name: user.first_name,
      telegram_last_name: user.last_name,
      telegram_photo_url: user.photo_url,
      telegram_language_code: user.language_code,
      telegram_is_bot: user.is_bot,
      telegram_is_premium: user.is_premium || false,
      last_command: command,
      last_interaction_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("bot_users")
      .upsert(userData, {
        onConflict: "telegram_id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving/updating user:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
}

/**
 * Update user's last command and interaction timestamp
 * @param telegramId - User's Telegram ID
 * @param command - The command that was executed
 * @returns boolean indicating success
 */
export async function updateUserCommand(
  telegramId: string,
  command: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("bot_users")
      .update({
        last_command: command,
        last_interaction_at: new Date().toISOString(),
      })
      .eq("telegram_id", telegramId);

    if (error) {
      sendProductionErrors(error, "updateUserCommand");
      console.error("Error updating user command:", error);
      return false;
    }

    return true;
  } catch (error) {
    sendProductionErrors(error, "updateUserCommand");
    console.error("Database error:", error);
    return false;
  }
}

/**
 * Get user profile by Telegram ID
 * @param telegramId - User's Telegram ID
 * @returns TGUser object or null if not found
 */
export async function getUserProfile(
  telegramId: string
): Promise<TGUser | null> {
  try {
    const { data, error } = await supabase
      .from("bot_users")
      .select("*")
      .eq("telegram_id", telegramId)
      .single();

    if (error) {
      sendProductionErrors("User not found with Id: " + telegramId + ". It will created soon.", "getUserProfile");
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    sendProductionErrors(error, "getUserProfile");
    console.error("Database error:", error);
    return null;
  }
}

/**
 * Get all users with pagination
 * @param page - Page number (0-based)
 * @param limit - Number of users per page
 * @returns Array of TGUser objects
 */
export async function getAllUsers(
  page: number = 0,
  limit: number = 50
): Promise<TGUser[]> {
  try {
    const { data, error } = await supabase
      .from("bot_users")
      .select("*")
      .order("last_interaction_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) {
      sendProductionErrors(error, "getAllUsers");
      console.error("Error fetching users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    sendProductionErrors(error, "getAllUsers");
    console.error("Database error:", error);
    return [];
  }
}

/**
 * Get active users (users active in the last 24 hours)
 * @returns Array of UserActivity objects
 */
export async function getActiveUsers(): Promise<UserActivity[]> {
  try {
    const { data, error } = await supabase
      .from("bot_users")
      .select(
        "telegram_id, telegram_username, telegram_first_name, last_command, last_interaction_at, started_at"
      )
      .gte(
        "last_interaction_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      )
      .order("last_interaction_at", { ascending: false });

    if (error) {
      sendProductionErrors(error, "getActiveUsers");
      console.error("Error fetching active users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    sendProductionErrors(error, "getActiveUsers");
    console.error("Database error:", error);
    return [];
  }
}

/**
 * Get bot statistics
 * @returns BotStats object with various metrics
 */
export async function getBotStats(): Promise<BotStats | null> {
  try {
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .single()

    if (error) {
      sendProductionErrors(error, "getBotStats");
      console.error("Error fetching bot stats:", error);
      return null;
    }

    return data as BotStats || null;
  } catch (error) {
    sendProductionErrors(error, "getBotStats");
    console.error("Database error:", error);
    return null;
  }
}

/**
 * Search users by username or name
 * @param query - Search query
 * @param limit - Maximum number of results
 * @returns Array of TGUser objects
 */
export async function searchUsers(
  query: string,
  limit: number = 20
): Promise<TGUser[]> {
  try {
    const { data, error } = await supabase
      .from("bot_users")
      .select("*")
      .or(
        `telegram_username.ilike.%${query}%,telegram_first_name.ilike.%${query}%,telegram_last_name.ilike.%${query}%`
      )
      .limit(limit);

    if (error) {
      sendProductionErrors(error, "searchUsers");
      console.error("Error searching users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    sendProductionErrors(error, "searchUsers");
    console.error("Database error:", error);
    return [];
  }
}

/**
 * Delete a user from the database
 * @param telegramId - User's Telegram ID
 * @returns boolean indicating success
 */
export async function deleteUser(telegramId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("bot_users")
      .delete()
      .eq("telegram_id", telegramId);

    if (error) {
      sendProductionErrors(error, "deleteUser");
      console.error("Error deleting user:", error);
      return false;
    }

    return true;
  } catch (error) {
    sendProductionErrors(error, "deleteUser");
    console.error("Database error:", error);
    return false;
  }
}

/**
 * Update user's premium status
 * @param telegramId - User's Telegram ID
 * @param isPremium - Premium status
 * @returns boolean indicating success
 */
export async function updateUserPremiumStatus(
  telegramId: string,
  isPremium: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("bot_users")
      .update({
        telegram_is_premium: isPremium,
        updated_at: new Date().toISOString(),
      })
      .eq("telegram_id", telegramId);

    if (error) {
      sendProductionErrors(error, "updatePremiumStatus");
      console.error("Error updating premium status:", error);
      return false;
    }

    return true;
  } catch (error) {
    sendProductionErrors(error, "updatePremiumStatus");
    console.error("Database error:", error);
    return false;
  }
}

/**
 * Get users by language code
 * @param languageCode - Language code (e.g., 'en', 'ru')
 * @returns Array of TGUser objects
 */
export async function getUsersByLanguage(
  languageCode: string
): Promise<TGUser[]> {
  try {
    const { data, error } = await supabase
      .from("bot_users")
      .select("*")
      .eq("telegram_language_code", languageCode)
      .order("last_interaction_at", { ascending: false });

    if (error) {
      sendProductionErrors(error, "getUsersByLanguage");
      console.error("Error fetching users by language:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    sendProductionErrors(error, "getUsersByLanguage");
    console.error("Database error:", error);
    return [];
  }
}

/**
 * Get user count by time period
 * @param days - Number of days to look back
 * @returns number of users
 */
export async function getUserCountByPeriod(days: number): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { count, error } = await supabase
      .from("bot_users")
      .select("*", { count: "exact", head: true })
      .gte("last_interaction_at", cutoffDate.toISOString());

    if (error) {
      sendProductionErrors(error, "getUserCount");
      console.error("Error fetching user count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    sendProductionErrors(error, "getUserCount");
    console.error("Database error:", error);
    return 0;
  }
}
