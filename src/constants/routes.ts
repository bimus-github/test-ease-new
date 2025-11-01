import { SertificateType } from "@/types/sertificate";

const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE || "";
const base = redirectBase || "";

export const CREATE_MATH_SERTIFICATE_UZ_ROUTE = (telegramId: number | string) =>
  `${base}/${telegramId.toString()}/test/create/sertificate/math`;
export const VIEW_TEST_ROUTE = (testId: string, telegramId: number | string) =>
  `${base}/${telegramId.toString()}/view-test/${testId}`;
export const MY_TESTS_ROUTE = (telegramId: number | string) =>
  `${base}/${telegramId.toString()}/my-tests`;
export const TAKE_TEST_ROUTE = (testId: string, telegramId: number | string) =>
  `${base}/${telegramId.toString()}/take/${testId}`;
export const EDIT_TEST_ROUTE = (testId: string, telegramId: number | string) =>
  `${base}/${telegramId.toString()}/edit/${testId}`;
export const TEST_RESULT_ROUTE = (
  attemptId: string,
  telegramId: number | string
) => `${base}/${telegramId.toString()}/result/${attemptId}`;
export const MY_RESULTS_ROUTE = (telegramId: number | string) =>
  `${base}/${telegramId.toString()}/my-results`;
export const CREATE_SERTICATE = (
  telegramId: number | string,
  sertificateType: SertificateType
) =>
  `${base}/${telegramId.toString()}/test/create-sertificate/${sertificateType}`;
