import { Question } from "./question";
import { SertificateType } from "./sertificate";

export enum TestStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum ScoringType {
  SIMPLE_SCORING = "simple_scoring", // 1 point for each correct answer
  RASCH_SCORING = "rasch_scoring", // Rasch scoring model
  SAT_SCORING = "sat_scoring", // SAT scoring model
  UZ_DTM = "uz_dtm", // UZ DTM scoring model
}

export enum SATSection {
  MATH = "math",
  READING_WRITING = "reading_writing",
}

export enum UZDTMSection {
  ONE_DOT_ONE = "Majburiy Fanlar",
  TWO_DOT_ONE = "2-mutaxassislik fani",
  THREE_DOT_ONE = "1-mutaxassislik fani",
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
  sat_section?: SATSection;
  uz_dtm_section?: UZDTMSection;
  isRaschCalculated?: boolean;
  rasch_calculated_at?: string;

}

export interface TestWithQuestions extends Test {
  questions: Question[];
}

export interface TestForm
  extends Omit<Test, "id" | "created_at" | "updated_at"> {}

export interface TestStats {
  total_tests: number; // Total number of tests
  total_active_tests: number; // Total number of active tests
  total_inactive_tests: number; // Total number of inactive tests
  new_tests_today: number; // Total number of new tests today
  new_tests_week: number; // Total number of new tests in the last 7 days
  avg_tests_since_start: number; // Average number of tests per day since the user started using the bot
}
