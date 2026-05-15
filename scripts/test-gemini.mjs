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
if (!apiKey) {
  console.error("GEMINI_API_KEY topilmadi");
  process.exit(1);
}

console.log("🔑 API kalit topildi (uzunligi:", apiKey.length, ")");

// 1. Mavjud modellar ro'yxatini olish
console.log("\n📋 Mavjud modellar:");
const listRes = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
);
const listData = await listRes.json();
if (!listRes.ok) {
  console.error("❌ Model ro'yxatini olishda xato:");
  console.error(JSON.stringify(listData, null, 2));
  process.exit(1);
}
const generativeModels = listData.models
  ?.filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
  .map((m) => m.name);
console.log(generativeModels?.slice(0, 15).join("\n"));

// 2. gemini-2.0-flash bilan sinab ko'rish
console.log("\n🧪 gemini-2.0-flash bilan sinov:");
const testRes = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Salom, qisqa javob ber: 2+2 nechi?" }] }],
      generationConfig: { maxOutputTokens: 50 },
    }),
  }
);

const testData = await testRes.json();
if (!testRes.ok) {
  console.error("❌ Xato (status:", testRes.status, "):");
  console.error(JSON.stringify(testData, null, 2));
} else {
  console.log("✅ Javob:", testData.candidates?.[0]?.content?.parts?.[0]?.text);
}

// 3. JSON mode bilan sinab ko'rish
console.log("\n🧪 JSON mode sinov:");
const jsonRes = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Bir nechta o'zbekcha so'zlar JSON array sifatida ber" }] }],
      generationConfig: {
        maxOutputTokens: 200,
        responseMimeType: "application/json",
      },
    }),
  }
);

const jsonData = await jsonRes.json();
if (!jsonRes.ok) {
  console.error("❌ JSON mode xato:");
  console.error(JSON.stringify(jsonData, null, 2));
} else {
  console.log("✅ JSON javob:", jsonData.candidates?.[0]?.content?.parts?.[0]?.text);
}
