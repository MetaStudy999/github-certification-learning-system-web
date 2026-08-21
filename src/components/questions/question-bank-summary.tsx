"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface AttemptRow {
  question_id: string;
  is_correct: boolean;
  attempted_at: string;
}

export function QuestionBankSummary({ courseSlug, totalQuestions }: { courseSlug: string; totalQuestions: number }) {
  const supabase = getSupabaseBrowserClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      setUserId(user?.id ?? null);
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("question_attempts")
        .select("question_id,is_correct,attempted_at")
        .eq("course_slug", courseSlug)
        .eq("source_kind", "QUESTION_BANK")
        .order("attempted_at", { ascending: false })
        .limit(1000);
      setAttempts((data ?? []) as AttemptRow[]);
      setLoading(false);
    })();
  }, [courseSlug, supabase]);

  if (loading) return <section className="progressPanel"><p>문제은행 기록을 불러오는 중입니다.</p></section>;
  if (!supabase) return <section className="progressPanel"><p>Supabase 환경변수를 설정하면 문제풀이 기록을 저장할 수 있습니다.</p></section>;
  if (!userId) return <section className="progressPanel"><p><Link href="/login">로그인</Link>하면 문제풀이 Attempt와 점수가 저장됩니다.</p></section>;

  const latestByQuestion = new Map<string, AttemptRow>();
  for (const attempt of attempts) if (!latestByQuestion.has(attempt.question_id)) latestByQuestion.set(attempt.question_id, attempt);
  const answered = latestByQuestion.size;
  const latestCorrect = [...latestByQuestion.values()].filter((attempt) => attempt.is_correct).length;
  const accuracy = attempts.length ? Math.round((attempts.filter((attempt) => attempt.is_correct).length / attempts.length) * 100) : 0;
  const mastery = totalQuestions ? Math.round((latestCorrect / totalQuestions) * 100) : 0;

  return (
    <section className="progressPanel">
      <div className="progressHeader"><strong>내 문제은행 진행률</strong><span>{answered}/{totalQuestions} 풀이 · 최신 정답 {latestCorrect} · 전체 정답률 {accuracy}%</span></div>
      <div className="progressBar"><span className="progressFill" style={{ width: `${mastery}%` }} /></div>
    </section>
  );
}
