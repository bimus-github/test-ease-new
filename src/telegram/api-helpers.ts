import { NextRequest, NextResponse } from "next/server";

// ============================================
// 🔐 Authentication & Validation
// ============================================

/**
 * Verify Telegram bot token from request headers
 */
export function verifyBotToken(request: NextRequest): {
  valid: boolean;
  response?: NextResponse;
} {
  const botToken = request.headers.get("x-telegram-bot-token");
  const expectedToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!expectedToken) {
    console.error("❌ TELEGRAM_BOT_TOKEN not set in environment");
    return {
      valid: false,
      response: errorResponse("Bot token not configured", 500),
    };
  }

  if (botToken !== expectedToken) {
    console.error("❌ Bot token mismatch - Unauthorized");
    return {
      valid: false,
      response: errorResponse("Unauthorized", 401),
    };
  }

  return { valid: true };
}

// ============================================
// 📤 Response Helpers
// ============================================

/**
 * Create success response
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Create error response
 */
export function errorResponse(
  message: string,
  status = 400,
  extra?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...extra,
    },
    { status }
  );
}

/**
 * Create not found response
 */
export function notFoundResponse(message = "Not found"): NextResponse {
  return errorResponse(message, 404);
}

/**
 * Create validation error response
 */
export function validationError(message: string): NextResponse {
  return errorResponse(message, 400);
}

// ============================================
// 🛠️ Utility Functions
// ============================================

/**
 * Get app URL from environment
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Safely parse integer from string
 */
export function parseIntSafe(value: string | null): number | null {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}
