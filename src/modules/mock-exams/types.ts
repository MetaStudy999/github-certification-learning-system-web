export type MockJudgment = "EXAM-READY" | "READY" | "REVIEW" | "NOT READY";

export interface MockOption {
  key: string;
  text: string;
}

export interface MockQuestion {
  id: string;
  prompt: string;
  options: MockOption[];
  correctAnswer: string;
  explanation: string;
}

export interface PublicMockQuestion {
  id: string;
  prompt: string;
  options: MockOption[];
}

export interface MockExamDefinition {
  slug: string;
  code: string;
  title: string;
  role: "DIAGNOSTIC" | "GATE" | "FINAL";
  recommendedMinutes: number;
  targetPercent: number;
  provider: string;
  questionsSourceUrl: string;
  answersSourceUrl: string;
  questions: MockQuestion[];
}

export interface MockAttemptSummary {
  id: string;
  mockSlug: string;
  scorePercent: number;
  correctAnswers: number;
  totalQuestions: number;
  judgment: MockJudgment;
  elapsedSeconds: number;
  submittedAt: string;
}
