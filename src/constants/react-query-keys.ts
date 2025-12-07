

export const TEACHER_TESTS_KEY = (telegramId: string) => ["teacher-tests", telegramId];
export const TEACHER_TEST_WITH_QUESTIONS_KEY = (testId: string) => ["teacher-test-with-questions", testId];
export const TEACHER_FULL_SUBMISSIONS_KEY = (testId: string) => ["teacher-full-submissions", testId];
export const TEACHER_FULL_SUBMISSION_KEY = (submissionId: string) => ["teacher-full-submission", submissionId];

export const TAKE_TEST_KEY = (testId: string) => ["take-test", testId];

export const MY_RESULTS_KEY = (telegramId: string) => ["my-results", telegramId];
export const MY_RESULT_KEY = (submissionId: string) => ["my-result", submissionId];