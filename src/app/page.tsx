import Link from "next/link";

const phases = [
  ["P0", "Architecture", "COMPLETE"],
  ["P1", "Local Environment", "COMPLETE"],
  ["P2", "Content Engine", "COMPLETE"],
  ["P3", "User / Progress", "NEXT"],
  ["P7", "AI Gateway / Tutor", "PLANNED"],
  ["P8", "RAG", "PLANNED"],
] as const;

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">GitHub Certification Learning System</p>
        <h1>GCLS Web</h1>
        <p className="lead">학습 · 훈련 · 평가 · 실습 · AI Tutor · Evidence · Portfolio를 하나의 흐름으로 연결합니다.</p>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div><p className="eyebrow">Learning Ready</p><h2>GH-900 Content Engine</h2></div>
          <span className="badge">P2 COMPLETE</span>
        </div>
        <p>메인 GCLS 저장소의 GH-900 15개 모듈을 Local-first Content Provider로 직접 읽어 학습 화면에 렌더링합니다.</p>
        <div className="links"><Link href="/courses/001-foundations">GH-900 학습 열기</Link><a href="/api/content/health">Content Health</a></div>
      </section>

      <section className="grid" aria-label="Development phases">
        {phases.map(([code, name, status]) => (
          <article className="card" key={code}><span className="code">{code}</span><h3>{name}</h3><p>{status}</p></article>
        ))}
      </section>

      <section className="panel">
        <p className="eyebrow">Next Phase</p>
        <h2>P3 — User / Progress</h2>
        <p>다음 단계에서는 사용자, 학습 세션, 모듈 완료 상태와 진행률을 Supabase PostgreSQL에 연결합니다.</p>
      </section>
    </main>
  );
}
