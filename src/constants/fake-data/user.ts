import { TGUser } from "@/types/tg-user";

export const fakeUsers: TGUser = {
  id: "1",
  telegram_id: "1",
  telegram_username: "john_doe",
  telegram_first_name: "John",
  telegram_last_name: "Doe",
  telegram_photo_url: "https://example.com/photo.jpg",
  telegram_language_code: "en",
  telegram_is_bot: false,
  telegram_is_premium: false,
  last_command: "start",
  last_interaction_at: new Date().toISOString(),
  started_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};
