const TELEGRAM_BOT_TOKEN =
  "8399156152:AAEZCvknDgJ8RLH6LQXTTlOL0Nw75efj6dQ";

const WEBHOOK_URL =
  "https://test-ease-new.vercel.app/api/telegram/webhook";

export async function GET() {
  const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      url: WEBHOOK_URL,
    }),
  });

  const data = await response.json();

  return Response.json(
    {
      ok: data?.ok ?? false,
      description: data?.description,
      result: data?.result,
    },
    {
      status: response.ok ? 200 : 500,
    },
  );
}

