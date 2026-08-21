import Link from "next/link";

const phases = [
  ["P0", "Architecture", "COMPLETE"],
  ["P1", "Local Environment", "COMPLETE"],
  ["P2", "Content Engine", "COMPLETE"],
  ["P3", "User / Progress", "COMPLETE"],
  ["P4", "Question Bank", "NEXT"],
  ["P7", "AI Gateway / Tutor", "PLANNED"],
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
          <div><p className="eyebrow">Learning + Progress Ready</p><h2>GH-900 Vertical Slice</h2></div>
          <span className="badge">P3 COMPLETE</span>
        </div>
        <p>메인 콘텐츠 저장소의 GH-900 15개 모듈을 읽고, Supabase Auth와 RLS를 이용해 개인별 학습 진행률과 세션을 저장합니다.</p>
        <div className="links"><Link href="/courses/001-foundations">GH-900 학습</Link><Link href="/progress">내 진행률</Link><Link href="/login">학습자 계정</Link></div>
      </section>

      <section className="grid" aria-label="Development phases">
        {phases.map(([code, name, status]) => (
          <article className="card" key={code}><span className="code">{code}</span><h3>{name}</h3><p>{status}</p></article>
        ))}
      </section>

      <section className="panel">
        <p className="eyebrow">Next Phase</p>
        <h2>P4 — Question Bank</h2>
        <p>다음 단계에서는 GH-900 문제은행을 Web Question Engine으로 읽고 사용자별 Attempt, 정답, 점수와 해설을 Progress에 연결합니다.</p>
      </section>
    </main>
  );
}
