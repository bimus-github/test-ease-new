// Telegram WebApp initData verification
// Docs: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

import crypto from "node:crypto";

export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface VerifiedInitData {
  user: TelegramWebAppUser;
  authDate: number;
  hash: string;
  raw: string;
}

const MAX_AGE_SECONDS = 24 * 60 * 60; // 1 day

export function verifyInitData(
  initDataRaw: string,
  botToken?: string
): VerifiedInitData | null {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("verifyInitData: TELEGRAM_BOT_TOKEN not set");
    return null;
  }
  if (!initDataRaw) return null;

  const params = new URLSearchParams(initDataRaw);
  const receivedHash = params.get("hash");
  if (!receivedHash) return null;
  params.delete("hash");

  // Build data_check_string: sort key=value pairs by key, join with \n
  const pairs = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`);
  const dataCheckString = pairs.join("\n");

  // secret_key = HMAC-SHA256("WebAppData", bot_token)
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(token).digest();
  // calculated_hash = HMAC-SHA256(secret_key, data_check_string)
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash !== receivedHash) {
    return null;
  }

  // Check freshness (auth_date in seconds)
  const authDate = parseInt(params.get("auth_date") || "0", 10);
  const now = Math.floor(Date.now() / 1000);
  if (!authDate || now - authDate > MAX_AGE_SECONDS) {
    return null;
  }

  // Parse user
  const userRaw = params.get("user");
  if (!userRaw) return null;
  let user: TelegramWebAppUser;
  try {
    user = JSON.parse(userRaw);
  } catch {
    return null;
  }
  if (!user.id) return null;

  return { user, authDate, hash: receivedHash, raw: initDataRaw };
}

/**
 * Reads initData from request headers/body and verifies it.
 * Returns the verified user's telegram_id (as string) or null.
 *
 * Usage: in any protected server action / API route, call this first.
 */
export function getVerifiedTelegramId(initData: string | null | undefined): string | null {
  if (!initData) return null;
  const verified = verifyInitData(initData);
  return verified ? String(verified.user.id) : null;
}
