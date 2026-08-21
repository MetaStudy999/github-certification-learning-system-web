"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface CourseRow { course_slug: string; status: string; completed_modules: number; total_modules: number; }
interface ModuleRow { course_slug: string; module_slug: string; status: string; view_count: number; updated_at: string; }
interface SessionRow { id: string; course_slug: string; module_slug: string | null; started_at: string; ended_at: string | null; duration_seconds: number | null; }

export function ProgressDashboard() {
  const supabase = getSupabaseBrowserClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Learner");
  const [course, setCourse] = useState<CourseRow | null>(null);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!supabase) { setLoading(false); return; }
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    setUserId(user?.id ?? null);
    if (!user) { setLoading(false); return; }

    const [profileResult, courseResult, moduleResult, sessionResult] = await Promise.all([
      supabase.from("learner_profiles").select("display_name").eq("id", user.id).maybeSingle(),
      supabase.from("course_progress").select("course_slug,status,completed_modules,total_modules").eq("user_id", user.id).eq("course_slug", "001-foundations").maybeSingle(),
      supabase.from("module_progress").select("course_slug,module_slug,status,view_count,updated_at").eq("user_id", user.id).eq("course_slug", "001-foundations").order("updated_at", { ascending: false }).limit(20),
      supabase.from("study_sessions").select("id,course_slug,module_slug,started_at,ended_at,duration_seconds").eq("user_id", user.id).order("started_at", { ascending: false }).limit(10),
    ]);

    setDisplayName(profileResult.data?.display_name ?? user.email?.split("@")[0] ?? "Learner");
    setCourse(courseResult.data as CourseRow | null);
    setModules((moduleResult.data ?? []) as ModuleRow[]);
    const sessionRows = (sessionResult.data ?? []) as SessionRow[];
    setSessions(sessionRows);
    setActiveSession(sessionRows.find((row) => !row.ended_at)?.id ?? null);
    setLoading(false);
  }

  useEffect(() => { void load(); }, [supabase]);

  async function startSession() {
    if (!supabase || !userId || activeSession) return;
    const { data, error } = await supabase.rpc("start_study_session", { p_course_slug: "001-foundations", p_module_slug: null });
    if (!error && data) setActiveSession(data as string);
    await load();
  }

  async function finishSession() {
    if (!supabase || !activeSession) return;
    await supabase.rpc("finish_study_session", { p_session_id: activeSession });
    setActiveSession(null);
    await load();
  }

  if (loading) return <section className="panel"><p>Progress를 불러오는 중입니다.</p></section>;
  if (!supabase) return <section className="panel"><p>Supabase 환경변수가 필요합니다.</p></section>;
  if (!userId) return <section className="panel"><h2>로그인이 필요합니다.</h2><p><Link href="/login">학습자 로그인</Link> 후 개인 진행률을 사용할 수 있습니다.</p></section>;

  const completed = course?.completed_modules ?? 0;
  const total = course?.total_modules || 15;
  const percent = Math.round((completed / total) * 100);

  return (
    <>
      <section className="panel">
        <p className="eyebrow">Learner</p>
        <h2>{displayName}</h2>
        <div className="progressHeader"><strong>GH-900 GitHub Foundations</strong><span>{completed}/{total} · {percent}%</span></div>
        <div className="progressBar"><span className="progressFill" style={{ width: `${percent}%` }} /></div>
        <div className="buttonRow">
          <button type="button" disabled={Boolean(activeSession)} onClick={startSession}>학습 세션 시작</button>
          <button className="buttonSecondary" type="button" disabled={!activeSession} onClick={finishSession}>학습 세션 종료</button>
          <Link href="/courses/001-foundations">학습 계속하기</Link>
        </div>
      </section>

      <section className="panel">
        <h2>최근 모듈 활동</h2>
        {modules.length ? <div className="activityList">{modules.map((row) => <div key={row.module_slug}><Link href={`/courses/${row.course_slug}/${row.module_slug}`}>{row.module_slug}</Link><span>{row.status} · views {row.view_count}</span></div>)}</div> : <p>아직 학습한 모듈이 없습니다.</p>}
      </section>

      <section className="panel">
        <h2>최근 학습 세션</h2>
        {sessions.length ? <div className="activityList">{sessions.map((row) => <div key={row.id}><span>{new Date(row.started_at).toLocaleString()}</span><span>{row.ended_at ? `${row.duration_seconds ?? 0}s` : "ACTIVE"}</span></div>)}</div> : <p>아직 기록된 학습 세션이 없습니다.</p>}
      </section>
    </>
  );
}
