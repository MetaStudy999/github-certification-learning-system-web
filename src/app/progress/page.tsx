import Link from "next/link";

import { ProgressDashboard } from "@/components/progress/progress-dashboard";

export default function ProgressPage() {
  return (
    <main className="shell learningShell">
      <nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Progress</span></nav>
      <section className="hero compactHero">
        <p className="eyebrow">P3 · User / Progress</p>
        <h1>내 학습 진행률</h1>
        <p className="lead">사용자별 과정·모듈 완료 상태와 학습 세션을 Supabase PostgreSQL에 기록합니다.</p>
      </section>
      <ProgressDashboard />
    </main>
  );
}
