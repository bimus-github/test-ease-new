import { SertificateType } from "@/types/sertificate";

const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE || "";
const base = redirectBase || "";

// teacher routes
export const CREATE_SERTICATE = (
  telegramId: number | string,
  sertificateType: SertificateType
) =>
  `${base}/${telegramId.toString()}/test/create-sertificate/${sertificateType}`;
export const VIEW_TEST_ROUTE = (testId: string, telegramId: number | string) =>
  `${base}/${telegramId.toString()}/view-test/${testId}`;
export const MY_TESTS_ROUTE = (telegramId: number | string) =>
  `${base}/${telegramId.toString()}/my-tests`;
export const EDIT_TEST_ROUTE = (testId: string, telegramId: number | string) =>
  `${base}/${telegramId.toString()}/edit/${testId}`;
export const TEST_ATTEMPTS_ROUTE = (
  testId: string,
  telegramId: number | string
) => `${base}/${telegramId.toString()}/view-test/${testId}/attempts`;
export const TEST_ATTEMPT_ROUTE = (
  telegramId: number | string,
  testId: string,
  submissionId: string
) =>
  `${base}/${telegramId.toString()}/view-test/${testId}/attempts/${submissionId}`;

// student routes
export const TEST_RESULT_ROUTE = (
  submissionId: string,
  telegramId: number | string
) => `${base}/${telegramId.toString()}/my-results/${submissionId}`;
export const MY_RESULTS_ROUTE = (telegramId: number | string) =>
  `${base}/${telegramId.toString()}/my-results`;
export const TAKE_TEST_ROUTE = (testId: string, telegramId: number | string) =>
  `${base}/${telegramId.toString()}/take/${testId}`;
