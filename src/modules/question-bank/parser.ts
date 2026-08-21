import type { Question, QuestionAnswerKey, QuestionOption, QuestionSet } from "./types";

const QUESTION_HEADING = /^##\s+(Q\d{3})\s*$/gm;
const OPTION_LINE = /^([A-H])\.\s+(.+?)(?:\s{2})?$/gm;

function asAnswerKey(value: string): QuestionAnswerKey {
  if (!/^[A-H]$/.test(value)) throw new Error(`Unsupported answer key: ${value}`);
  return value as QuestionAnswerKey;
}

function cleanExplanation(details: string): string {
  return details
    .replace(/^<details><summary>[^<]*<\/summary>\s*/i, "")
    .replace(/<\/details>[\s\S]*$/i, "")
    .replace(/\*\*정답:\s*[A-H]\*\*/i, "")
    .replace(/^\s*[—-]\s*/, "")
    .trim();
}

export function parseQuestionSetMarkdown(input: {
  slug: string;
  path: string;
  provider: string;
  sourceUrl: string;
  markdown: string;
}): QuestionSet {
  const title = input.markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? input.slug;
  const matches = [...input.markdown.matchAll(QUESTION_HEADING)];
  const questions: Question[] = [];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const id = match[1];
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? input.markdown.length;
    const section = input.markdown.slice(start, end).trim();
    const detailsIndex = section.indexOf("<details>");

    if (detailsIndex < 0) throw new Error(`${input.slug}/${id}: answer details not found`);

    const questionBody = section.slice(0, detailsIndex).trim();
    const detailsBody = section.slice(detailsIndex);
    const optionMatches = [...questionBody.matchAll(OPTION_LINE)];

    if (optionMatches.length < 2) throw new Error(`${input.slug}/${id}: at least two options required`);

    const firstOptionIndex = optionMatches[0].index ?? questionBody.length;
    const prompt = questionBody.slice(0, firstOptionIndex).trim();
    const options: QuestionOption[] = optionMatches.map((option) => ({
      key: asAnswerKey(option[1]),
      text: option[2].trim(),
    }));
    const answerMatch = detailsBody.match(/\*\*정답:\s*([A-H])\*\*/i);

    if (!answerMatch) throw new Error(`${input.slug}/${id}: correct answer not found`);

    const correctAnswer = asAnswerKey(answerMatch[1].toUpperCase());
    if (!options.some((option) => option.key === correctAnswer)) {
      throw new Error(`${input.slug}/${id}: correct answer ${correctAnswer} is not an option`);
    }

    questions.push({
      id,
      prompt,
      options,
      correctAnswer,
      explanation: cleanExplanation(detailsBody),
    });
  }

  if (!questions.length) throw new Error(`${input.slug}: no questions parsed`);

  return {
    slug: input.slug,
    code: input.slug.split("-")[0] ?? input.slug,
    title,
    path: input.path,
    provider: input.provider,
    sourceUrl: input.sourceUrl,
    questions,
  };
}
