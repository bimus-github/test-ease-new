"use server";
import { AttemptStatus } from "@/types/attempt";
import { getAttemptsByUserId } from "@/dbs/attempt-servers";

export interface MyResultItem {
  attempt_id: string;
  status: AttemptStatus;
  started_at: string;
  submitted_at?: string;
  score?: number | null;
  test_id: string;
  test_title: string;
  test_code: string;
  question_count: number;
  answered_count: number;
}

export interface MyResultsResponse {
  items: MyResultItem[];
  nextCursor?: string | null;
}

export async function getMyResultsAction(
  telegramId: string,
  params?: {
    status?: AttemptStatus | "all";
    q?: string;
    cursor?: string | null;
    limit?: number;
  }
): Promise<MyResultsResponse> {
  const { status = "all", q = "", cursor = null, limit = 20 } = params || {};

  // Use server to fetch full attempts (with test and answers)
  // Note: getAttemptsByUserId does not support cursor; we emulate simple paging
  const take = limit;
  const attempts = await getAttemptsByUserId(telegramId, take);

  // Map to lean items
  let items: MyResultItem[] = (attempts || []).map((a) => ({
    attempt_id: a.id,
    status: a.status,
    started_at: a.started_at,
    submitted_at: a.submitted_at,
    score: a.score,
    test_id: a.test.id,
    test_title: a.test.title,
    test_code: a.test.code,
    question_count: a.answers.length, // using loaded answers length as total proxy
    answered_count: a.answers.length,
  }));

  if (status !== "all") {
    items = items.filter((it) => it.status === status);
  }

  if (q) {
    const qq = q.toLowerCase();
    items = items.filter(
      (it) =>
        it.test_title?.toLowerCase().includes(qq) ||
        it.test_code?.toLowerCase().includes(qq)
    );
  }

  // No real cursor from server util; mark no more for now
  return { items, nextCursor: null };
}
