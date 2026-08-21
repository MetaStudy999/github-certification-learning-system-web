"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { ReadinessSnapshot } from "@/modules/readiness/readiness-service";

const LABELS: Record<keyof ReadinessSnapshot["criteria"], string> = {
  mock01: "Mock 01 · 85%+",
  mock02: "Mock 02 · 85%+",
  recentTwo: "최근 2회 연속 · 85%+",
  finalMock: "Final Mock · 90%+ 권장",
  wrongAnswerRetry: "최근 오답 Retry · 90%+",
  studyGuide: "최신 공식 Study Guide 확인",
};

export function ReadinessDashboard({ courseSlug }: { courseSlug: string }) {
  const supabase = getSupabaseBrowserClient();
  const [token, setToken] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<ReadinessSnapshot | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (accessToken: string) => {
    const response = await fetch(`/api/readiness/${courseSlug}`, { headers: { authorization: `Bearer ${accessToken}` } });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
    setSnapshot(payload as ReadinessSnapshot);
  }, [courseSlug]);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      const accessToken = data.session?.access_token ?? null;
      setToken(accessToken);
      if (accessToken) void load(accessToken).catch((error) => setMessage(String(error)));
    });
  }, [load, supabase]);

  async function confirmGuide() {
    if (!token) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/readiness/${courseSlug}/study-guide`, { method: "POST", headers: { authorization: `Bearer ${token}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
      await load(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  if (!supabase) return <section className="panel"><p>Supabase 환경변수가 필요합니다.</p></section>;
  if (!token) return <section className="panel"><p><Link href="/login">로그인</Link>하면 Exam Readiness를 계산할 수 있습니다.</p></section>;
  if (!snapshot) return <section className="panel"><p>{message || "Readiness를 계산하는 중입니다."}</p></section>;

  return <>
    <section className="panel readinessScore"><p className="eyebrow">Exam Readiness Gate</p><h2>{snapshot.status}</h2><p>{snapshot.readinessPercent}% · {Object.values(snapshot.criteria).filter(Boolean).length}/6 Gate 충족</p><div className="progressBar"><span className="progressFill" style={{ width: `${snapshot.readinessPercent}%` }} /></div></section>
    <section className="questionList readinessCriteria">{Object.entries(snapshot.criteria).map(([key, passed]) => <article className="questionCard" key={key}><div className="panelHeader"><div><p className="eyebrow">{passed ? "PASS" : "OPEN"}</p><h3>{LABELS[key as keyof ReadinessSnapshot["criteria"]]}</h3></div><span className="badge">{passed ? "✓" : "○"}</span></div>{key === "studyGuide" && !passed ? <div className="buttonRow"><button type="button" disabled={busy} onClick={confirmGuide}>최신 Study Guide 확인 완료</button></div> : null}</article>)}</section>
    <section className="panel"><p>Mock 01: {snapshot.scores.mock01 ?? "-"}% · Mock 02: {snapshot.scores.mock02 ?? "-"}% · Final: {snapshot.scores.finalMock ?? "-"}% · Retry: {snapshot.scores.wrongAnswerRetry ?? "-"}%</p><div className="links"><Link href={`/mocks/${courseSlug}`}>Mock 다시 보기</Link><Link href="/wrong-answers">오답 Queue</Link></div></section>
  </>;
}
