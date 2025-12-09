# Emergency Stop Guide for Telegram Bot

## Quick Ways to Stop the Bot in Production

### 1. Delete Webhook (Fastest - Stops receiving updates)
```bash
# Using curl
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook"

# Or create a quick script
node -e "
const token = process.env.TELEGRAM_BOT_TOKEN;
fetch(\`https://api.telegram.org/bot\${token}/deleteWebhook\`, { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
"
```

### 2. Stop the Server/Deployment
- **Vercel**: Go to dashboard → Project → Settings → Delete deployment
- **Railway/Render**: Stop the service in dashboard
- **Docker**: `docker stop <container_id>`
- **PM2**: `pm2 stop all`

### 3. Set Webhook to Empty URL
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": ""}'
```

### 4. Environment Variable Kill Switch
Add `BOT_DISABLED=true` to your environment variables and restart.

## Prevention: Add Safety Limits

See the updated `sendBroadcastNotification.ts` with maximum page limit to prevent infinite loops.

