import Link from "next/link";
import { notFound } from "next/navigation";

import { QuestionBankSummary } from "@/components/questions/question-bank-summary";
import { ContentNotFoundError } from "@/modules/content/core/provider";
import { getQuestionBankCatalog } from "@/modules/question-bank/question-bank-service";

export const dynamic = "force-dynamic";

export default async function QuestionBankPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  try {
    const catalog = await getQuestionBankCatalog(courseSlug);
    return (
      <main className="shell">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href={`/courses/${courseSlug}`}>GH-900</Link><span>/</span><span>Question Bank</span></nav>
        <section className="hero compactHero">
          <p className="eyebrow">P4 · Question Bank · {catalog.provider}</p>
          <h1>GH-900 100문제</h1>
          <p className="lead">메인 콘텐츠 레포의 Q001–Q100을 직접 읽어 푸는 문제은행입니다. 정답은 제출 전 브라우저에 전달하지 않습니다.</p>
        </section>

        <QuestionBankSummary courseSlug={courseSlug} totalQuestions={catalog.totalQuestions} />

        <section className="moduleGrid" aria-label="Question sets">
          {catalog.sets.map((set) => (
            <Link className="moduleCard" href={`/questions/${courseSlug}/${set.slug}`} key={set.slug}>
              <span className="code">{set.code}</span>
              <h2>{set.firstQuestionId}–{set.lastQuestionId}</h2>
              <p>{set.questionCount} questions · {set.slug}</p>
            </Link>
          ))}
        </section>
      </main>
    );
  } catch (error) {
    if (error instanceof ContentNotFoundError) notFound();
    throw error;
  }
}
