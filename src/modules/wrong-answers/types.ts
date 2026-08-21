export const ERROR_CODES = ["CONCEPT", "COMPARE", "READING", "MEMORY", "PRACTICE", "SCOPE"] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];
export type WrongAnswerPriority = "HIGH" | "MEDIUM" | "LOW";
export type WrongAnswerStatus = "OPEN" | "CLOSED";
export type RetryStage = "DAY_1" | "DAY_7" | "CLOSED";

export interface WrongAnswerSummary {
  id: string;
  courseSlug: string;
  setSlug: string;
  questionId: string;
  errorCode: ErrorCode | null;
  priority: WrongAnswerPriority;
  status: WrongAnswerStatus;
  retryStage: RetryStage;
  wrongCount: number;
  correctRetryCount: number;
  nextRetryAt: string | null;
}
