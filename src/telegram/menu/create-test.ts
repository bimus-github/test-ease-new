import { CREATE_SERTICATE } from "@/constants/routes";
import { sendTelegramMessage } from "@/telegram/bot";
import { SertificateType } from "@/types/sertificate";
import { sendProductionErrors } from "../notifications/sendProductionErrors";

const keyboardItems = [
  { text: "📘 Sertifikat UZ: Fizika", type: SertificateType.PHYSICS },
  { text: "📘 Sertifikat UZ: Kimyo", type: SertificateType.CHEMISTRY },
  { text: "📘 Sertifikat UZ: Biologiya", type: SertificateType.BIOLOGY },
  { text: "📘 Sertifikat UZ: Rus tili", type: SertificateType.RUSSIAN },
  {
    text: "📘 Sertifikat UZ: Qoraqalpoq tili",
    type: SertificateType.QORAQALPAK,
  },
  { text: "📘 Sertifikat UZ: Tarix", type: SertificateType.HISTORY },
  { text: "📘 Sertifikat UZ: Geografiya", type: SertificateType.GEOGRAPHY },
  { text: "📘 Sertifikat UZ: Matematika", type: SertificateType.MATH },
  {
    text: "📘 Sertifikat UZ: Ona tili",
    type: SertificateType.LANGUAGE_AND_LITERATURE,
  },
];

export async function showCreateTestMenu(chatId: number | string) {
  try {
    const keyboard = {
      inline_keyboard: keyboardItems.map((item) => [
        {
          text: item.text,
          web_app: { url: CREATE_SERTICATE(chatId, item.type) },
        },
      ]),
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
