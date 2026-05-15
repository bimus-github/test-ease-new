import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const env = Object.fromEntries(
  readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const apiKey = env.GEMINI_API_KEY;

const models = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
];

for (const model of models) {
  process.stdout.write(`${model.padEnd(28)} ... `);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Salom" }] }],
        generationConfig: { maxOutputTokens: 30 },
      }),
    }
  );
  if (res.ok) {
    console.log("✅ ISHLAYDI");
  } else {
    const data = await res.json();
    const msg = data.error?.message?.split("\n")[0] || "noma'lum";
    console.log(`❌ ${res.status} — ${msg.slice(0, 80)}`);
  }
  await new Promise((r) => setTimeout(r, 1000));
}
