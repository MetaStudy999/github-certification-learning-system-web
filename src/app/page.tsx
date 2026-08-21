import Link from "next/link";

const phases = [
  ["P0", "Architecture", "COMPLETE"], ["P1", "Local Environment", "COMPLETE"], ["P2", "Content Engine", "COMPLETE"],
  ["P3", "User / Progress", "COMPLETE"], ["P4", "Question Bank", "COMPLETE"], ["P5", "Wrong Answer Engine", "COMPLETE"],
  ["P6", "Mock / Readiness", "COMPLETE"], ["P7", "AI Gateway / Tutor", "COMPLETE"], ["P8", "RAG", "COMPLETE"],
  ["P9", "Labs / GitHub API", "COMPLETE"], ["P10", "Evidence / Portfolio", "COMPLETE"],
] as const;

export default function Home() {
  return <main className="shell">
    <section className="hero"><p className="eyebrow">GitHub Certification Learning System</p><h1>GCLS Web</h1><p className="lead">학습 · 훈련 · 평가 · 실습 · AI Tutor · Evidence · Portfolio를 하나의 흐름으로 연결합니다.</p></section>
    <section className="panel"><div className="panelHeader"><div><p className="eyebrow">GH-900 End-to-End Vertical Slice</p><h2>GitHub Foundations Learning System</h2></div><span className="badge">P10 COMPLETE</span></div>
      <p>15개 학습 모듈부터 100문제, 오답 재학습, 3회 Mock, Readiness, RAG Tutor, 실제 GitHub Lab 검증, Evidence Package와 Portfolio까지 연결했습니다.</p>
      <div className="links"><Link href="/courses/001-foundations">GH-900 학습</Link><Link href="/questions/001-foundations">100문제 + RAG Tutor</Link><Link href="/wrong-answers">오답 재학습</Link><Link href="/mocks/001-foundations">Mock Exams</Link><Link href="/readiness/001-foundations">Exam Readiness</Link><Link href="/labs/001-foundations">GitHub Labs</Link><Link href="/evidence/001-foundations">Evidence</Link><Link href="/portfolio/001-foundations">Portfolio</Link><Link href="/progress">내 진행률</Link></div>
    </section>
    <section className="grid" aria-label="Development phases">{phases.map(([code,name,status])=><article className="card" key={code}><span className="code">{code}</span><h3>{name}</h3><p>{status}</p></article>)}</section>
    <section className="panel"><p className="eyebrow">Next Operating Stage</p><h2>GH-900 Validation → 002 GitHub Actions</h2><p>P0~P10 기능 개발은 완료했습니다. 다음에는 실제 사용자 시나리오로 GH-900 UX와 Evidence 품질을 검증한 뒤 공통 Engine을 002 GitHub Actions 과정으로 확장합니다.</p></section>
  </main>;
}
