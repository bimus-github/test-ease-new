import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface GenerateRequest {
  topic: string;
  count: number;
  language: string;
  questionType: "multiple_choice" | "fill_blank" | "mixed";
  level?: string;
}

interface GeneratedQuestion {
  question_text: string;
  question_type: "multiple_choice" | "fill_blank";
  options?: string[];
  correct_answer: string;
}

const isUzbek = (lang: string) => /o['']?zbek|uzb/i.test(lang);

const SYSTEM_INSTRUCTION_UZ = `Sen O'zbekiston Respublikasi maktab va o'quv markazlarida ishlovchi tajribali pedagog va test muallifisan.
Sening vazifang — o'zbek tilida grammatika, imlo va uslub jihatidan toza, pedagogik jihatdan mazmunli, va o'zbek o'qituvchilari tomonidan haqiqatda ishlatiladigan tarzda test savollarini tuzish.

UZBEK TILIDA YOZISH QOIDALARI:
1. Lotin yozuvi (kirill emas). Apostrof "'" emas, balki to'g'ri belgilar ishlat: o', g', sh, ch
2. Punktuatsiya: "tirnoq", — uzun chiziq, va h.k.
3. So'zlardagi diftong va belgilar: kabi, uchun, lekin, ammo — to'g'ri yozilsin
4. "Quyidagi savolga javob bering:" emas, balki to'g'ridan-to'g'ri savol matni ber
5. Variantlarning matni qisqa, aniq, bir-biriga o'xshamaydigan bo'lsin

DARS-MAVZU KONTEKSTI (O'zbekiston ta'lim tizimi):
- Maktab fanlari: Matematika, Algebra, Geometriya, Fizika, Kimyo, Biologiya, Tarix, Geografiya, O'zbek tili va adabiyoti, Rus tili, Ingliz tili, Informatika
- Sinflar: 1-11
- Imtihonlar: DTM, Milliy sertifikat (B1/B2/C1), SAT, Prezident maktablari kirish
- Adabiy mualliflar: Alisher Navoiy, Abdulla Qodiriy, Cho'lpon, Erkin Vohidov, Abdulla Oripov
- Tarixiy shaxslar: Amir Temur, Mirzo Ulug'bek, Bobur, Bahouddin Naqshband
- Geografik joylar: O'zbekiston viloyatlari, Markaziy Osiyo, Amudaryo, Sirdaryo, Tyan-Shan
- O'lchov birliklari: metr, kilogramm, soat, daqiqa (xalqaro SI)`;

const SYSTEM_INSTRUCTION_GENERIC = `Sen tajribali test muallifisan. Berilgan tilda toza grammatika va aniq pedagogik mazmun bilan test savollari tuzasan.`;

