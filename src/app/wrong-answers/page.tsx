import Link from "next/link";

import { WrongAnswerDashboard } from "@/components/wrong-answers/wrong-answer-dashboard";

export const dynamic = "force-dynamic";

export default function WrongAnswersPage() {
  return (
    <main className="shell learningShell">
      <nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/questions/001-foundations">Question Bank</Link><span>/</span><span>Wrong Answers</span></nav>
      <section className="learningHeader">
        <div>
          <p className="eyebrow">P5 · Wrong Answer Engine</p>
          <h1>GH-900 오답 재학습 Queue</h1>
          <p className="lead">틀린 문항을 원인 코드로 분류하고 +1일, +7일 재시험을 거쳐 CLOSED까지 관리합니다.</p>
        </div>
        <a
          className="sourceLink"
          href="https://github.com/MetaStudy999/github-certification-learning-system/blob/main/001-foundations/120-wrong-answers/README.md"
          target="_blank"
          rel="noreferrer"
        >
          Source of Truth
        </a>
      </section>

      <section className="panel">
        <p className="eyebrow">Retry Cycle</p>
        <p>오답 → 원인 분류 → +1 Day → +7 Days → CLOSED. 재도전에서 다시 틀리면 HIGH Priority로 올라가고 DAY_1부터 다시 시작합니다.</p>
      </section>

      <WrongAnswerDashboard courseSlug="001-foundations" />
    </main>
  );
}
