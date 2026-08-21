export type QuestionAnswerKey = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export interface QuestionOption {
  key: QuestionAnswerKey;
  text: string;
}

export interface Question {
  id: string;
  prompt: string;
  options: QuestionOption[];
  correctAnswer: QuestionAnswerKey;
  explanation: string;
}

export interface PublicQuestion {
  id: string;
  prompt: string;
  options: QuestionOption[];
}

export interface QuestionSet {
  slug: string;
  code: string;
  title: string;
  path: string;
  provider: string;
  sourceUrl: string;
  questions: Question[];
}

export interface QuestionSetSummary {
  slug: string;
  code: string;
  title: string;
  questionCount: number;
  firstQuestionId: string;
  lastQuestionId: string;
}
