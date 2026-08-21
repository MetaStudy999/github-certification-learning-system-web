import Link from "next/link";

const phases = [
  ["P0", "Architecture", "COMPLETE"],
  ["P1", "Local Environment", "COMPLETE"],
  ["P2", "Content Engine", "COMPLETE"],
  ["P3", "User / Progress", "COMPLETE"],
  ["P4", "Question Bank", "COMPLETE"],
  ["P5", "Wrong Answer Engine", "NEXT"],
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
          <div><p className="eyebrow">Learning + Training Ready</p><h2>GH-900 Vertical Slice</h2></div>
          <span className="badge">P4 COMPLETE</span>
        </div>
        <p>GH-900 15개 학습 모듈과 개인별 Progress에 이어 Q001–Q100 문제은행을 Source of Truth에서 직접 읽어 서버 채점과 Attempt 기록까지 연결합니다.</p>
        <div className="links"><Link href="/courses/001-foundations">GH-900 학습</Link><Link href="/questions/001-foundations">100문제 풀기</Link><Link href="/progress">내 진행률</Link><Link href="/login">학습자 계정</Link></div>
      </section>

      <section className="grid" aria-label="Development phases">
        {phases.map(([code, name, status]) => (
          <article className="card" key={code}><span className="code">{code}</span><h3>{name}</h3><p>{status}</p></article>
        ))}
      </section>

      <section className="panel">
        <p className="eyebrow">Next Phase</p>
        <h2>P5 — Wrong Answer Engine</h2>
        <p>다음 단계에서는 틀린 문항을 자동 분류하고 재학습 Queue, 반복 복습, Mastered 판정으로 연결합니다.</p>
      </section>
    </main>
  );
}
