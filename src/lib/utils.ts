import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to local time with a consistent format
 * @param dateString - ISO date string
 * @param options - Optional Intl.DateTimeFormatOptions to override defaults
 * @returns Formatted date string in local time
 */
export function formatLocalDate(
  dateString?: string | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return "—";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) return "—";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Intl.DateTimeFormat("uz-UZ", {
    ...defaultOptions,
    ...options,
  }).format(date);
}

/**
 * Format a date string to local date only (no time)
 */
export function formatLocalDateOnly(dateString?: string | null): string {
  return formatLocalDate(dateString, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date string to local time only (no date)
 */
export function formatLocalTimeOnly(dateString?: string | null): string {
  return formatLocalDate(dateString, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Convert ISO datetime string to datetime-local input format
 * @param dateString - ISO date string
 * @returns Formatted string for datetime-local input (YYYY-MM-DDTHH:mm)
 */
export function toDateTimeLocalValue(dateString?: string | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(dateString?: string | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  // Check if date is valid
  if (isNaN(date.getTime())) return "";

  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const absDiff = Math.abs(diffInSeconds);

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  for (const { unit, seconds } of units) {
    if (absDiff >= seconds) {
      const value = Math.floor(diffInSeconds / seconds);
      return new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
      }).format(value, unit);
    }
  }

  return "just now";
}

/**
 * Convert datetime-local input value to ISO string for database storage
 * Takes local time and converts to UTC ISO string
 * @param dateTimeLocalValue - Value from datetime-local input (e.g., "2025-10-12T14:30")
 * @returns ISO string in UTC (e.g., "2025-10-12T14:30:00.000Z") or undefined
 */
export function dateTimeLocalToISO(
  dateTimeLocalValue?: string | null
): string | undefined {
  if (!dateTimeLocalValue) return undefined;

  // The datetime-local value is interpreted as local time by the browser
  // new Date() will create a Date object in the user's timezone
  const date = new Date(dateTimeLocalValue);

  // Check if date is valid
  if (isNaN(date.getTime())) return undefined;

  // Convert to ISO string (UTC)
  return date.toISOString();
}

/**
 * Parse a date string (ISO or datetime-local) to Date object
 * Handles both UTC ISO strings and local datetime-local strings
 */
export function parseDate(dateString?: string | null): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Check if a date is in the past
 * Works with both ISO (UTC) and datetime-local strings
 */
export function isPast(dateString?: string | null): boolean {
  const date = parseDate(dateString);
  return date ? date < new Date() : false;
}

/**
 * Check if a date is in the future
 * Works with both ISO (UTC) and datetime-local strings
 */
export function isFuture(dateString?: string | null): boolean {
  const date = parseDate(dateString);
  return date ? date > new Date() : false;
}
