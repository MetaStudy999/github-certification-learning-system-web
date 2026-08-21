import Link from "next/link";

import { ReadinessDashboard } from "@/components/readiness/readiness-dashboard";

export default async function ReadinessPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  return <main className="shell learningShell"><nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href={`/mocks/${courseSlug}`}>Mock Exams</Link><span>/</span><span>Readiness</span></nav><section className="learningHeader"><div><p className="eyebrow">P6 · Exam Gate</p><h1>Exam Readiness</h1><p>Mock 점수, 최근 2회, 오답 Retry, Study Guide 확인을 한 화면에서 검증합니다.</p></div></section><ReadinessDashboard courseSlug={courseSlug} /></main>;
}
