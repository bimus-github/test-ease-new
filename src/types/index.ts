// Common TypeScript types for your application
export interface TGUser {
  id: string;
  telegram_id: string;
  telegram_username: string;
  telegram_first_name: string;
  telegram_last_name: string;
  telegram_photo_url: string;
  telegram_language_code: string;
  telegram_is_bot: boolean;
  telegram_is_premium: boolean;
  last_command: string;
  last_interaction_at: string;
  started_at: string;
  created_at: string;
}
