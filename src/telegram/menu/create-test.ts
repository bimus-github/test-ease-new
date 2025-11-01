import { CREATE_SERTICATE } from "@/constants/routes";
import { sendTelegramMessage } from "@/telegram/bot";
import { SertificateType } from "@/types/sertificate";

export async function showCreateTestMenu(chatId: number | string) {
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "📘 Sertifikat UZ: Matematika",
          web_app: {
            url: CREATE_SERTICATE(chatId, SertificateType.MATH),
          },
        },
      ],
      [
        {
          text: "📘 Sertifikat UZ: Fizika",
          web_app: {
            url: CREATE_SERTICATE(chatId, SertificateType.PHYSICS),
          },
        },
      ],
      [
        {
          text: "📘 Sertifikat UZ: Gergafiya",
          web_app: {
            url: CREATE_SERTICATE(chatId, SertificateType.GEOGRAPHY),
          },
        },
      ],
      [
        {
          text: "📘 Sertifikat UZ: Kimyo",
          web_app: {
            url: CREATE_SERTICATE(chatId, SertificateType.CHEMISTRY),
          },
        },
      ],
      [
        {
          text: "📘 Sertifikat UZ: Biologiya",
          web_app: {
            url: CREATE_SERTICATE(chatId, SertificateType.BIOLOGY),
          },
        },
      ],
      [
        {
          text: "📘 Sertifikat UZ: Rus tili",
          web_app: {
            url: CREATE_SERTICATE(chatId, SertificateType.RUSSIAN),
          },
        },
      ],
      [
        {
          text: "📘 Sertifikat UZ: Qoraqalpoq tili",
          web_app: {
            url: CREATE_SERTICATE(chatId, SertificateType.QORAQALPAK),
          },
        },
      ],
      [
        {
          text: "📘 Sertifikat UZ: Tarix",
          web_app: {
            url: CREATE_SERTICATE(chatId, SertificateType.HISTORY),
          },
        },
      ],
      [
        {
          text: "📘 Sertifikat UZ: Geografiya",
          web_app: {
            url: CREATE_SERTICATE(chatId, SertificateType.GEOGRAPHY),
          },
        },
      ],
      [
        {
          text: "📘 Sertifikat UZ: Qoraqalpoq tili",
          web_app: {
            url: CREATE_SERTICATE(chatId, SertificateType.QORAQALPAK),
          },
        },
      ],
    ],
  };

  return sendTelegramMessage(
    chatId,
    `🧪 Yangi test yarating\n\nQanday usulda yaratmoqchisiz?`,
    { parse_mode: "Markdown", reply_markup: keyboard }
  );
}
