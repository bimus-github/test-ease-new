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

export interface TelegramUserData {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface BotStats {
  total_users: number; // Total number of users
  active_today: number; // Total number of active users today
  active_week: number; // Total number of active users in the last 7 days
  premium_users: number; // Total number of premium users
  avg_days_since_start: number; // Average number of days since the user started using the bot
  top_teachers: {
    [key:string]: {
      user: TGUser;
      total_tests: number;
    };
  } // Top 15 users by total tests created(tests table), telegram_username => { user: TGUser, total_tests: number }
  top_students: {
    [key:string]: {
      user: TGUser;
      total_submissions: number;
    };
  } // Top 15 users by total tests taken(submissions table), telegram_username => { user: TGUser, total_submissions: number }
}

export interface UserActivity {
  telegram_id: string;
  telegram_username: string;
  telegram_first_name: string;
  last_command: string;
  last_interaction_at: string;
  started_at: string;
}
