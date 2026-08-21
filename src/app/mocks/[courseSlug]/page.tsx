import Link from "next/link";
import { notFound } from "next/navigation";

import { MockAttemptSummary } from "@/components/mocks/mock-attempt-summary";
import { ContentNotFoundError } from "@/modules/content/core/provider";
import { getAllMockExams } from "@/modules/mock-exams/mock-exam-service";

export const dynamic = "force-dynamic";

export default async function MockListPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  try {
    const exams = await getAllMockExams(courseSlug);
    return <main className="shell learningShell"><nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Mock Exams</span></nav><section className="learningHeader"><div><p className="eyebrow">GH-900 · P6</p><h1>Mock Exams</h1><p>40문항 × 3회 · 권장 시간 각 60분</p></div><Link className="sourceLink" href={`/readiness/${courseSlug}`}>Exam Readiness</Link></section><MockAttemptSummary courseSlug={courseSlug} /><section className="moduleGrid">{exams.map((exam) => <Link className="moduleCard" href={`/mocks/${courseSlug}/${exam.slug}`} key={exam.slug}><span className="code">{exam.code} · {exam.role}</span><h2>{exam.title}</h2><p>{exam.questions.length}문항 · 목표 {exam.targetPercent}%+ · 권장 {exam.recommendedMinutes}분</p></Link>)}</section></main>;
  } catch (error) {
    if (error instanceof ContentNotFoundError) notFound();
    throw error;
  }
}
