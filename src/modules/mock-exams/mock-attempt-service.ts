import type { SupabaseClient } from "@supabase/supabase-js";

import { getMockExam, judgeMock } from "@/modules/mock-exams/mock-exam-service";
import type { MockAttemptSummary, MockExamDefinition } from "@/modules/mock-exams/types";
import { recordWrongAnswerRetry } from "@/modules/wrong-answers/wrong-answer-service";

interface MockAttemptRow {
  id: string;
  user_id: string;
  course_slug: string;
  mock_slug: string;
  role: MockExamDefinition["role"];
  status: "IN_PROGRESS" | "SUBMITTED";
  started_at: string;
  recommended_seconds: number;
}

interface QuestionAttemptRow {
  id: string;
  question_id: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

interface ExistingWrongAnswer {
  id: string;
  question_id: string;
  status: "OPEN" | "CLOSED";
}

export async function startMockAttempt(
  admin: SupabaseClient,
  userId: string,
  courseSlug: string,
  mockSlug: string,
): Promise<{ attemptId: string; startedAt: string; recommendedSeconds: number }> {
  const exam = await getMockExam(courseSlug, mockSlug);
  const recommendedSeconds = exam.recommendedMinutes * 60;
  const { data, error } = await admin.from("mock_exam_attempts").insert({
    user_id: userId,
    course_slug: courseSlug,
    mock_slug: mockSlug,
    role: exam.role,
    recommended_seconds: recommendedSeconds,
    target_percent: exam.targetPercent,
    total_questions: exam.questions.length,
  }).select("id,started_at,recommended_seconds").single();
  if (error) throw error;
  return { attemptId: data.id, startedAt: data.started_at, recommendedSeconds: data.recommended_seconds };
}

export async function submitMockAttempt(
  admin: SupabaseClient,
  userId: string,
  attemptId: string,
  selections: Record<string, string>,
): Promise<MockAttemptSummary & { answers: Array<{ questionId: string; selectedAnswer: string; correctAnswer: string; isCorrect: boolean; explanation: string }> }> {
  const { data: attemptData, error: attemptError } = await admin
    .from("mock_exam_attempts")
    .select("id,user_id,course_slug,mock_slug,role,status,started_at,recommended_seconds")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();
  if (attemptError) throw attemptError;
  if (!attemptData) throw new Error("mock attempt not found");
  const attempt = attemptData as MockAttemptRow;
  if (attempt.status !== "IN_PROGRESS") throw new Error("mock attempt already submitted");

  const exam = await getMockExam(attempt.course_slug, attempt.mock_slug);
  const answers = exam.questions.map((question) => {
    const selectedAnswer = selections[question.id]?.trim().toUpperCase();
    if (!selectedAnswer || !question.options.some((option) => option.key === selectedAnswer)) {
      throw new Error(`valid answer required for ${question.id}`);
    }
    return {
      questionId: question.id,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: selectedAnswer === question.correctAnswer,
      explanation: question.explanation,
    };
  });

  if (Object.keys(selections).length !== exam.questions.length) {
    throw new Error(`all ${exam.questions.length} questions must be answered`);
  }

  const { data: existingAnswerRows, error: existingAnswerError } = await admin
    .from("mock_exam_answers")
    .select("id")
    .eq("mock_attempt_id", attemptId)
    .limit(1);
  if (existingAnswerError) throw existingAnswerError;
  if ((existingAnswerRows ?? []).length) throw new Error("mock attempt already contains answer rows");

  const { data: questionAttemptData, error: questionAttemptError } = await admin
    .from("question_attempts")
    .insert(answers.map((answer) => ({
      user_id: userId,
      course_slug: attempt.course_slug,
      set_slug: attempt.mock_slug,
      question_id: answer.questionId,
      selected_answer: answer.selectedAnswer,
      correct_answer: answer.correctAnswer,
      is_correct: answer.isCorrect,
      source_kind: "MOCK",
    })))
    .select("id,question_id,selected_answer,correct_answer,is_correct");
  if (questionAttemptError) throw questionAttemptError;
  const questionAttempts = questionAttemptData as QuestionAttemptRow[];
  const attemptByQuestion = new Map(questionAttempts.map((row) => [row.question_id, row]));

  const { error: mockAnswersError } = await admin.from("mock_exam_answers").insert(answers.map((answer) => ({
    mock_attempt_id: attemptId,
    user_id: userId,
    question_attempt_id: attemptByQuestion.get(answer.questionId)!.id,
    question_id: answer.questionId,
    selected_answer: answer.selectedAnswer,
    correct_answer: answer.correctAnswer,
    is_correct: answer.isCorrect,
  })));
  if (mockAnswersError) throw mockAnswersError;

  const { data: existingWrongData, error: existingWrongError } = await admin
    .from("wrong_answer_items")
    .select("id,question_id,status")
    .eq("user_id", userId)
    .eq("course_slug", attempt.course_slug)
    .eq("set_slug", attempt.mock_slug)
    .eq("source_kind", "MOCK");
  if (existingWrongError) throw existingWrongError;
  const existingByQuestion = new Map((existingWrongData as ExistingWrongAnswer[] | null ?? []).map((row) => [row.question_id, row]));
  const initialPriority = exam.role === "DIAGNOSTIC" ? "MEDIUM" : "HIGH";

  for (const answer of answers) {
    const questionAttempt = attemptByQuestion.get(answer.questionId)!;
    const existing = existingByQuestion.get(answer.questionId);
    if (existing?.status === "OPEN") {
      await recordWrongAnswerRetry(admin, {
        userId,
        wrongAnswerId: existing.id,
        attemptId: questionAttempt.id,
        isCorrect: answer.isCorrect,
      });
    } else if (!answer.isCorrect) {
      const { error } = await admin.rpc("record_mock_wrong_answer", {
        p_user_id: userId,
        p_attempt_id: questionAttempt.id,
        p_course_slug: attempt.course_slug,
        p_mock_slug: attempt.mock_slug,
        p_question_id: answer.questionId,
        p_selected_answer: answer.selectedAnswer,
        p_correct_answer: answer.correctAnswer,
        p_priority: initialPriority,
      });
      if (error) throw error;
    }
  }

  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const scorePercent = Number(((correctAnswers / answers.length) * 100).toFixed(2));
  const judgment = judgeMock(scorePercent);
  const now = new Date();
  const elapsedSeconds = Math.max(0, Math.round((now.getTime() - new Date(attempt.started_at).getTime()) / 1000));

  const { error: finalizeError } = await admin.from("mock_exam_attempts").update({
    status: "SUBMITTED",
    submitted_at: now.toISOString(),
    elapsed_seconds: elapsedSeconds,
    correct_answers: correctAnswers,
    score_percent: scorePercent,
    judgment,
  }).eq("id", attemptId).eq("user_id", userId).eq("status", "IN_PROGRESS");
  if (finalizeError) throw finalizeError;

  return {
    id: attemptId,
    mockSlug: attempt.mock_slug,
    scorePercent,
    correctAnswers,
    totalQuestions: answers.length,
    judgment,
    elapsedSeconds,
    submittedAt: now.toISOString(),
    answers,
  };
}
