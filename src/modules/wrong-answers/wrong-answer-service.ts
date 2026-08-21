import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ErrorCode,
  RetryStage,
  WrongAnswerPriority,
  WrongAnswerStatus,
  WrongAnswerSummary,
} from "@/modules/wrong-answers/types";

interface WrongAnswerRow {
  id: string;
  course_slug: string;
  set_slug: string;
  question_id: string;
  error_code: ErrorCode | null;
  priority: WrongAnswerPriority;
  status: WrongAnswerStatus;
  retry_stage: RetryStage;
  wrong_count: number;
  correct_retry_count: number;
  next_retry_at: string | null;
}

export interface RetryTarget {
  id: string;
  course_slug: string;
  set_slug: string;
  question_id: string;
  status: WrongAnswerStatus;
  retry_stage: RetryStage;
}

function toSummary(row: WrongAnswerRow): WrongAnswerSummary {
  return {
    id: row.id,
    courseSlug: row.course_slug,
    setSlug: row.set_slug,
    questionId: row.question_id,
    errorCode: row.error_code,
    priority: row.priority,
    status: row.status,
    retryStage: row.retry_stage,
    wrongCount: row.wrong_count,
    correctRetryCount: row.correct_retry_count,
    nextRetryAt: row.next_retry_at,
  };
}

export async function getRetryTarget(
  admin: SupabaseClient,
  userId: string,
  wrongAnswerId: string,
): Promise<RetryTarget | null> {
  const { data, error } = await admin
    .from("wrong_answer_items")
    .select("id,course_slug,set_slug,question_id,status,retry_stage")
    .eq("id", wrongAnswerId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as RetryTarget | null;
}

export async function recordWrongAnswer(
  admin: SupabaseClient,
  input: {
    userId: string;
    attemptId: string;
    courseSlug: string;
    setSlug: string;
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
  },
): Promise<WrongAnswerSummary> {
  const { data, error } = await admin.rpc("record_wrong_answer", {
    p_user_id: input.userId,
    p_attempt_id: input.attemptId,
    p_course_slug: input.courseSlug,
    p_set_slug: input.setSlug,
    p_question_id: input.questionId,
    p_selected_answer: input.selectedAnswer,
    p_correct_answer: input.correctAnswer,
  });
  if (error) throw error;
  return data as WrongAnswerSummary;
}

export async function recordWrongAnswerRetry(
  admin: SupabaseClient,
  input: { userId: string; wrongAnswerId: string; attemptId: string; isCorrect: boolean },
): Promise<WrongAnswerSummary> {
  const { data, error } = await admin.rpc("record_wrong_answer_retry", {
    p_user_id: input.userId,
    p_wrong_answer_id: input.wrongAnswerId,
    p_attempt_id: input.attemptId,
    p_is_correct: input.isCorrect,
  });
  if (error) throw error;
  return data as WrongAnswerSummary;
}

export async function classifyWrongAnswer(
  admin: SupabaseClient,
  input: { userId: string; wrongAnswerId: string; errorCode: ErrorCode; reflection: string },
): Promise<WrongAnswerSummary> {
  const { data: existing, error: readError } = await admin
    .from("wrong_answer_items")
    .select("id,wrong_count")
    .eq("id", input.wrongAnswerId)
    .eq("user_id", input.userId)
    .maybeSingle();
  if (readError) throw readError;
  if (!existing) throw new Error("wrong answer item not found");

  const priority: WrongAnswerPriority = existing.wrong_count >= 2
    ? "HIGH"
    : input.errorCode === "MEMORY"
      ? "LOW"
      : "MEDIUM";

  const { data, error } = await admin
    .from("wrong_answer_items")
    .update({ error_code: input.errorCode, reflection: input.reflection || null, priority })
    .eq("id", input.wrongAnswerId)
    .eq("user_id", input.userId)
    .select("id,course_slug,set_slug,question_id,error_code,priority,status,retry_stage,wrong_count,correct_retry_count,next_retry_at")
    .single();
  if (error) throw error;
  return toSummary(data as WrongAnswerRow);
}
