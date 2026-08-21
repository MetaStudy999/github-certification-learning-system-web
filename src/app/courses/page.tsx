import Link from "next/link";

import { listCourses } from "@/modules/content/content-service";

export default function CoursesPage() {
  const courses = listCourses();

  return (
    <main className="shell">
      <section className="hero compactHero">
        <p className="eyebrow">Learning Content</p>
        <h1>Courses</h1>
        <p className="lead">메인 GCLS 콘텐츠 저장소를 Source of Truth로 사용하는 학습 과정입니다.</p>
      </section>

      <section className="grid">
        {courses.map((course) => (
          <Link className="card courseCard" href={`/courses/${course.slug}`} key={course.slug}>
            <span className="code">{course.code}</span>
            <h2>{course.title}</h2>
            <p>{course.exam} · {course.level}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
