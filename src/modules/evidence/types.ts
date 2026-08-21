export type ManualEvidenceType = "ENVIRONMENT" | "LAB_LOCAL" | "REPOSITORY_DOCS" | "PROJECT" | "EXAM" | "REFLECTION";
export type EvidencePackageStatus = "DRAFT" | "READY" | "CLEAR_CANDIDATE";

export interface EvidenceGateItem {
  key: string;
  label: string;
  pass: boolean;
  source: "SYSTEM_VERIFIED" | "SELF_ATTESTED";
  reason: string;
}

export interface EvidenceSnapshot {
  generatedAt: string;
  learner: { displayName: string };
  progress: { completedModules: number; totalModules: number; status: string };
  practice: { answeredQuestions: number; latestAccuracyPercent: number | null };
  wrongAnswers: { open: number; closed: number };
  mocks: { mock01: number | null; mock02: number | null; finalMock: number | null };
  readiness: { status: string; readinessPercent: number };
  ai: { interactions: number; groundedInteractions: number };
  labs: Array<{ labSlug: string; status: string; repositoryFullName: string; verifiedAt: string }>;
  manualEvidence: Array<{ id: string; evidenceType: ManualEvidenceType; title: string; confirmed: boolean; scorePercent: number | null; canonicalUrl: string | null }>;
}

export interface EvidencePackageView {
  id: string;
  courseSlug: string;
  packageVersion: string;
  status: EvidencePackageStatus;
  completenessPercent: number;
  gate: EvidenceGateItem[];
  snapshot: EvidenceSnapshot;
  generatedAt: string;
  items: Array<{ category: string; sourceType: string; status: "PASS" | "MISSING" | "INFO"; title: string; summary: string; canonicalUrl: string | null; metadata: Record<string, unknown> }>;
}
