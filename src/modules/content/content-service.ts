import { posix } from "node:path";

import { ContentNotFoundError } from "./core/provider";
import type { CourseDefinition, CourseModule, CourseModuleDocument } from "./core/types";
import { createContentProvider } from "./provider-factory";

const COURSES: CourseDefinition[] = [
  {
    slug: "001-foundations",
    code: "001",
    title: "GitHub Foundations",
    exam: "GH-900",
    level: "Beginner",
  },
];

const MODULE_LABELS: Record<string, string> = {
  overview: "개요 · Overview",
  terms: "용어 · Terms",
  concepts: "개념 · Concepts",
  "official-docs": "공식 문서 · Official Docs",
  guides: "가이드 · Guides",
  labs: "실습 · Labs",
  exercises: "연습문제 · Exercises",
  "question-bank": "문제은행 · Question Bank",
  "final-review": "최종 복습 · Final Review",
  projects: "프로젝트 · Projects",
  "mock-exams": "모의고사 · Mock Exams",
  "wrong-answers": "오답 관리 · Wrong Answers",
  progress: "진행 현황 · Progress",
  resources: "자료 · Resources",
  evidence: "증빙 · Evidence",
};

function titleFromMarkdown(markdown: string, fallback: string) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallback;
}

function getCourseDefinition(courseSlug: string) {
  const course = COURSES.find((item) => item.slug === courseSlug);
  if (!course) throw new ContentNotFoundError(`Unsupported course: ${courseSlug}`);
  return course;
}

export function listCourses() {
  return COURSES;
}

export async function getCourse(courseSlug: string) {
  const course = getCourseDefinition(courseSlug);
  const modules = await listCourseModules(courseSlug);
  return { course, modules, provider: createContentProvider().id };
}

export async function listCourseModules(courseSlug: string): Promise<CourseModule[]> {
  getCourseDefinition(courseSlug);
  const provider = createContentProvider();
  const entries = await provider.list(courseSlug);

  return entries
    .filter((entry) => entry.type === "directory" && /^\d{3}-[a-z0-9-]+$/.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => {
      const [code, ...parts] = entry.name.split("-");
      const key = parts.join("-");
      return {
        slug: entry.name,
        code,
        label: MODULE_LABELS[key] ?? key.replaceAll("-", " "),
        path: entry.path,
      };
    });
}

export async function getCourseModule(courseSlug: string, moduleSlug: string): Promise<CourseModuleDocument> {
  const modules = await listCourseModules(courseSlug);
  const module = modules.find((item) => item.slug === moduleSlug);
  if (!module) throw new ContentNotFoundError(`Unknown module ${courseSlug}/${moduleSlug}`);

  const provider = createContentProvider();
  const sourcePath = posix.join(module.path, "README.md");
  const document = await provider.readText(sourcePath);

  return {
    ...module,
    title: titleFromMarkdown(document.content, module.label),
    markdown: document.content,
    provider: document.provider,
    sourceUrl: document.sourceUrl,
    sourcePath,
  };
}

export async function getAdjacentModules(courseSlug: string, moduleSlug: string) {
  const modules = await listCourseModules(courseSlug);
  const index = modules.findIndex((item) => item.slug === moduleSlug);
  if (index < 0) throw new ContentNotFoundError(`Unknown module ${courseSlug}/${moduleSlug}`);
  return {
    previous: index > 0 ? modules[index - 1] : null,
    next: index < modules.length - 1 ? modules[index + 1] : null,
  };
}

export async function getContentHealth() {
  const provider = createContentProvider();
  const modules = await listCourseModules("001-foundations");
  return {
    status: modules.length === 15 ? "ok" : "degraded",
    provider: provider.id,
    course: "001-foundations",
    exam: "GH-900",
    moduleCount: modules.length,
  };
}
