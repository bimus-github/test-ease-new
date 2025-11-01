import { Answer, AnswerWithQuestion } from "./answer";
import { Test } from "./test";
import { TGUser } from "./tg-user";

export enum AttemptStatus {
  STARTED = "started",
  SUBMITTED = "submitted",
}

export interface TestAttempt {
  id: string;
  test_id: string; // Test's id
  user_id: string; // TGUser's telegram_id
  status: AttemptStatus;
  started_at: string;
  submitted_at?: string;
  score?: number;
  created_at: string;
  updated_at: string;
}

export interface AttemptForm
  extends Omit<TestAttempt, "id" | "created_at" | "updated_at"> {}

export interface AttemptFull extends TestAttempt {
  answers: AnswerWithQuestion[];
  test: Test;
  user: TGUser;
}
