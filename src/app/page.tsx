const phases = [
  ["P0", "Architecture", "COMPLETE"],
  ["P1", "Local Environment", "IN PROGRESS"],
  ["P2", "Content Engine", "PLANNED"],
  ["P7", "AI Gateway / Tutor", "PLANNED"],
  ["P8", "RAG", "PLANNED"],
  ["P9", "GitHub Labs", "PLANNED"],
] as const;

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">GitHub Certification Learning System</p>
        <h1>GCLS Web</h1>
        <p className="lead">
          학습 · 훈련 · 평가 · 실습 · AI Tutor · Evidence · Portfolio를 하나의 흐름으로 연결합니다.
        </p>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Current Phase</p>
            <h2>P1 — Local Development Environment</h2>
          </div>
          <span className="badge">IN PROGRESS</span>
        </div>
        <p>
          Next.js 기반 실행 골격과 Supabase Local, Local AI/Ollama, OpenAI API를 교체 가능한 구조로 준비합니다.
        </p>
      </section>

      <section className="grid" aria-label="Development phases">
        {phases.map(([code, name, status]) => (
          <article className="card" key={code}>
            <span className="code">{code}</span>
            <h3>{name}</h3>
            <p>{status}</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <p className="eyebrow">Local AI Strategy</p>
        <h2>Mock → Local → API → Hybrid</h2>
        <p>
          기본 개발은 Mock으로 시작하고, Ollama를 로컬 Provider로 사용하며 필요할 때만 외부 API로 fallback합니다.
        </p>
        <div className="links">
          <a href="/api/health">Application Health</a>
          <a href="/api/ai/health">AI Health</a>
        </div>
      </section>
    </main>
  );
}
