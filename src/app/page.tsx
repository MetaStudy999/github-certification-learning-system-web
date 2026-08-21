import Link from "next/link";

const phases = [
  ["P0", "Architecture", "COMPLETE"],
  ["P1", "Local Environment", "COMPLETE"],
  ["P2", "Content Engine", "COMPLETE"],
  ["P3", "User / Progress", "COMPLETE"],
  ["P4", "Question Bank", "COMPLETE"],
  ["P5", "Wrong Answer Engine", "COMPLETE"],
  ["P6", "Mock / Readiness", "COMPLETE"],
  ["P7", "AI Gateway / Tutor", "COMPLETE"],
  ["P8", "RAG", "COMPLETE"],
  ["P9", "Labs / GitHub API", "COMPLETE"],
  ["P10", "Evidence / Portfolio", "NEXT"],
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
          <div><p className="eyebrow">Learning + Assessment + Grounded AI + GitHub Verification Ready</p><h2>GH-900 Vertical Slice</h2></div>
          <span className="badge">P9 COMPLETE</span>
        </div>
        <p>학습/문제/오답/Mock/Readiness/RAG Tutor에 이어 실제 GitHub Repository · Branch · Commit · Issue · PR · Actions 수행 결과를 PASS/RETRY로 검증합니다.</p>
        <div className="links">
          <Link href="/courses/001-foundations">GH-900 학습</Link>
          <Link href="/questions/001-foundations">100문제 + RAG AI Tutor</Link>
          <Link href="/wrong-answers">오답 재학습</Link>
          <Link href="/mocks/001-foundations">Mock Exams</Link>
          <Link href="/readiness/001-foundations">Exam Readiness</Link>
          <Link href="/labs/001-foundations">GitHub Labs 검증</Link>
          <Link href="/progress">내 진행률</Link>
        </div>
      </section>

      <section className="grid" aria-label="Development phases">
        {phases.map(([code, name, status]) => (
          <article className="card" key={code}><span className="code">{code}</span><h3>{name}</h3><p>{status}</p></article>
        ))}
      </section>

      <section className="panel">
        <p className="eyebrow">Next Phase</p>
        <h2>P10 — Evidence / Portfolio</h2>
        <p>다음 단계에서는 Progress, Question, Wrong Answer, Mock, Readiness, AI/RAG, GitHub Lab Verification을 하나의 GH-900 Evidence Package와 Portfolio로 통합합니다.</p>
      </section>
    </main>
  );
}
