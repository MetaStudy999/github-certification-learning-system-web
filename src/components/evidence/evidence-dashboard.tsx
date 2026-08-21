"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { EvidencePackageView, ManualEvidenceType } from "@/modules/evidence/types";

const TYPES: Array<[ManualEvidenceType, string]> = [["ENVIRONMENT","Environment"],["LAB_LOCAL","Git Basics / Local Lab"],["REPOSITORY_DOCS","Repository Docs"],["PROJECT","Project"],["EXAM","Exam Result"],["REFLECTION","Reflection"]];
async function payload(response: Response) { const data = await response.json(); if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`); return data; }

export function EvidenceDashboard() {
  const supabase = getSupabaseBrowserClient();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [pkg, setPkg] = useState<EvidencePackageView | null>(null);
  const [type, setType] = useState<ManualEvidenceType>("ENVIRONMENT");
  const [title, setTitle] = useState(""); const [what, setWhat] = useState(""); const [why, setWhy] = useState("");
  const [verify, setVerify] = useState(""); const [result, setResult] = useState(""); const [url, setUrl] = useState(""); const [score, setScore] = useState("");
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { if (!supabase) return; void supabase.auth.getSession().then(({data}) => setAccessToken(data.session?.access_token ?? null)); const {data}=supabase.auth.onAuthStateChange((_e,s)=>setAccessToken(s?.access_token??null)); return ()=>data.subscription.unsubscribe(); }, [supabase]);
  async function generate() { if (!accessToken) return; setBusy(true); try { const r=await fetch("/api/evidence/001-foundations",{method:"POST",headers:{authorization:`Bearer ${accessToken}`}}); setPkg(await payload(r)); setMessage("Evidence Package를 최신 데이터로 재생성했습니다."); } catch(e){setMessage(e instanceof Error?e.message:String(e));} finally{setBusy(false);} }
  useEffect(()=>{if(!accessToken){setPkg(null);return;} void fetch("/api/evidence/001-foundations",{headers:{authorization:`Bearer ${accessToken}`},cache:"no-store"}).then(async r=>{if(r.ok)setPkg(await r.json());}).catch(()=>{});},[accessToken]);
  async function addManual(){ if(!accessToken||!title||!what||!verify||!result)return; setBusy(true); try { const r=await fetch("/api/evidence/001-foundations/manual",{method:"POST",headers:{authorization:`Bearer ${accessToken}`,"content-type":"application/json"},body:JSON.stringify({evidenceType:type,title,what,why,verify,result,canonicalUrl:url||null,scorePercent:score?Number(score):null,confirmed:true})}); await payload(r); setTitle("");setWhat("");setWhy("");setVerify("");setResult("");setUrl("");setScore(""); await generate(); } catch(e){setMessage(e instanceof Error?e.message:String(e));setBusy(false);} }
  async function download(format:"json"|"markdown"){if(!accessToken)return; const r=await fetch(`/api/evidence/001-foundations/export?format=${format}`,{headers:{authorization:`Bearer ${accessToken}`}}); if(!r.ok){setMessage("먼저 Evidence Package를 생성하세요.");return;} const blob=await r.blob(); const href=URL.createObjectURL(blob); const a=document.createElement("a");a.href=href;a.download=format==="markdown"?"gh-900-evidence-portfolio.md":"gh-900-evidence-package.json";a.click();URL.revokeObjectURL(href);}
  if (!supabase) return <section className="panel"><p>Supabase 환경변수가 필요합니다.</p></section>;
  if (!accessToken) return <section className="panel"><p>Evidence를 사용하려면 <Link href="/login">로그인</Link>하세요.</p></section>;
  return <>
    {message?<section className="panel"><p className="statusMessage">{message}</p></section>:null}
    <section className="panel"><div className="panelHeader"><div><p className="eyebrow">P10 · Evidence Package</p><h2>GH-900 Evidence Snapshot</h2></div><span className="badge">{pkg?.status??"NOT GENERATED"}</span></div>
      <p>시스템 검증 데이터와 SELF-ATTESTED Evidence를 분리해 기록합니다. 자동 판정은 CLEAR가 아니라 CLEAR_CANDIDATE까지만 수행합니다.</p>
      <div className="buttonRow"><button disabled={busy} onClick={generate}>Evidence Package 재생성</button><button className="buttonSecondary" disabled={!pkg} onClick={()=>download("markdown")}>Markdown 내보내기</button><button className="buttonSecondary" disabled={!pkg} onClick={()=>download("json")}>JSON 내보내기</button></div>
      {pkg?<><p><strong>완성도 {pkg.completenessPercent}%</strong> · Generated {new Date(pkg.generatedAt).toLocaleString()}</p><div className="grid">{pkg.gate.map(g=><article className="card" key={g.key}><span className="code">{g.pass?"PASS":"MISSING"}</span><h3>{g.label}</h3><p>{g.source}</p><p>{g.reason}</p></article>)}</div></>:null}
    </section>
    <section className="panel"><div className="panelHeader"><div><p className="eyebrow">Manual Evidence</p><h2>외부 사실 SELF-ATTESTED 기록</h2></div><span className="badge">What · Why · Verify · Result</span></div>
      <label>종류<select value={type} onChange={e=>setType(e.target.value as ManualEvidenceType)}>{TYPES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
      <label>제목<input value={title} onChange={e=>setTitle(e.target.value)} /></label><label>What<input value={what} onChange={e=>setWhat(e.target.value)} /></label><label>Why<input value={why} onChange={e=>setWhy(e.target.value)} /></label><label>Verify<input value={verify} onChange={e=>setVerify(e.target.value)} /></label><label>Result<input value={result} onChange={e=>setResult(e.target.value)} /></label><label>Canonical URL (선택)<input value={url} onChange={e=>setUrl(e.target.value)} /></label>{type==="PROJECT"?<label>Project Score %<input inputMode="decimal" value={score} onChange={e=>setScore(e.target.value)} /></label>:null}
      <div className="buttonRow"><button disabled={busy||!title||!what||!verify||!result} onClick={addManual}>확인된 Manual Evidence 추가</button></div>
    </section>
    {pkg?<section className="panel"><div className="panelHeader"><div><p className="eyebrow">Portfolio Projection</p><h2>{pkg.snapshot.learner.displayName} · GitHub Foundations</h2></div><span className="badge">{pkg.snapshot.readiness.status}</span></div>
      <div className="grid"><article className="card"><span className="code">LEARN</span><h3>{pkg.snapshot.progress.completedModules}/{pkg.snapshot.progress.totalModules} Modules</h3><p>{pkg.snapshot.progress.status}</p></article><article className="card"><span className="code">PRACTICE</span><h3>{pkg.snapshot.practice.answeredQuestions}/100</h3><p>Accuracy {pkg.snapshot.practice.latestAccuracyPercent??"-"}%</p></article><article className="card"><span className="code">MOCK</span><h3>{pkg.snapshot.mocks.finalMock??"-"}% Final</h3><p>Readiness {pkg.snapshot.readiness.readinessPercent}%</p></article><article className="card"><span className="code">AI/RAG</span><h3>{pkg.snapshot.ai.groundedInteractions}/{pkg.snapshot.ai.interactions}</h3><p>Grounded / Total Tutor interactions</p></article></div>
      <p><Link href="/portfolio/001-foundations">Portfolio 전용 화면 →</Link></p></section>:null}
  </>;
}
