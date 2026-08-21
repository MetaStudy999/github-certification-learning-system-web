"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface CourseProgressPanelProps {
  courseSlug: string;
  totalModules: number;
}

interface CourseProgressRow {
  completed_modules: number;
  total_modules: number;
  status: string;
}

export function CourseProgressPanel({ courseSlug, totalModules }: CourseProgressPanelProps) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [progress, setProgress] = useState<CourseProgressRow | null>(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) { setAuthenticated(false); return; }
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      setAuthenticated(Boolean(user));
      if (!user) return;
      const { data } = await supabase
        .from("course_progress")
        .select("completed_modules,total_modules,status")
        .eq("user_id", user.id)
        .eq("course_slug", courseSlug)
        .maybeSingle();
      setProgress(data as CourseProgressRow | null);
    })();
  }, [courseSlug, supabase]);

  if (authenticated === false) {
    return <section className="progressPanel"><p>진행률을 저장하려면 <Link href="/login">로그인</Link>하세요.</p></section>;
  }

  const completed = progress?.completed_modules ?? 0;
  const total = progress?.total_modules || totalModules;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="progressPanel" aria-label="Course progress">
      <div className="progressHeader"><strong>내 학습 진행률</strong><span>{completed}/{total} · {percent}%</span></div>
      <div className="progressBar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} role="progressbar"><span className="progressFill" style={{ width: `${percent}%` }} /></div>
      <div className="links"><Link href="/progress">Progress Dashboard</Link><Link href="/login">계정</Link></div>
    </section>
  );
}
