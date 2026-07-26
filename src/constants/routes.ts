import { SertificateType } from "@/types/sertificate";
import { SATSection, ScoringType, UZDTMSection } from "@/types/test";

const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE || "";
const base = redirectBase || "";

// teacher routes
export const CREATE_TEST_ROUTE = ({
  telegramId,
  scoringType,
  sertificateType,
  satSection,
  uzDtmSection
}:{
  telegramId: number | string,
  scoringType?: ScoringType,
  sertificateType?: SertificateType,
  satSection?: SATSection,
  uzDtmSection?: UZDTMSection
}) => {
  const params = new URLSearchParams();
  if (scoringType) params.set('scoringType', scoringType);
  if (sertificateType) params.set('sertificateType', sertificateType);
  if (satSection) params.set('satSection', satSection);
  if (uzDtmSection) params.set('uzDtmSection', uzDtmSection);
  
  const queryString = params.toString();
  return `${base}/${telegramId.toString()}/teacher/test-form/create${queryString ? `?${queryString}` : ''}`;
};

export const EDIT_TEST_ROUTE = ({
  testId,
  telegramId,
  scoringType,
  sertificateType,
  satSection,
  uzDtmSection
}:{
  testId: string,
  telegramId: number | string,
  scoringType: ScoringType,
  sertificateType?: SertificateType,
  satSection?: SATSection,
  uzDtmSection?: UZDTMSection
}) => {
  const params = new URLSearchParams();
  params.set('scoringType', scoringType);
  if (sertificateType) params.set('sertificateType', sertificateType);
  if (satSection) params.set('satSection', satSection);
  if (uzDtmSection) params.set('uzDtmSection', uzDtmSection);
  
  const queryString = params.toString();
  return `${base}/${telegramId.toString()}/teacher/test-form/edit/${testId}?${queryString}`;
};

export const VIEW_TEST_ROUTE = ({
  testId,
  telegramId,
}:{
  testId: string,
  telegramId: number | string
}) =>
  `${base}/${telegramId.toString()}/teacher/tests/${testId}`;

export const MY_TESTS_ROUTE = (telegramId: number | string) =>
  `${base}/${telegramId.toString()}/teacher/tests`;

export const QUESTION_BANK_ROUTE = (telegramId: number | string) =>
  `${base}/${telegramId.toString()}/teacher/question-bank`;


export const TEST_ATTEMPTS_ROUTE = ({ testId, telegramId }: { testId: string, telegramId: number | string }) => `${base}/${telegramId.toString()}/teacher/tests/${testId}/attempts`;

export const TEST_ATTEMPT_ROUTE = ({ testId, telegramId, submissionId }: { testId: string, telegramId: number | string, submissionId: string }) =>
  `${base}/${telegramId.toString()}/teacher/tests/${testId}/attempts/${submissionId}`;

// student routes
export const TEST_RESULT_ROUTE = (
  submissionId: string,
  telegramId: number | string
) => `${base}/${telegramId.toString()}/student/my-results/${submissionId}`;
export const MY_RESULTS_ROUTE = (telegramId: number | string) =>
  `${base}/${telegramId.toString()}/student/my-results`;
export const TAKE_TEST_ROUTE = (testId: string, telegramId: number | string) =>
  `${base}/${telegramId.toString()}/student/take-test/${testId}`;

// Telegram bot deep-link — opens the bot and auto-sends `/start <testCode>`.
// Ulashish uchun to'g'ridan-to'g'ri web link o'rniga ishlatiladi, chunki faqat
// bot o'quvchining haqiqiy telegram_id sini biladi.
export const TG_BOT_NAME = process.env.NEXT_PUBLIC_TG_BOT_NAME || "test_ease_uz_bot";
export const BOT_TEST_START_LINK = (testCode: string) =>
  `https://t.me/${TG_BOT_NAME}?start=${encodeURIComponent(testCode)}`;

export const CAT_ROUTE = (telegramId: number | string) =>
  `${base}/${telegramId.toString()}/student/cat`;

export const PUBLIC_TESTS_ROUTE = (telegramId: number | string) =>
  `${base}/${telegramId.toString()}/student/public-tests`;
