import Link from "next/link";

import { GitHubLabsDashboard } from "@/components/github-labs/github-labs-dashboard";
import { GITHUB_LAB_DEFINITIONS } from "@/modules/github-labs/definitions";

export default function FoundationsLabsPage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">P9 · Labs / GitHub API</p>
        <h1>GH-900 GitHub Lab Verification</h1>
        <p className="lead">실습 완료 버튼이 아니라 실제 Repository · Branch · Commit · Issue · Pull Request · Actions 객체를 GitHub API로 확인합니다.</p>
        <div className="links"><Link href="/courses/001-foundations/060-labs">060 Labs 원문 학습</Link><Link href="/progress">내 진행률</Link></div>
      </section>
      <section className="panel">
        <p className="eyebrow">Source of Truth</p>
        <p>실습 절차는 메인 GCLS 콘텐츠 Repository의 `001-foundations/060-labs`가 기준입니다. P9는 원문을 복제하지 않고 검증 가능한 GitHub Evidence만 기록합니다.</p>
      </section>
      <GitHubLabsDashboard definitions={GITHUB_LAB_DEFINITIONS} />
    </main>
  );
}
