import type { MockQuestion } from "@/modules/mock-exams/types";

function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

export function parseMockQuestions(markdown: string): Array<Omit<MockQuestion, "correctAnswer" | "explanation">> {
  const normalized = normalize(markdown);
  const heading = /^###\s+문제\s+(\d{2})\s+\(Question\s+\d{2},\s*Q(\d{2})\)\s*$/gm;
  const matches = [...normalized.matchAll(heading)];

  return matches.map((match, index) => {
    const number = match[2];
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? normalized.length : normalized.length;
    const block = normalized.slice(start, end).trim();
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const optionStart = lines.findIndex((line) => /^[A-H]\.\s+/.test(line));
    if (optionStart < 1) throw new Error(`Mock Q${number} has no options`);

    const prompt = lines.slice(0, optionStart).join("\n");
    const options = lines.slice(optionStart).map((line) => {
      const option = line.match(/^([A-H])\.\s+(.+)$/);
      if (!option) throw new Error(`Mock Q${number} has invalid option: ${line}`);
      return { key: option[1], text: option[2] };
    });

    return { id: `Q${number}`, prompt, options };
  });
}

export function parseMockAnswers(markdown: string): Map<string, { correctAnswer: string; explanation: string }> {
  const answers = new Map<string, { correctAnswer: string; explanation: string }>();
  for (const line of normalize(markdown).split("\n")) {
    const row = line.match(/^\|\s*(\d{2})\s*\|\s*([A-H])\s*\|\s*(.*?)\s*\|$/);
    if (!row) continue;
    answers.set(`Q${row[1]}`, { correctAnswer: row[2], explanation: row[3] });
  }
  return answers;
}

export function combineMockQuestions(questionMarkdown: string, answerMarkdown: string): MockQuestion[] {
  const questions = parseMockQuestions(questionMarkdown);
  const answers = parseMockAnswers(answerMarkdown);
  return questions.map((question) => {
    const answer = answers.get(question.id);
    if (!answer) throw new Error(`Missing answer for ${question.id}`);
    return { ...question, ...answer };
  });
}
