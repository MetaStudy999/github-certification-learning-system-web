import Link from "next/link";

const phases = [
  ["P0", "Architecture", "COMPLETE"],
  ["P1", "Local Environment", "COMPLETE"],
  ["P2", "Content Engine", "COMPLETE"],
  ["P3", "User / Progress", "COMPLETE"],
  ["P4", "Question Bank", "COMPLETE"],
  ["P5", "Wrong Answer Engine", "COMPLETE"],
  ["P6", "Mock / Readiness", "COMPLETE"],
  ["P7", "AI Gateway / Tutor", "NEXT"],
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
          <div><p className="eyebrow">Learning + Assessment Ready</p><h2>GH-900 Vertical Slice</h2></div>
          <span className="badge">P6 COMPLETE</span>
        </div>
        <p>GH-900 15개 학습 모듈, Q001–Q100 문제은행, 오답 DAY_1/DAY_7 재학습에 이어 3회·120문항 Mock과 Exam Readiness Gate까지 연결합니다.</p>
        <div className="links">
          <Link href="/courses/001-foundations">GH-900 학습</Link>
          <Link href="/questions/001-foundations">100문제 풀기</Link>
          <Link href="/wrong-answers">오답 재학습</Link>
          <Link href="/mocks/001-foundations">Mock Exams</Link>
          <Link href="/readiness/001-foundations">Exam Readiness</Link>
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
        <h2>P7 — AI Gateway / Tutor</h2>
        <p>다음 단계에서는 이미 준비된 Mock / Local / API / Hybrid AI Provider를 실제 학습·문제·오답 흐름에 연결하고 Hint → Concept → Retry 중심의 AI Tutor를 구현합니다.</p>
      </section>
    </main>
  );
}
