"use server";

import {
  listPublicTests,
  getTestLeaderboard,
} from "@/dbs/public-tests-servers";

export async function listPublicTestsAction(search?: string, scoringType?: string) {
  return listPublicTests({ search, scoringType, limit: 100 });
}

export async function getLeaderboardAction(testId: string) {
  return getTestLeaderboard(testId, 10);
}
