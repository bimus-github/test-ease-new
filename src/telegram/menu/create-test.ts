import { sendTelegramMessage } from "@/telegram/bot";
import { SertificateType } from "@/types/sertificate";
import { sendProductionErrors } from "../notifications/sendProductionErrors";
import { CREATE_TEST_ROUTE } from "@/constants/routes";
import { ScoringType, SATSection } from "@/types/test";
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

// SAT scoring items
const satKeyboardItems = [
  { text: "Matematika", section: SATSection.MATH },
  { text: "Reading & Writing", section: SATSection.READING_WRITING },
];

// Callback data prefixes
export const CALLBACK_PREFIXES = {
  CREATE_TEST_SCORING: "create_test_scoring:",
  CREATE_TEST_RASCH: "create_test_rasch:",
  CREATE_TEST_SAT: "create_test_sat:",
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
            text: "📈 SAT",
            callback_data: `${CALLBACK_PREFIXES.CREATE_TEST_SCORING}sat`,
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
      } else if (scoringType === "sat") {
        await showSATTestMenu(chatId);
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
