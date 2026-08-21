import type { SupabaseClient } from "@supabase/supabase-js";

import { getReadinessSnapshot } from "@/modules/readiness/readiness-service";
import type { EvidenceGateItem, EvidencePackageStatus, EvidencePackageView, EvidenceSnapshot, ManualEvidenceType } from "./types";

const PACKAGE_VERSION = "p10-gh900-v1";
const COURSE = "001-foundations";
const MANUAL_TYPES: ManualEvidenceType[] = ["ENVIRONMENT", "LAB_LOCAL", "REPOSITORY_DOCS", "PROJECT", "EXAM", "REFLECTION"];

function latestByQuestion(rows: Array<{ question_id: string; is_correct: boolean; attempted_at: string }>) {
  const map = new Map<string, { is_correct: boolean; attempted_at: string }>();
  for (const row of rows) if (!map.has(row.question_id)) map.set(row.question_id, row);
  return [...map.values()];
}

function latestManual(rows: any[], type: ManualEvidenceType) {
  return rows.find((row) => row.evidence_type === type);
}

function latestLab(rows: any[], slug: string) {
  return rows.find((row) => row.lab_slug === slug);
}

export async function createManualEvidence(admin: SupabaseClient, userId: string, input: {
  evidenceType: ManualEvidenceType; title: string; what: string; why: string; verify: string; result: string;
  canonicalUrl?: string | null; scorePercent?: number | null; confirmed?: boolean; occurredAt?: string | null;
}) {
  if (!MANUAL_TYPES.includes(input.evidenceType)) throw new Error("unsupported evidence type");
  const { data, error } = await admin.from("manual_evidence_records").insert({
    user_id: userId, course_slug: COURSE, evidence_type: input.evidenceType, title: input.title,
    what_text: input.what, why_text: input.why, verify_text: input.verify, result_text: input.result,
    canonical_url: input.canonicalUrl ?? null, score_percent: input.scorePercent ?? null,
    confirmed: Boolean(input.confirmed), occurred_at: input.occurredAt ?? null,
  }).select("id,evidence_type,title,confirmed,score_percent,canonical_url,created_at").single();
  if (error) throw error;
  return data;
}

