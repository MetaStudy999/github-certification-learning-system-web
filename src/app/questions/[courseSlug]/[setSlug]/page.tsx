import Link from "next/link";
import { notFound } from "next/navigation";

import { QuestionSetPlayer } from "@/components/questions/question-set-player";
import { ContentNotFoundError } from "@/modules/content/core/provider";
import { getQuestionSet, toPublicQuestion } from "@/modules/question-bank/question-bank-service";

export const dynamic = "force-dynamic";

export default async function QuestionSetPage({ params }: { params: Promise<{ courseSlug: string; setSlug: string }> }) {
  const { courseSlug, setSlug } = await params;
  try {
    const set = await getQuestionSet(courseSlug, setSlug);
    return (
      <main className="shell learningShell">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href={`/questions/${courseSlug}`}>Question Bank</Link><span>/</span><span>{set.code}</span></nav>
        <section className="learningHeader">
          <div><p className="eyebrow">{set.code} · Provider {set.provider}</p><h1>{set.title}</h1></div>
          <a className="sourceLink" href={set.sourceUrl} target="_blank" rel="noreferrer">GitHub 원문 보기</a>
        </section>
        <QuestionSetPlayer courseSlug={courseSlug} setSlug={setSlug} questions={set.questions.map(toPublicQuestion)} />
      </main>
    );
  } catch (error) {
    if (error instanceof ContentNotFoundError) notFound();
    throw error;
  }
}
