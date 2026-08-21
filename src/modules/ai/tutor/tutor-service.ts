import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/config/env";
import { createAIProvider } from "@/modules/ai/provider-factory";
import { getQuestion } from "@/modules/question-bank/question-bank-service";
import type { Question } from "@/modules/question-bank/types";
import type { TutorResponse, TutorStage } from "./types";

interface LatestAttempt {
  selected_answer: string;
  is_correct: boolean;
  attempted_at: string;
}

export class TutorAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TutorAccessError";
  }
}

function questionText(question: Question, includeOptions: boolean): string {
  if (!includeOptions) return `문제:\n${question.prompt}`;
  const options = question.options.map((option) => `${option.key}. ${option.text}`).join("\n");
  return `문제:\n${question.prompt}\n\n선택지:\n${options}`;
}

function buildPrompt(stage: TutorStage, question: Question, latestAttempt: LatestAttempt | null): string {
  const preAnswer = stage !== "EXPLANATION";
  const base = [
    `[GCLS_TUTOR_STAGE:${stage}]`,
    "당신은 GCLS(GitHub Certification Learning System)의 학습 튜터입니다.",
    "한국어로 쉽고 짧게 설명하고, 필요한 기술 용어는 영어 원문을 함께 표기하세요.",
    "AI는 채점하지 않습니다. 정답 판정은 별도의 Source-backed Rule Engine이 담당합니다.",
    questionText(question, !preAnswer),
  ];

  if (stage === "HINT") {
    return [...base,
      "선택지는 제공되지 않았습니다. 학습자가 스스로 풀 수 있도록 문제 본문에서 핵심 단서 1~2개만 찾아 주세요.",
      "원문 문제의 정답 문자, 정답 선택지 문구, 직접적인 정답 선언은 절대 공개하지 마세요.",
    ].join("\n\n");
  }

  if (stage === "CONCEPT") {
    return [...base,
      "선택지는 제공되지 않았습니다. 이 문제를 풀기 위해 반드시 이해해야 할 핵심 개념을 설명하세요.",
      "유사 개념과의 차이를 설명하되 원문 문제의 정답을 직접 선언하지 마세요.",
    ].join("\n\n");
  }

  if (stage === "SIMILAR_EXAMPLE") {
    return [...base,
      "선택지는 제공되지 않았습니다. 원문과 답이 직접 연결되지 않는 새로운 유사 상황 예제를 하나 만드세요.",
      "예제의 사고 과정을 설명하되 원문 문제의 정답을 직접 선언하지 마세요.",
      "마지막에는 '이제 원래 문제를 다시 풀어보세요.'라고 안내하세요.",
    ].join("\n\n");
  }

  if (!latestAttempt) throw new TutorAccessError("EXPLANATION requires at least one submitted attempt");

  return [...base,
    `학습자의 최근 선택: ${latestAttempt.selected_answer}`,
    `최근 결과: ${latestAttempt.is_correct ? "정답" : "오답"}`,
    `Source of Truth 정답: ${question.correctAnswer}`,
    `Source of Truth 해설: ${question.explanation}`,
    "이제 정답을 공개해도 됩니다. 왜 이 답이 맞는지, 다른 선택지는 왜 덜 적절한지 단계별로 설명하세요.",
    "마지막에 기억해야 할 한 문장 요약을 제공하세요.",
  ].join("\n\n");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function protectPreAnswer(stage: TutorStage, text: string, question: Question): string {
  if (stage === "EXPLANATION") return text;
  let safe = text;
  const letter = escapeRegExp(question.correctAnswer);
  safe = safe.replace(new RegExp(`((?:정답|답|correct\\s+answer)\\s*(?:은|는|:|is)?\\s*)${letter}\\b`, "gi"), "$1[정답 비공개]");
  const correctOption = question.options.find((option) => option.key === question.correctAnswer)?.text.trim();
  if (correctOption && correctOption.length >= 12) {
    safe = safe.replace(new RegExp(escapeRegExp(correctOption), "gi"), "[정답 선택지 비공개]");
  }
  return safe;
}

export async function generateTutorResponse(
  admin: SupabaseClient,
  input: { userId: string; courseSlug: string; setSlug: string; questionId: string; stage: TutorStage },
): Promise<TutorResponse> {
  const question = await getQuestion(input.courseSlug, input.setSlug, input.questionId);
  const { data: latestAttemptData, error: attemptError } = await admin
    .from("question_attempts")
    .select("selected_answer,is_correct,attempted_at")
    .eq("user_id", input.userId)
    .eq("course_slug", input.courseSlug)
    .eq("set_slug", input.setSlug)
    .eq("question_id", input.questionId)
    .eq("source_kind", "QUESTION_BANK")
    .order("attempted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (attemptError) throw attemptError;
  const latestAttempt = (latestAttemptData as LatestAttempt | null) ?? null;
  if (input.stage === "EXPLANATION" && !latestAttempt) {
    throw new TutorAccessError("EXPLANATION requires at least one submitted attempt");
  }

  const prompt = buildPrompt(input.stage, question, latestAttempt);
  const provider = createAIProvider();
  const started = Date.now();
  const generated = await provider.generate({ prompt });
  const latencyMs = Date.now() - started;
  const text = protectPreAnswer(input.stage, generated.text, question);

  const { data: interaction, error: interactionError } = await admin.from("ai_interactions").insert({
    user_id: input.userId,
    course_slug: input.courseSlug,
    set_slug: input.setSlug,
    question_id: input.questionId,
    stage: input.stage,
    ai_mode: env.aiMode,
    provider: generated.provider,
    model: generated.model ?? null,
    fallback: generated.fallback ?? false,
    request_chars: prompt.length,
    response_text: text,
    latency_ms: latencyMs,
  }).select("id").single();
  if (interactionError) throw interactionError;

  return {
    stage: input.stage,
    text,
    provider: generated.provider,
    model: generated.model,
    fallback: generated.fallback ?? false,
    attempted: Boolean(latestAttempt),
    answerRevealAllowed: Boolean(latestAttempt),
    interactionId: interaction.id,
  };
}
