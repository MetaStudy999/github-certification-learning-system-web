export const GITHUB_LAB_SLUGS = [
  "020-remote-repository",
  "030-branch-workflow",
  "040-github-flow",
  "080-modern-development",
] as const;

export type GitHubLabSlug = (typeof GITHUB_LAB_SLUGS)[number];
export type LabVerificationStatus = "PASS" | "RETRY";
export type LabCheckStatus = "PASS" | "FAIL";

export interface GitHubConnectionStatus {
  connected: boolean;
  githubLogin?: string;
  connectionKind?: "fine_grained_pat" | "github_app_user";
  tokenFingerprint?: string;
  connectedAt?: string;
  lastVerifiedAt?: string;
}

export interface GitHubLabVerifyInput {
  courseSlug: string;
  labSlug: GitHubLabSlug;
  repositoryFullName: string;
  branchName?: string;
  commitSha?: string;
  issueNumber?: number;
  pullRequestNumber?: number;
}

export interface LabVerificationCheck {
  checkCode: string;
  objectType: string;
  objectId?: string;
  status: LabCheckStatus;
  required: boolean;
  message: string;
  canonicalUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface LabVerificationResult {
  attemptId: string;
  courseSlug: string;
  labSlug: GitHubLabSlug;
  repositoryFullName: string;
  status: LabVerificationStatus;
  ruleVersion: string;
  verifiedAt: string;
  checks: LabVerificationCheck[];
}