export async function generateEvidencePackage(admin: SupabaseClient, userId: string): Promise<EvidencePackageView> {
  const [profileResult, courseResult, questionResult, wrongResult, mockResult, labResult, checkResult, aiResult, manualResult] = await Promise.all([
    admin.from("learner_profiles").select("display_name").eq("id", userId).maybeSingle(),
    admin.from("course_progress").select("status,total_modules,completed_modules").eq("user_id", userId).eq("course_slug", COURSE).maybeSingle(),
    admin.from("question_attempts").select("question_id,is_correct,attempted_at").eq("user_id", userId).eq("course_slug", COURSE).eq("source_kind", "QUESTION_BANK").order("attempted_at", { ascending: false }),
    admin.from("wrong_answer_items").select("status").eq("user_id", userId).eq("course_slug", COURSE),
    admin.from("mock_exam_attempts").select("mock_slug,score_percent,submitted_at,status").eq("user_id", userId).eq("course_slug", COURSE).eq("status", "SUBMITTED").order("submitted_at", { ascending: false }),
    admin.from("lab_attempts").select("id,lab_slug,status,repository_full_name,verified_at").eq("user_id", userId).eq("course_slug", COURSE).order("verified_at", { ascending: false }),
    admin.from("lab_verification_checks").select("attempt_id,canonical_url,status,check_code").eq("user_id", userId).eq("status", "PASS").not("canonical_url", "is", null).order("checked_at", { ascending: false }),
    admin.from("ai_interactions").select("rag_grounded").eq("user_id", userId).eq("course_slug", COURSE),
    admin.from("manual_evidence_records").select("id,evidence_type,title,confirmed,score_percent,canonical_url,what_text,why_text,verify_text,result_text,updated_at").eq("user_id", userId).eq("course_slug", COURSE).order("updated_at", { ascending: false }),
  ]);
  for (const result of [profileResult, courseResult, questionResult, wrongResult, mockResult, labResult, checkResult, aiResult, manualResult]) if (result.error) throw result.error;

  const attempts = latestByQuestion((questionResult.data ?? []) as any[]);
  const answeredQuestions = attempts.length;
  const latestAccuracyPercent = answeredQuestions ? Math.round((attempts.filter((row) => row.is_correct).length / answeredQuestions) * 100) : null;
  const wrongRows = wrongResult.data ?? [];
  const mockRows = (mockResult.data ?? []) as any[];
  const score = (slug: string) => mockRows.find((row) => row.mock_slug === slug)?.score_percent ?? null;
  const labs = (labResult.data ?? []) as any[];
  const manual = (manualResult.data ?? []) as any[];
  const readiness = await getReadinessSnapshot(admin, userId, COURSE);

  const mEnvironment = latestManual(manual, "ENVIRONMENT");
  const mLocalLab = latestManual(manual, "LAB_LOCAL");
  const mDocs = latestManual(manual, "REPOSITORY_DOCS");
  const mProject = latestManual(manual, "PROJECT");
  const mExam = latestManual(manual, "EXAM");
  const mReflection = latestManual(manual, "REFLECTION");
  const lab020 = latestLab(labs, "020-remote-repository");
  const lab030 = latestLab(labs, "030-branch-workflow");
  const lab040 = latestLab(labs, "040-github-flow");
  const mocksPass = Number(score("010-mock-01")) >= 85 && Number(score("020-mock-02")) >= 85 && Number(score("030-final-mock")) >= 90;
  const projectPass = Boolean(mProject?.confirmed) && Number(mProject?.score_percent ?? 0) >= 90;

  const gate: EvidenceGateItem[] = [
    { key: "environment", label: "Environment", pass: Boolean(mEnvironment?.confirmed), source: "SELF_ATTESTED", reason: mEnvironment?.confirmed ? "환경 Evidence 확인" : "환경 Evidence를 확인해 주세요." },
    { key: "labLocal", label: "Git Basics / Local Lab", pass: Boolean(mLocalLab?.confirmed), source: "SELF_ATTESTED", reason: mLocalLab?.confirmed ? "Local Git Lab 기록 확인" : "Local Git Lab 기록이 필요합니다." },
    { key: "githubLabs", label: "Remote / Branch / GitHub Flow", pass: [lab020, lab030, lab040].every((row) => row?.status === "PASS"), source: "SYSTEM_VERIFIED", reason: "P9 GitHub API 검증 020·030·040" },
    { key: "repositoryDocs", label: "Repository Documentation", pass: Boolean(mDocs?.confirmed), source: "SELF_ATTESTED", reason: mDocs?.confirmed ? "Repository Docs 기록 확인" : "Repository Docs Evidence가 필요합니다." },
    { key: "practice", label: "Q001–Q100 Practice", pass: answeredQuestions >= 100, source: "SYSTEM_VERIFIED", reason: `${answeredQuestions}/100 문항 최근 답안 확보` },
    { key: "mocks", label: "Mock 01 / 02 / Final", pass: mocksPass, source: "SYSTEM_VERIFIED", reason: `Mock ${score("010-mock-01") ?? "-"}% · ${score("020-mock-02") ?? "-"}% · Final ${score("030-final-mock") ?? "-"}%` },
    { key: "project", label: "Project 90+ + Evidence", pass: projectPass, source: "SELF_ATTESTED", reason: projectPass ? `Project ${mProject.score_percent}%` : "90점 이상 Project Evidence가 필요합니다." },
    { key: "exam", label: "Certification Exam Result", pass: Boolean(mExam?.confirmed), source: "SELF_ATTESTED", reason: mExam?.confirmed ? "시험 결과 기록 확인" : "실제 시험 결과 Evidence가 필요합니다." },
    { key: "reflection", label: "Final Reflection", pass: Boolean(mReflection?.confirmed), source: "SELF_ATTESTED", reason: mReflection?.confirmed ? "최종 회고 확인" : "최종 회고 Evidence가 필요합니다." },
  ];
  const passed = gate.filter((item) => item.pass).length;
  const completenessPercent = Math.round((passed / gate.length) * 100);
  const status: EvidencePackageStatus = passed === gate.length ? "CLEAR_CANDIDATE" : passed >= 6 ? "READY" : "DRAFT";
  const generatedAt = new Date().toISOString();
  const aiRows = aiResult.data ?? [];
  const course = courseResult.data;
  const snapshot: EvidenceSnapshot = {
    generatedAt,
    learner: { displayName: profileResult.data?.display_name ?? "Learner" },
    progress: { completedModules: course?.completed_modules ?? 0, totalModules: course?.total_modules ?? 15, status: course?.status ?? "not_started" },
    practice: { answeredQuestions, latestAccuracyPercent },
    wrongAnswers: { open: wrongRows.filter((row: any) => row.status === "OPEN").length, closed: wrongRows.filter((row: any) => row.status === "CLOSED").length },
    mocks: { mock01: score("010-mock-01"), mock02: score("020-mock-02"), finalMock: score("030-final-mock") },
    readiness: { status: readiness.status, readinessPercent: readiness.readinessPercent },
    ai: { interactions: aiRows.length, groundedInteractions: aiRows.filter((row: any) => row.rag_grounded).length },
    labs: labs.slice(0, 20).map((row) => ({ labSlug: row.lab_slug, status: row.status, repositoryFullName: row.repository_full_name, verifiedAt: row.verified_at })),
    manualEvidence: manual.map((row) => ({ id: row.id, evidenceType: row.evidence_type, title: row.title, confirmed: row.confirmed, scorePercent: row.score_percent, canonicalUrl: row.canonical_url })),
  };

  const { data: packageRow, error: packageError } = await admin.from("evidence_packages").upsert({
    user_id: userId, course_slug: COURSE, package_version: PACKAGE_VERSION, status, completeness_percent: completenessPercent, gate, snapshot, generated_at: generatedAt,
  }, { onConflict: "user_id,course_slug" }).select("id").single();
  if (packageError) throw packageError;
  const packageId = packageRow.id as string;
  const { error: deleteError } = await admin.from("evidence_items").delete().eq("package_id", packageId);
  if (deleteError) throw deleteError;

  const canonicalChecks = (checkResult.data ?? []) as any[];
  const items: any[] = gate.map((item) => ({
    package_id: packageId, user_id: userId, category: item.key, source_type: item.source,
    status: item.pass ? "PASS" : "MISSING", title: item.label, summary: item.reason,
    canonical_url: null, metadata: { gate: true },
  }));
  for (const check of canonicalChecks.slice(0, 20)) items.push({
    package_id: packageId, user_id: userId, category: "githubEvidence", source_type: "SYSTEM_VERIFIED", source_id: check.attempt_id,
    status: "INFO", title: check.check_code, summary: "P9 canonical GitHub Evidence", canonical_url: check.canonical_url, metadata: {},
  });
  for (const row of manual) items.push({
    package_id: packageId, user_id: userId, category: row.evidence_type, source_type: "SELF_ATTESTED", source_id: row.id,
    status: row.confirmed ? "PASS" : "INFO", title: row.title,
    summary: `${row.what_text} · ${row.verify_text} · ${row.result_text}`, canonical_url: row.canonical_url, metadata: { scorePercent: row.score_percent },
  });
  if (items.length) { const { error } = await admin.from("evidence_items").insert(items); if (error) throw error; }
  return getEvidencePackage(admin, userId);
}

