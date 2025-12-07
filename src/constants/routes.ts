import { SertificateType } from "@/types/sertificate";
import { SATSection, ScoringType } from "@/types/test";

const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE || "";
const base = redirectBase || "";

// teacher routes
export const CREATE_TEST_ROUTE = ({
  telegramId,
  scoringType,
  sertificateType,
  satSection
}:{
  telegramId: number | string,
  scoringType?: ScoringType,
  sertificateType?: SertificateType,
  satSection?: SATSection  
}) =>
  `${base}/${telegramId.toString()}/teacher/test-form/create?scoringType=${scoringType}&sertificateType=${sertificateType}&satSection=${satSection}`;

export const EDIT_TEST_ROUTE = ({
  testId,
  telegramId,
  scoringType,
  sertificateType,
  satSection
}:{
  testId: string,
  telegramId: number | string,
  scoringType: ScoringType,
  sertificateType?: SertificateType,
  satSection?: SATSection
}) =>
  `${base}/${telegramId.toString()}/teacher/test-form/edit/${testId}?scoringType=${scoringType}&sertificateType=${sertificateType}&satSection=${satSection}`;

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
