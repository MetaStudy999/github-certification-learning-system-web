import Link from "next/link";
import { notFound } from "next/navigation";

import { getCourse } from "@/modules/content/content-service";
import { ContentNotFoundError } from "@/modules/content/core/provider";

export const dynamic = "force-dynamic";

interface CoursePageProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseSlug } = await params;

  try {
    const { course, modules, provider } = await getCourse(courseSlug);

    return (
      <main className="shell">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/courses">Courses</Link><span>/</span><span>{course.exam}</span></nav>

        <section className="hero compactHero">
          <p className="eyebrow">{course.code} · {course.exam}</p>
          <h1>{course.title}</h1>
          <p className="lead">Content Provider: <strong>{provider}</strong> · {modules.length} modules</p>
        </section>

        <section className="moduleGrid" aria-label={`${course.title} modules`}>
          {modules.map((module) => (
            <Link className="moduleCard" href={`/courses/${course.slug}/${module.slug}`} key={module.slug}>
              <span className="code">{module.code}</span>
              <h2>{module.label}</h2>
              <p>{module.slug}</p>
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
