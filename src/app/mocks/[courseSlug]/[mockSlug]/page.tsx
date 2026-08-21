import Link from "next/link";
import { notFound } from "next/navigation";

import { MockExamPlayer } from "@/components/mocks/mock-exam-player";
import { ContentNotFoundError } from "@/modules/content/core/provider";
import { getMockExam, toPublicMockQuestion } from "@/modules/mock-exams/mock-exam-service";

export const dynamic = "force-dynamic";

export default async function MockPage({ params }: { params: Promise<{ courseSlug: string; mockSlug: string }> }) {
  const { courseSlug, mockSlug } = await params;
  try {
    const exam = await getMockExam(courseSlug, mockSlug);
    return <main className="shell learningShell"><nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href={`/mocks/${courseSlug}`}>Mock Exams</Link><span>/</span><span>{exam.code}</span></nav><section className="learningHeader"><div><p className="eyebrow">{exam.role} · Provider {exam.provider}</p><h1>{exam.title}</h1><p>정답은 전체 제출 전에는 브라우저에 제공되지 않습니다.</p></div><a className="sourceLink" href={exam.questionsSourceUrl} target="_blank" rel="noreferrer">Questions 원문</a></section><MockExamPlayer courseSlug={courseSlug} mockSlug={mockSlug} questions={exam.questions.map(toPublicMockQuestion)} recommendedMinutes={exam.recommendedMinutes} targetPercent={exam.targetPercent} /></main>;
  } catch (error) {
    if (error instanceof ContentNotFoundError) notFound();
    throw error;
  }
}
