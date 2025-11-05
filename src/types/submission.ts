import { Question } from "./question";
import { Test } from "./test";
import { TGUser } from "./tg-user";

export interface Answer {
  question_id: string;
  answer?: string; // Multiple choice, true/false, fill in the blank
  answer_options?: string[]; // Multiple answer
}

export interface Submission {
  id: string;
  user_tg_id: string;
  test_id: string;
  started_at: string;
  submitted_at?: string;
  rasch_score?: number; // Rasch scoring only
  rasch_ability?: number; // Rasch scoring only
  created_at: string;
  updated_at: string;
  answers: Answer[];
}

export interface FullSubmission
  extends Omit<Submission, "user_tg_id" | "test_id"> {
  test: Test;
  user: TGUser;
  questions: Question[];
  row_score?: number;
}

export interface SubmissionForm
  extends Omit<Submission, "id" | "created_at" | "updated_at" | "answers"> {}
