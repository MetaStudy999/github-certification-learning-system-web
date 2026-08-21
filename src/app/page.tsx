import Link from "next/link";

const phases = [
  ["P0", "Architecture", "COMPLETE"],
  ["P1", "Local Environment", "COMPLETE"],
  ["P2", "Content Engine", "IN PROGRESS"],
  ["P3", "User / Progress", "PLANNED"],
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
          <div>
            <p className="eyebrow">Current Phase</p>
            <h2>P2 — Content Engine</h2>
          </div>
          <span className="badge">IN PROGRESS</span>
        </div>
        <p>메인 GCLS 저장소의 GH-900 콘텐츠를 Local-first Content Adapter로 읽고 웹 학습 화면에 렌더링합니다.</p>
        <div className="links"><Link href="/courses/001-foundations">GH-900 학습 열기</Link><a href="/api/content/health">Content Health</a></div>
      </section>

      <section className="grid" aria-label="Development phases">
        {phases.map(([code, name, status]) => (
          <article className="card" key={code}><span className="code">{code}</span><h3>{name}</h3><p>{status}</p></article>
        ))}
      </section>

      <section className="panel">
        <p className="eyebrow">Provider Strategy</p>
        <h2>Local Clone → GitHub Fallback</h2>
        <p>로컬에서는 sibling 콘텐츠 레포를 우선 사용하고, 없으면 GitHub 공개 저장소에서 동일 경로를 읽습니다.</p>
      </section>
    </main>
  );
}
