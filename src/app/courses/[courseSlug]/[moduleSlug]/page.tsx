import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownDocument } from "@/components/content/markdown-document";
import { ModuleProgressPanel } from "@/components/progress/module-progress-panel";
import { getAdjacentModules, getCourse, getCourseModule } from "@/modules/content/content-service";
import { ContentNotFoundError } from "@/modules/content/core/provider";

export const dynamic = "force-dynamic";

interface ModulePageProps {
  params: Promise<{ courseSlug: string; moduleSlug: string }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { courseSlug, moduleSlug } = await params;

  try {
    const [module, adjacent, courseData] = await Promise.all([
      getCourseModule(courseSlug, moduleSlug),
      getAdjacentModules(courseSlug, moduleSlug),
      getCourse(courseSlug),
    ]);

    return (
      <main className="shell learningShell">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/courses">Courses</Link><span>/</span><Link href={`/courses/${courseSlug}`}>GH-900</Link><span>/</span><span>{module.code}</span></nav>

        <section className="learningHeader">
          <div>
            <p className="eyebrow">{module.code} · Provider {module.provider}</p>
            <h1>{module.title}</h1>
          </div>
          <a className="sourceLink" href={module.sourceUrl} target="_blank" rel="noreferrer">GitHub 원문 보기</a>
        </section>

        <ModuleProgressPanel courseSlug={courseSlug} moduleSlug={moduleSlug} totalModules={courseData.modules.length} />
        <MarkdownDocument markdown={module.markdown} sourcePath={module.sourcePath} />

        <nav className="lessonPager" aria-label="Module navigation">
          {adjacent.previous ? <Link href={`/courses/${courseSlug}/${adjacent.previous.slug}`}>← {adjacent.previous.label}</Link> : <span />}
          {adjacent.next ? <Link href={`/courses/${courseSlug}/${adjacent.next.slug}`}>{adjacent.next.label} →</Link> : <span />}
        </nav>
      </main>
    );
  } catch (error) {
    if (error instanceof ContentNotFoundError) notFound();
    throw error;
  }
}
