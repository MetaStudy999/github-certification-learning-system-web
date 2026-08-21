import { NextResponse } from "next/server";

import { getSupabaseAdminClient, verifySupabaseAccessToken } from "@/lib/supabase/server";
import { ContentNotFoundError } from "@/modules/content/core/provider";
import { getQuestion } from "@/modules/question-bank/question-bank-service";
import {
  getRetryTarget,
  recordWrongAnswer,
  recordWrongAnswerRetry,
} from "@/modules/wrong-answers/wrong-answer-service";

interface SubmitRouteProps {
  params: Promise<{ courseSlug: string; setSlug: string; questionId: string }>;
}

interface SubmitBody {
  selectedAnswer?: string;
  mode?: "practice" | "retry";
  wrongAnswerId?: string;
}

export async function POST(request: Request, { params }: SubmitRouteProps) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "authentication required" }, { status: 401 });

  let body: SubmitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const selectedAnswer = body.selectedAnswer?.trim().toUpperCase();
  if (!selectedAnswer || !/^[A-H]$/.test(selectedAnswer)) {
    return NextResponse.json({ error: "selectedAnswer must be A-H" }, { status: 400 });
  }

  const mode = body.mode ?? "practice";
  if (mode !== "practice" && mode !== "retry") {
    return NextResponse.json({ error: "mode must be practice or retry" }, { status: 400 });
  }
  if (mode === "retry" && !body.wrongAnswerId) {
    return NextResponse.json({ error: "wrongAnswerId is required for retry mode" }, { status: 400 });
  }

  const { courseSlug, setSlug, questionId } = await params;

  try {
    const [user, question] = await Promise.all([
      verifySupabaseAccessToken(token),
      getQuestion(courseSlug, setSlug, questionId),
    ]);

    if (!question.options.some((option) => option.key === selectedAnswer)) {
      return NextResponse.json({ error: "selected answer is not an option" }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    if (mode === "retry") {
      const retryTarget = await getRetryTarget(admin, user.id, body.wrongAnswerId!);
      if (!retryTarget) return NextResponse.json({ error: "wrong answer item not found" }, { status: 404 });
      if (
        retryTarget.course_slug !== courseSlug
        || retryTarget.set_slug !== setSlug
        || retryTarget.question_id !== questionId
      ) {
        return NextResponse.json({ error: "retry target does not match this question" }, { status: 409 });
      }
      if (retryTarget.status !== "OPEN" || retryTarget.retry_stage === "CLOSED") {
        return NextResponse.json({ error: "wrong answer item is already closed" }, { status: 409 });
      }
    }

    const isCorrect = selectedAnswer === question.correctAnswer;
    const { data, error } = await admin.from("question_attempts").insert({
      user_id: user.id,
      course_slug: courseSlug,
      set_slug: setSlug,
      question_id: questionId,
      selected_answer: selectedAnswer,
      correct_answer: question.correctAnswer,
      is_correct: isCorrect,
    }).select("id,attempted_at").single();

    if (error) throw error;

    let wrongAnswer = null;
    if (mode === "retry") {
      wrongAnswer = await recordWrongAnswerRetry(admin, {
        userId: user.id,
        wrongAnswerId: body.wrongAnswerId!,
        attemptId: data.id,
        isCorrect,
      });
    } else if (!isCorrect) {
      wrongAnswer = await recordWrongAnswer(admin, {
        userId: user.id,
        attemptId: data.id,
        courseSlug,
        setSlug,
        questionId,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
      });
    }

    return NextResponse.json({
      attemptId: data.id,
      attemptedAt: data.attempted_at,
      mode,
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      wrongAnswer,
    });
  } catch (error) {
    if (error instanceof ContentNotFoundError) return NextResponse.json({ error: error.message }, { status: 404 });
    if (error instanceof Error && error.message === "invalid access token") {
      return NextResponse.json({ error: "invalid access token" }, { status: 401 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
