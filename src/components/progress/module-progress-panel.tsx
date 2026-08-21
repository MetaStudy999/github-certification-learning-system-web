"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface ModuleProgressPanelProps {
  courseSlug: string;
  moduleSlug: string;
  totalModules: number;
}

export function ModuleProgressPanel({ courseSlug, moduleSlug, totalModules }: ModuleProgressPanelProps) {
  const supabase = getSupabaseBrowserClient();
  const recorded = useRef(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [courseProgress, setCourseProgress] = useState({ completed: 0, total: totalModules });
  const [busy, setBusy] = useState(false);

  async function reload() {
    if (!supabase) return;
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    setAuthenticated(Boolean(user));
    if (!user) return;

    const [{ data: moduleRow }, { data: courseRow }] = await Promise.all([
      supabase.from("module_progress").select("status").eq("user_id", user.id).eq("course_slug", courseSlug).eq("module_slug", moduleSlug).maybeSingle(),
      supabase.from("course_progress").select("completed_modules,total_modules").eq("user_id", user.id).eq("course_slug", courseSlug).maybeSingle(),
    ]);
    setCompleted(moduleRow?.status === "completed");
    setCourseProgress({ completed: courseRow?.completed_modules ?? 0, total: courseRow?.total_modules || totalModules });
  }

  useEffect(() => {
    if (!supabase || recorded.current) {
      if (!supabase) setAuthenticated(false);
      return;
    }
    recorded.current = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { setAuthenticated(false); return; }
      setAuthenticated(true);
      await supabase.rpc("record_module_visit", { p_course_slug: courseSlug, p_module_slug: moduleSlug, p_total_modules: totalModules });
      await reload();
    })();
  }, [courseSlug, moduleSlug, supabase, totalModules]);

  async function toggleCompletion() {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.rpc("set_module_completion", {
      p_course_slug: courseSlug,
      p_module_slug: moduleSlug,
      p_completed: !completed,
      p_total_modules: totalModules,
    });
    if (!error) await reload();
    setBusy(false);
  }

  if (authenticated === false) {
    return <section className="progressPanel compactProgress"><span>학습 기록 저장: </span><Link href="/login">로그인</Link></section>;
  }

  const percent = courseProgress.total ? Math.round((courseProgress.completed / courseProgress.total) * 100) : 0;
  return (
    <section className="progressPanel compactProgress">
      <div className="progressHeader"><strong>{completed ? "완료한 모듈" : "학습 중인 모듈"}</strong><span>과정 {percent}%</span></div>
      <button type="button" disabled={busy || authenticated !== true} onClick={toggleCompletion}>{completed ? "완료 취소" : "이 모듈 완료"}</button>
    </section>
  );
}
