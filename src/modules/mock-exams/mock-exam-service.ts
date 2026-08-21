import { ContentNotFoundError } from "@/modules/content/core/provider";
import { createContentProvider } from "@/modules/content/provider-factory";
import { combineMockQuestions } from "@/modules/mock-exams/parser";
import type { MockExamDefinition, MockJudgment, PublicMockQuestion } from "@/modules/mock-exams/types";

const COURSE = "001-foundations";
const ROOT = `${COURSE}/110-mock-exams`;

const MOCKS = [
  { slug: "010-mock-01", code: "010", title: "Mock Exam 01", role: "DIAGNOSTIC", recommendedMinutes: 60, targetPercent: 85 },
  { slug: "020-mock-02", code: "020", title: "Mock Exam 02", role: "GATE", recommendedMinutes: 60, targetPercent: 85 },
  { slug: "030-final-mock", code: "030", title: "Final Mock", role: "FINAL", recommendedMinutes: 60, targetPercent: 90 },
] as const;

export function listMockMetadata() {
  return MOCKS;
}

export async function getMockExam(courseSlug: string, mockSlug: string): Promise<MockExamDefinition> {
  if (courseSlug !== COURSE) throw new ContentNotFoundError(`Unsupported mock course: ${courseSlug}`);
  const metadata = MOCKS.find((mock) => mock.slug === mockSlug);
  if (!metadata) throw new ContentNotFoundError(`Mock exam not found: ${mockSlug}`);

  const provider = createContentProvider();
  const [questionDocument, answerDocument] = await Promise.all([
    provider.readText(`${ROOT}/${mockSlug}/questions.md`),
    provider.readText(`${ROOT}/${mockSlug}/answers.md`),
  ]);
  const questions = combineMockQuestions(questionDocument.content, answerDocument.content);
  if (questions.length !== 40) throw new Error(`${mockSlug} expected 40 questions; got ${questions.length}`);

  return {
    ...metadata,
    role: metadata.role,
    provider: provider.id,
    questionsSourceUrl: questionDocument.sourceUrl,
    answersSourceUrl: answerDocument.sourceUrl,
    questions,
  };
}

export async function getAllMockExams(courseSlug: string): Promise<MockExamDefinition[]> {
  return Promise.all(MOCKS.map((mock) => getMockExam(courseSlug, mock.slug)));
}

export function toPublicMockQuestion(question: MockExamDefinition["questions"][number]): PublicMockQuestion {
  return { id: question.id, prompt: question.prompt, options: question.options };
}

export function judgeMock(scorePercent: number): MockJudgment {
  if (scorePercent >= 90) return "EXAM-READY";
  if (scorePercent >= 85) return "READY";
  if (scorePercent >= 75) return "REVIEW";
  return "NOT READY";
}
