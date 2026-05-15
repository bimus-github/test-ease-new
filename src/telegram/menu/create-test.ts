import { sendTelegramMessage } from "@/telegram/bot";
import { SertificateType } from "@/types/sertificate";
import { sendProductionErrors } from "../notifications/sendProductionErrors";
import { CREATE_TEST_ROUTE } from "@/constants/routes";
import { ScoringType, SATSection, UZDTMSection } from "@/types/test";
import { answerCallbackQuery } from "./callbacks";

// RASCH scoring items (certificate types)
const raschKeyboardItems = [
  { text: "Fizika", type: SertificateType.PHYSICS },
  { text: "Kimyo", type: SertificateType.CHEMISTRY },
  { text: "Biologiya", type: SertificateType.BIOLOGY },
  { text: "Rus tili", type: SertificateType.RUSSIAN },
  {
    text: "Qoraqalpoq tili",
    type: SertificateType.QORAQALPAK,
  },
  { text: "Tarix", type: SertificateType.HISTORY },
  { text: "Geografiya", type: SertificateType.GEOGRAPHY },
  { text: "Matematika", type: SertificateType.MATH },
  {
    text: "Ona tili",
    type: SertificateType.LANGUAGE_AND_LITERATURE,
  },
];

// Milliy sertifikat — Til testlari (B2/C1)
const milliySertifikatKeyboardItems = [
  { text: "🇬🇧 Ingliz tili B2", type: SertificateType.MS_ENGLISH_B2 },
  { text: "🇬🇧 Ingliz tili C1", type: SertificateType.MS_ENGLISH_C1 },
  { text: "🇷🇺 Rus tili B2", type: SertificateType.MS_RUSSIAN_B2 },
  { text: "🇷🇺 Rus tili C1", type: SertificateType.MS_RUSSIAN_C1 },
  { text: "🇩🇪 Nemis tili B2", type: SertificateType.MS_GERMAN_B2 },
  { text: "🇩🇪 Nemis tili C1", type: SertificateType.MS_GERMAN_C1 },
  { text: "🇺🇿 O'zbek tili B2", type: SertificateType.MS_UZBEK_B2 },
  { text: "🇺🇿 O'zbek tili C1", type: SertificateType.MS_UZBEK_C1 },
];

// SAT scoring items
const satKeyboardItems = [
  { text: "Matematika", section: SATSection.MATH },
  { text: "Reading & Writing", section: SATSection.READING_WRITING },
];

// UZ DTM scoring items
const uzDtmKeyboardItems = [
  { text: "Majburiy Fanlar", section: UZDTMSection.ONE_DOT_ONE },
  { text: "2-mutaxassislik fani", section: UZDTMSection.TWO_DOT_ONE },
  { text: "1-mutaxassislik fani", section: UZDTMSection.THREE_DOT_ONE },
];

// Callback data prefixes
export const CALLBACK_PREFIXES = {
  CREATE_TEST_SCORING: "create_test_scoring:",
  CREATE_TEST_RASCH: "create_test_rasch:",
  CREATE_TEST_SAT: "create_test_sat:",
  CREATE_TEST_UZ_DTM: "create_test_uz_dtm:",
  CREATE_TEST_MILLIY: "create_test_milliy:",
  CONFIRM_BROADCAST: "confirm_broadcast:",
  CANCEL_BROADCAST: "cancel_broadcast",
} as const;

/**
 * Show initial menu to choose scoring type
 */
export async function showCreateTestMenu(chatId: number | string) {
  try {
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "📘 Sertifikat UZ",
            callback_data: `${CALLBACK_PREFIXES.CREATE_TEST_SCORING}rasch`,
          },
        ],
        [
          {
            text: "🌐 Milliy sertifikat (B2/C1)",
            callback_data: `${CALLBACK_PREFIXES.CREATE_TEST_SCORING}milliy`,
          },
        ],
        [
          {
            text: "📈 SAT",
            callback_data: `${CALLBACK_PREFIXES.CREATE_TEST_SCORING}sat`,
          },
        ],
        [
          {
            text: "🎓 UZ DTM",
            callback_data: `${CALLBACK_PREFIXES.CREATE_TEST_SCORING}uz_dtm`,
          },
        ],
        [
          {
            text: "📝 Oddiy baholash",
            callback_data: `${CALLBACK_PREFIXES.CREATE_TEST_SCORING}simple`,
          },
        ],
      ],
    };

    return sendTelegramMessage(
      chatId,
      `🧪 Yangi test yarating\n\nQanday usulda yaratmoqchisiz?`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  } catch (error) {
    sendProductionErrors(error, `showCreateTestMenu - chatId: ${chatId}`);
    console.error("Error showing create test menu:", error);
  }
}

/**
 * Show RASCH scoring menu with certificate types
 */
