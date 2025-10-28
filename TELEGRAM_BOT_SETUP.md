# Telegram Bot Setup Guide

This guide will help you set up the Telegram bot for your Next.js application.

## Prerequisites

1. **Telegram Bot Token**: Create a bot using [@BotFather](https://t.me/botfather)
2. **Supabase Database**: Set up your database with the provided SQL schema
3. **Deployed Application**: Your Next.js app should be deployed (Vercel, Netlify, etc.)

## Environment Variables

Add these variables to your `.env.local` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_WEBHOOK_SECRET=your_optional_webhook_secret
TELEGRAM_ADMIN_IDS=123456789,987654321

# Supabase Configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Setup

Run this SQL in your Supabase SQL editor:

```sql
-- Create the bot_users table
CREATE TABLE bot_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id TEXT UNIQUE NOT NULL,
  telegram_username TEXT,
  telegram_first_name TEXT NOT NULL,
  telegram_last_name TEXT,
  telegram_photo_url TEXT,
  telegram_language_code TEXT,
  telegram_is_bot BOOLEAN DEFAULT FALSE,
  telegram_is_premium BOOLEAN DEFAULT FALSE,
  last_command TEXT,
  last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_bot_users_telegram_id ON bot_users(telegram_id);
CREATE INDEX idx_bot_users_username ON bot_users(telegram_username);
CREATE INDEX idx_bot_users_last_interaction ON bot_users(last_interaction_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bot_users_updated_at
    BEFORE UPDATE ON bot_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Bot Commands

The bot supports the following commands:

- `/start` - Register and start using the bot
- `/help` - Show help information
- `/profile` - View your profile and stats
- `/stats` - View bot statistics
- `/ping` - Test bot responsiveness
- `/search <query>` - Search users (admin only)

## Deployment Steps

### 1. Deploy Your Application

Deploy your Next.js app to your preferred platform (Vercel, Netlify, etc.).

### 2. Set Up Webhook

After deployment, set up the webhook using one of these methods:

#### Method 1: Using the Setup Script

```bash
yarn setup-webhook https://your-app.vercel.app/api/telegram
```

#### Method 2: Using the API Endpoint

```bash
curl -X POST "https://your-app.vercel.app/api/webhook" \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "https://your-app.vercel.app/api/telegram"}'
```

#### Method 3: Manual Setup

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.vercel.app/api/telegram",
    "allowed_updates": ["message", "callback_query", "inline_query"],
    "drop_pending_updates": true
  }'
```

### 3. Verify Setup

Test your bot by:

1. **Check webhook status**:

   ```bash
   curl "https://your-app.vercel.app/api/webhook"
   ```

2. **Send `/start` to your bot** in Telegram

3. **Check database** - User should be registered in `bot_users` table

## API Endpoints

### Webhook Endpoint

- **POST** `/api/telegram` - Receives updates from Telegram
- **GET** `/api/telegram` - Health check and bot info

### Webhook Management

- **GET** `/api/webhook` - Get webhook info
- **POST** `/api/webhook` - Set webhook URL
- **DELETE** `/api/webhook` - Delete webhook

## File Structure

```
src/
├── app/
│   └── api/
│       ├── telegram/
│       │   └── route.ts          # Webhook endpoint
│       └── webhook/
│           └── route.ts          # Webhook management
├── lib/
│   ├── telegram.ts              # Bot configuration
│   ├── bot-handlers.ts          # Command handlers
│   └── webhook-utils.ts         # Webhook utilities
├── dbs/
│   └── bot-servers.ts           # Database operations
└── types/
    └── index.ts                 # TypeScript types
```

## Testing

### Local Development

1. **Start your app**:

   ```bash
   yarn dev
   ```

2. **Use ngrok for local testing**:

   ```bash
   npx ngrok http 3000
   ```

3. **Set webhook to ngrok URL**:
   ```bash
   yarn setup-webhook https://your-ngrok-url.ngrok.io/api/telegram
   ```

### Production Testing

1. **Test webhook endpoint**:

   ```bash
   curl "https://your-app.vercel.app/api/telegram"
   ```

2. **Send test message** to your bot in Telegram

3. **Check logs** in your deployment platform

## Troubleshooting

### Common Issues

1. **Webhook not receiving updates**:

   - Check if webhook URL is accessible
   - Verify bot token is correct
   - Check deployment logs for errors

2. **Database connection issues**:

   - Verify Supabase credentials
   - Check if table exists
   - Test database connection

3. **Bot not responding**:
   - Check webhook status
   - Verify command handlers are set up
   - Check error logs

### Debug Commands

```bash
# Check webhook info
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"

# Test webhook endpoint
curl "https://your-app.vercel.app/api/telegram"

# Get bot info
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"
```

## Security Considerations

1. **Webhook Secret**: Use `TELEGRAM_WEBHOOK_SECRET` for additional security
2. **Admin IDs**: Set `TELEGRAM_ADMIN_IDS` for admin-only commands
3. **Rate Limiting**: Consider implementing rate limiting for webhook endpoint
4. **Input Validation**: All user inputs are validated before processing

## Monitoring

Monitor your bot using:

1. **Application logs** - Check deployment platform logs
2. **Database queries** - Monitor Supabase dashboard
3. **Bot statistics** - Use `/stats` command
4. **Webhook health** - Regular health checks

## Next Steps

1. **Customize commands** - Add your own bot commands
2. **Add features** - Implement additional functionality
3. **Analytics** - Set up monitoring and analytics
4. **Scaling** - Optimize for high traffic

## Support

If you encounter issues:

1. Check the logs in your deployment platform
2. Verify all environment variables are set
3. Test webhook connectivity
4. Check database connection and schema

Your Telegram bot is now ready to use! 🎉