export async function getEvidencePackage(admin: SupabaseClient, userId: string): Promise<EvidencePackageView> {
  const { data: pkg, error } = await admin.from("evidence_packages").select("id,course_slug,package_version,status,completeness_percent,gate,snapshot,generated_at").eq("user_id", userId).eq("course_slug", COURSE).maybeSingle();
  if (error) throw error;
  if (!pkg) throw new Error("evidence package not generated");
  const { data: items, error: itemError } = await admin.from("evidence_items").select("category,source_type,status,title,summary,canonical_url,metadata").eq("package_id", pkg.id).order("created_at", { ascending: true });
  if (itemError) throw itemError;
  return {
    id: pkg.id, courseSlug: pkg.course_slug, packageVersion: pkg.package_version, status: pkg.status,
    completenessPercent: pkg.completeness_percent, gate: pkg.gate, snapshot: pkg.snapshot, generatedAt: pkg.generated_at,
    items: (items ?? []).map((row: any) => ({ category: row.category, sourceType: row.source_type, status: row.status, title: row.title, summary: row.summary, canonicalUrl: row.canonical_url, metadata: row.metadata ?? {} })),
  } as EvidencePackageView;
}

export function evidencePackageMarkdown(pkg: EvidencePackageView): string {
  const s = pkg.snapshot;
  const lines = [
    `# GH-900 Evidence Portfolio — ${s.learner.displayName}`,
    "", `- Status: **${pkg.status}**`, `- Completeness: **${pkg.completenessPercent}%**`, `- Generated: ${pkg.generatedAt}`,
    "", "## Learning Metrics", `- Modules: ${s.progress.completedModules}/${s.progress.totalModules} (${s.progress.status})`,
    `- Question Bank: ${s.practice.answeredQuestions}/100 · Accuracy ${s.practice.latestAccuracyPercent ?? "-"}%`,
    `- Mock 01 / 02 / Final: ${s.mocks.mock01 ?? "-"}% / ${s.mocks.mock02 ?? "-"}% / ${s.mocks.finalMock ?? "-"}%`,
    `- Exam Readiness: ${s.readiness.status} (${s.readiness.readinessPercent}%)`,
    `- Wrong Answers: OPEN ${s.wrongAnswers.open} / CLOSED ${s.wrongAnswers.closed}`,
    `- AI Tutor: ${s.ai.interactions} interactions · ${s.ai.groundedInteractions} RAG-grounded`,
    "", "## CLEAR Candidate Gate",
    ...pkg.gate.map((g) => `- [${g.pass ? "x" : " "}] ${g.label} — ${g.source} — ${g.reason}`),
    "", "## GitHub Evidence",
    ...pkg.items.filter((item) => item.canonicalUrl).map((item) => `- [${item.title}](${item.canonicalUrl}) — ${item.summary}`),
    "", "> CLEAR_CANDIDATE는 GCLS 내부 Evidence 완성도 판정이며 실제 GitHub 자격증 합격 또는 자격 상태를 자동 확정하지 않습니다.", "",
  ];
  return lines.join("\n");
}
