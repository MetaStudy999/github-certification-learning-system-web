import { ContentNotFoundError } from "@/modules/content/core/provider";
import { createContentProvider } from "@/modules/content/provider-factory";

import { parseQuestionSetMarkdown } from "./parser";
import type { PublicQuestion, Question, QuestionSet, QuestionSetSummary } from "./types";

const QUESTION_BANK_MODULE = "080-question-bank";
const SUPPORTED_COURSES = new Set(["001-foundations"]);

function rootFor(courseSlug: string): string {
  if (!SUPPORTED_COURSES.has(courseSlug)) throw new ContentNotFoundError(`Question bank course not found: ${courseSlug}`);
  return `${courseSlug}/${QUESTION_BANK_MODULE}`;
}

export async function getQuestionSet(courseSlug: string, setSlug: string): Promise<QuestionSet> {
  const provider = createContentProvider();
  const root = rootFor(courseSlug);
  const entries = await provider.list(root);
  const found = entries.find((entry) => entry.type === "directory" && entry.name === setSlug);
  if (!found) throw new ContentNotFoundError(`Question set not found: ${courseSlug}/${setSlug}`);

  const sourcePath = `${root}/${setSlug}/README.md`;
  const document = await provider.readText(sourcePath);
  return parseQuestionSetMarkdown({
    slug: setSlug,
    path: sourcePath,
    provider: document.provider,
    sourceUrl: document.sourceUrl,
    markdown: document.content,
  });
}

export async function listQuestionSets(courseSlug: string): Promise<QuestionSet[]> {
  const provider = createContentProvider();
  const root = rootFor(courseSlug);
  const entries = await provider.list(root);
  const setEntries = entries
    .filter((entry) => entry.type === "directory" && /^\d{3}-/.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));

  return Promise.all(setEntries.map(async (entry) => {
    const sourcePath = `${root}/${entry.name}/README.md`;
    const document = await provider.readText(sourcePath);
    return parseQuestionSetMarkdown({
      slug: entry.name,
      path: sourcePath,
      provider: document.provider,
      sourceUrl: document.sourceUrl,
      markdown: document.content,
    });
  }));
}

export async function getQuestionBankCatalog(courseSlug: string): Promise<{
  provider: string;
  sets: QuestionSetSummary[];
  totalQuestions: number;
}> {
  const sets = await listQuestionSets(courseSlug);
  return {
    provider: sets[0]?.provider ?? createContentProvider().id,
    sets: sets.map((set) => ({
      slug: set.slug,
      code: set.code,
      title: set.title,
      questionCount: set.questions.length,
      firstQuestionId: set.questions[0].id,
      lastQuestionId: set.questions.at(-1)?.id ?? set.questions[0].id,
    })),
    totalQuestions: sets.reduce((sum, set) => sum + set.questions.length, 0),
  };
}

export async function getQuestion(courseSlug: string, setSlug: string, questionId: string): Promise<Question> {
  const set = await getQuestionSet(courseSlug, setSlug);
  const question = set.questions.find((item) => item.id === questionId);
  if (!question) throw new ContentNotFoundError(`Question not found: ${courseSlug}/${setSlug}/${questionId}`);
  return question;
}

export function toPublicQuestion(question: Question): PublicQuestion {
  return { id: question.id, prompt: question.prompt, options: question.options };
}