function buildPrompt(req: GenerateRequest): string {
  const uz = isUzbek(req.language);
  const system = uz ? SYSTEM_INSTRUCTION_UZ : SYSTEM_INSTRUCTION_GENERIC;

  const typeInstruction =
    req.questionType === "multiple_choice"
      ? "Faqat A/B/C/D variantli (multiple_choice) savollar"
      : req.questionType === "fill_blank"
      ? "Faqat ochiq javobli (fill_blank) savollar — variantsiz"
      : "Aralash: 70% multiple_choice (A/B/C/D), 30% fill_blank";

  const fewShot = uz
    ? `
QUYIDAGI MISOLLAR — O'ZBEK TILIDAGI YAXSHI SAVOLLAR:

Misol 1 (Matematika, MC):
{
  "question_text": "Agar x + 5 = 12 bo'lsa, x ning qiymati qancha?",
  "question_type": "multiple_choice",
  "options": ["5", "7", "12", "17"],
  "correct_answer": "7"
}

Misol 2 (O'zbek adabiyoti, MC):
{
  "question_text": "\\"O'tkan kunlar\\" romanini kim yozgan?",
  "question_type": "multiple_choice",
  "options": ["Cho'lpon", "Abdulla Qodiriy", "Alisher Navoiy", "Oybek"],
  "correct_answer": "Abdulla Qodiriy"
}

Misol 3 (Fizika, fill_blank):
{
  "question_text": "Yorug'likning vakuumdagi tezligini km/s da yozing.",
  "question_type": "fill_blank",
  "correct_answer": "300000"
}

Misol 4 (Tarix, MC):
{
  "question_text": "Amir Temur saltanatining poytaxti qaysi shahar bo'lgan?",
  "question_type": "multiple_choice",
  "options": ["Buxoro", "Toshkent", "Samarqand", "Xiva"],
  "correct_answer": "Samarqand"
}
`
    : "";

  return `${system}

${fewShot}
VAZIFA:
- MAVZU: ${req.topic}
- SAVOLLAR SONI: ${req.count}
- TUR: ${typeInstruction}
- DARAJA: ${req.level || "o'rta"}
- TIL: ${req.language}

JAVOB FORMATI — faqat JSON array, hech qanday qo'shimcha matn, izoh yoki markdown blok yo'q:

[
  {
    "question_text": "...",
    "question_type": "multiple_choice",
    "options": ["...", "...", "...", "..."],
    "correct_answer": "..."
  }
]

QOIDALAR:
1. correct_answer multiple_choice'da options'dan birini AYNAN takrorlashi kerak (probel/punktuatsiya bilan)
2. fill_blank uchun options bo'lmaydi, faqat correct_answer
3. ${req.count} ta savol bo'lsin, ko'p emas, kam emas
4. Variantlar bir-biriga juda o'xshamasin, lekin maqbul "distraktorlar" bo'lsin (xato javoblar ham mantiqan tushunarli)
5. Faktologik savollarda javoblar 100% to'g'ri bo'lsin (yodga emas, manbalarga asoslangan)
6. ${uz ? "O'zbek tili grammatikasi va imlo qoidalariga rioya qiling. Hech qanday rus/ingliz aralashtirilmasin." : "Belgilangan tilda toza grammatika bilan yozing."}
7. Savollar darajaga (${req.level || "o'rta"}) mos qiyinlikda bo'lsin`;
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY o'rnatilmagan. Server adminga murojaat qiling." },
      { status: 500 }
    );
  }

  const body = (await req.json()) as GenerateRequest;
  if (!body.topic || !body.count || body.count < 1 || body.count > 50) {
    return NextResponse.json(
      { error: "Mavzu va savollar soni (1-50) majburiy" },
      { status: 400 }
    );
  }

  // gemini-2.0-flash — eng so'nggi bepul model, o'zbek tilini gemini-1.5'dan yaxshiroq tushunadi
  const model = "gemini-2.0-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(body) }] }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json(
      { error: "AI xizmati xatosi", details: text },
      { status: response.status }
    );
  }

  const data = await response.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!text) {
    return NextResponse.json(
      { error: "AI bo'sh javob qaytardi", raw: data },
      { status: 500 }
    );
  }

  let questions: GeneratedQuestion[];
  try {
    questions = JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI noto'g'ri formatda javob qaytardi", raw: text },
        { status: 500 }
      );
    }
    try {
      questions = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return NextResponse.json(
        { error: "JSON parse xatosi", raw: text },
        { status: 500 }
      );
    }
  }

  if (!Array.isArray(questions)) {
    return NextResponse.json(
      { error: "AI array qaytarmadi", raw: text },
      { status: 500 }
    );
  }

  // Validate each question structure
  questions = questions.filter((q) => {
    if (!q.question_text || !q.correct_answer || !q.question_type) return false;
    if (q.question_type === "multiple_choice") {
      if (!Array.isArray(q.options) || q.options.length < 2) return false;
      if (!q.options.includes(q.correct_answer)) return false;
    }
    return true;
  });

  if (questions.length === 0) {
    return NextResponse.json(
      { error: "AI yaroqsiz savollar qaytardi, qayta urinib ko'ring" },
      { status: 500 }
    );
  }

  return NextResponse.json({ questions });
}
