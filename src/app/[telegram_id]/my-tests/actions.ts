"use server";
import { getTestsByTeacher, updateExpiredTests } from "@/dbs/test-servers";

/**
 * Update expired tests (sets status to inactive if end_date has passed)
 * This is automatically called before fetching tests, but can be called manually if needed
 * @returns Number of updated tests
 */
export async function updateExpiredTestsAction(): Promise<number> {
  return await updateExpiredTests();
}

export async function getTestsByTeacherAction(
  telegramId: string,
  page: number = 0,
  limit: number = 50
) {
  const tests = await getTestsByTeacher(telegramId, page, limit);
  return tests;
}
