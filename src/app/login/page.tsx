import Link from "next/link";

import { AuthPanel } from "@/components/auth/auth-panel";

export default function LoginPage() {
  return (
    <main className="shell learningShell">
      <nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Login</span></nav>
      <section className="hero compactHero">
        <p className="eyebrow">P3 · User / Progress</p>
        <h1>학습자 계정</h1>
        <p className="lead">Supabase Auth 계정으로 학습 기록과 진행률을 사용자별로 분리합니다.</p>
      </section>
      <AuthPanel />
    </main>
  );
}