export async function showRaschTestMenu(chatId: number | string) {
  try {
    const keyboard = {
      inline_keyboard: raschKeyboardItems.map((item) => [
        {
          text: item.text,
          web_app: {
            url: CREATE_TEST_ROUTE({
              telegramId: chatId,
              sertificateType: item.type,
              scoringType: ScoringType.RASCH_SCORING,
            }),
          },
        },
      ]),
    };

    return sendTelegramMessage(
      chatId,
      `📘 Sertifikat UZ\n\nQaysi fan bo'yicha test yaratmoqchisiz?`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  } catch (error) {
    sendProductionErrors(error, `showRaschTestMenu - chatId: ${chatId}`);
    console.error("Error showing RASCH test menu:", error);
  }
}

/**
 * Show Milliy Sertifikat menu (B2/C1 language tests)
 */
export async function showMilliySertifikatMenu(chatId: number | string) {
  try {
    const keyboard = {
      inline_keyboard: milliySertifikatKeyboardItems.map((item) => [
        {
          text: item.text,
          web_app: {
            url: CREATE_TEST_ROUTE({
              telegramId: chatId,
              sertificateType: item.type,
              scoringType: ScoringType.RASCH_SCORING,
            }),
          },
        },
      ]),
    };

    return sendTelegramMessage(
      chatId,
      `🌐 Milliy sertifikat\n\nQaysi til va daraja bo'yicha test yaratmoqchisiz?\n\n💡 Listening qismi uchun "Asosiy ma'lumotlar" bo'limida umumiy audio yuklash mumkin.`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  } catch (error) {
    sendProductionErrors(error, `showMilliySertifikatMenu - chatId: ${chatId}`);
    console.error("Error showing Milliy Sertifikat menu:", error);
  }
}

/**
 * Show SAT scoring menu with sections
 */
export async function showSATTestMenu(chatId: number | string) {
  try {
    const keyboard = {
      inline_keyboard: satKeyboardItems.map((item) => [
        {
          text: item.text,
          web_app: {
            url: CREATE_TEST_ROUTE({
              telegramId: chatId,
              satSection: item.section,
              scoringType: ScoringType.SAT_SCORING,
            }),
          },
        },
      ]),
    };

    return sendTelegramMessage(
      chatId,
      `📈 SAT\n\nQaysi bo'lim bo'yicha test yaratmoqchisiz?`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  } catch (error) {
    sendProductionErrors(error, `showSATTestMenu - chatId: ${chatId}`);
    console.error("Error showing SAT test menu:", error);
  }
}

/**
 * Show UZ DTM scoring menu with sections
 */
export async function showUZDTMTestMenu(chatId: number | string) {
  try {
    const keyboard = {
      inline_keyboard: uzDtmKeyboardItems.map((item) => [
        {
          text: item.text,
          web_app: {
            url: CREATE_TEST_ROUTE({
              telegramId: chatId,
              uzDtmSection: item.section,
              scoringType: ScoringType.UZ_DTM,
            }),
          },
        },
      ]),
    };

    return sendTelegramMessage(
      chatId,
      `🎓 UZ DTM\n\nQaysi bo'lim bo'yicha test yaratmoqchisiz?`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  } catch (error) {
    sendProductionErrors(error, `showUZDTMTestMenu - chatId: ${chatId}`);
    console.error("Error showing UZ DTM test menu:", error);
  }
}

/**
 * Show Simple scoring menu (direct link, no sub-options)
 */
export async function showSimpleTestMenu(chatId: number | string) {
  try {
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "📝 Test yaratish",
            web_app: {
              url: CREATE_TEST_ROUTE({
                telegramId: chatId,
                scoringType: ScoringType.SIMPLE_SCORING,
              }),
            },
          },
        ],
      ],
    };

    return sendTelegramMessage(
      chatId,
      `📝 Oddiy baholash\n\nOddiy baholash testini yaratish uchun quyidagi tugmani bosing.`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  } catch (error) {
    sendProductionErrors(error, `showSimpleTestMenu - chatId: ${chatId}`);
    console.error("Error showing Simple test menu:", error);
  }
}

/**
 * Handle callback query for scoring type selection
 */
export async function handleCreateTestCallback(
  chatId: number | string,
  callbackQueryId: string,
  callbackData: string
) {
  try {
    // Answer the callback query first
    await answerCallbackQuery(callbackQueryId);

    // Parse the callback data
    if (callbackData.startsWith(CALLBACK_PREFIXES.CREATE_TEST_SCORING)) {
      const scoringType = callbackData.split(":")[1];
      
      if (scoringType === "rasch") {
        await showRaschTestMenu(chatId);
      } else if (scoringType === "milliy") {
        await showMilliySertifikatMenu(chatId);
      } else if (scoringType === "sat") {
        await showSATTestMenu(chatId);
      } else if (scoringType === "uz_dtm") {
        await showUZDTMTestMenu(chatId);
      } else if (scoringType === "simple") {
        await showSimpleTestMenu(chatId);
      }
    }
  } catch (error) {
    sendProductionErrors(
      error,
      `handleCreateTestCallback - chatId: ${chatId}, callbackData: ${callbackData}`
    );
    console.error("Error handling create test callback:", error);
  }
}
