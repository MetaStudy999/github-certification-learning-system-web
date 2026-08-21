import type { SupabaseClient } from "@supabase/supabase-js";

export type ReadinessStatus = "EXAM-READY" | "READY" | "REVIEW" | "NOT READY";

interface MockAttemptRow {
  mock_slug: string;
  score_percent: number;
  submitted_at: string;
}

export interface ReadinessSnapshot {
  status: ReadinessStatus;
  readinessPercent: number;
  criteria: {
    mock01: boolean;
    mock02: boolean;
    recentTwo: boolean;
    finalMock: boolean;
    wrongAnswerRetry: boolean;
    studyGuide: boolean;
  };
  scores: {
    mock01: number | null;
    mock02: number | null;
    finalMock: number | null;
    wrongAnswerRetry: number | null;
  };
  recentAttempts: MockAttemptRow[];
  studyGuideConfirmedAt: string | null;
}

function latestScore(attempts: MockAttemptRow[], slug: string): number | null {
  return attempts.find((attempt) => attempt.mock_slug === slug)?.score_percent ?? null;
}

export async function getReadinessSnapshot(admin: SupabaseClient, userId: string, courseSlug: string): Promise<ReadinessSnapshot> {
  const { data: mockData, error: mockError } = await admin
    .from("mock_exam_attempts")
    .select("mock_slug,score_percent,submitted_at")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .eq("status", "SUBMITTED")
    .order("submitted_at", { ascending: false })
    .limit(50);
  if (mockError) throw mockError;
  const attempts = (mockData ?? []) as MockAttemptRow[];

  const { data: retryData, error: retryError } = await admin
    .from("wrong_answer_retries")
    .select("is_correct,reviewed_at")
    .eq("user_id", userId)
    .order("reviewed_at", { ascending: false })
    .limit(20);
  if (retryError) throw retryError;
  const retries = retryData ?? [];
  const retryPercent = retries.length
    ? Math.round((retries.filter((retry) => retry.is_correct).length / retries.length) * 100)
    : null;

  const { data: profile, error: profileError } = await admin
    .from("readiness_profiles")
    .select("study_guide_confirmed_at")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .maybeSingle();
  if (profileError) throw profileError;

  const mock01 = latestScore(attempts, "010-mock-01");
  const mock02 = latestScore(attempts, "020-mock-02");
  const finalMock = latestScore(attempts, "030-final-mock");
  const recentTwoAttempts = attempts.slice(0, 2);
  const criteria = {
    mock01: mock01 !== null && mock01 >= 85,
    mock02: mock02 !== null && mock02 >= 85,
    recentTwo: recentTwoAttempts.length === 2 && recentTwoAttempts.every((attempt) => attempt.score_percent >= 85),
    finalMock: finalMock !== null && finalMock >= 90,
    wrongAnswerRetry: retryPercent !== null && retryPercent >= 90,
    studyGuide: Boolean(profile?.study_guide_confirmed_at),
  };

  const passed = Object.values(criteria).filter(Boolean).length;
  const readinessPercent = Math.round((passed / Object.keys(criteria).length) * 100);
  const coreReady = criteria.mock01 && criteria.mock02 && criteria.recentTwo && criteria.wrongAnswerRetry && criteria.studyGuide;
  const status: ReadinessStatus = passed === 6
    ? "EXAM-READY"
    : coreReady
      ? "READY"
      : passed >= 3
        ? "REVIEW"
        : "NOT READY";

  return {
    status,
    readinessPercent,
    criteria,
    scores: { mock01, mock02, finalMock, wrongAnswerRetry: retryPercent },
    recentAttempts: attempts.slice(0, 5),
    studyGuideConfirmedAt: profile?.study_guide_confirmed_at ?? null,
  };
}

export async function confirmStudyGuide(admin: SupabaseClient, userId: string, courseSlug: string): Promise<string> {
  const confirmedAt = new Date().toISOString();
  const { error } = await admin.from("readiness_profiles").upsert({
    user_id: userId,
    course_slug: courseSlug,
    study_guide_confirmed_at: confirmedAt,
  }, { onConflict: "user_id,course_slug" });
  if (error) throw error;
  return confirmedAt;
}
