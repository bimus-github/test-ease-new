import { Question } from "./question";
import { SertificateType } from "./sertificate";

export enum TestStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum ScoringType {
  SIMPLE_SCORING = "simple_scoring", // 1 point for each correct answer
  RASCH_SCORING = "rasch_scoring", // Rasch scoring model
}

export interface Test {
  id: string;
  code: string;
  title: string;
  description?: string;
  instructions?: string;
  end_date?: string;
  status: TestStatus;
  scoring_type: ScoringType;
  teacher_id: string; // TGUser's telegram_id
  created_at: string;
  updated_at: string;
  sertificate_type?: SertificateType;
  isRaschCalculated?: boolean;
  rasch_calculated_at?: string;
}

export interface TestWithQuestions extends Test {
  questions: Question[];
}

export interface TestForm
  extends Omit<Test, "id" | "created_at" | "updated_at"> {}
