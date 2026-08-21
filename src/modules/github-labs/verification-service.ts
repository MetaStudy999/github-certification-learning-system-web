import type { SupabaseClient } from "@supabase/supabase-js";

import { getGitHubClientForUser } from "./connection-service";
import { GitHubApiError, type GitHubRestClient } from "./github-client";
import type { GitHubLabVerifyInput, LabVerificationCheck, LabVerificationResult } from "./types";

const RULE_VERSION = "p9-gh900-v1";

function pass(checkCode: string, objectType: string, message: string, options: Partial<LabVerificationCheck> = {}): LabVerificationCheck {
  return { checkCode, objectType, status: "PASS", required: options.required ?? true, message, ...options };
}

function fail(checkCode: string, objectType: string, message: string, options: Partial<LabVerificationCheck> = {}): LabVerificationCheck {
  return { checkCode, objectType, status: "FAIL", required: options.required ?? true, message, ...options };
}

async function apiCheck(
  checkCode: string,
  objectType: string,
  work: () => Promise<LabVerificationCheck>,
  required = true,
): Promise<LabVerificationCheck> {
  try {
    return await work();
  } catch (error) {
    const message = error instanceof GitHubApiError
      ? error.message
      : error instanceof Error ? error.message : String(error);
    return fail(checkCode, objectType, message, { required });
  }
}

function closingIssuePattern(issueNumber: number): RegExp {
  return new RegExp(`\\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\\s+#${issueNumber}\\b`, "i");
}

async function verifyRemoteRepository(client: GitHubRestClient, input: GitHubLabVerifyInput) {
  const checks: LabVerificationCheck[] = [];
  let defaultBranch = "";
  const repo = await apiCheck("repository.exists", "repository", async () => {
    const value = await client.getRepository(input.repositoryFullName);
    defaultBranch = value.default_branch;
    return pass("repository.exists", "repository", `Repository ${value.full_name} 확인`, {
      objectId: value.full_name,
      canonicalUrl: value.html_url,
      metadata: { defaultBranch: value.default_branch, private: value.private },
    });
  });
  checks.push(repo);
  if (repo.status === "PASS" && defaultBranch) {
    checks.push(await apiCheck("repository.default_branch", "branch", async () => {
      const branch = await client.getBranch(input.repositoryFullName, defaultBranch);
      return pass("repository.default_branch", "branch", `기본 Branch ${defaultBranch} 확인`, {
        objectId: branch.name,
        metadata: { sha: branch.commit.sha, protected: branch.protected },
      });
    }));
  }
  return checks;
}

async function verifyBranchWorkflow(client: GitHubRestClient, input: GitHubLabVerifyInput) {
  const checks = await verifyRemoteRepository(client, input);
  const repoCheck = checks.find((item) => item.checkCode === "repository.exists");
  const defaultBranch = String(repoCheck?.metadata?.defaultBranch ?? "");
  const branchName = input.branchName?.trim();
  if (!branchName) {
    checks.push(fail("branch.input", "branch", "branchName이 필요합니다."));
    return checks;
  }
  checks.push(await apiCheck("branch.exists", "branch", async () => {
    const branch = await client.getBranch(input.repositoryFullName, branchName);
    return pass("branch.exists", "branch", `작업 Branch ${branchName} 확인`, {
      objectId: branchName,
      metadata: { sha: branch.commit.sha, protected: branch.protected },
    });
  }));
  checks.push(branchName !== defaultBranch
    ? pass("branch.separated", "branch", `작업 Branch가 기본 Branch ${defaultBranch}와 분리되어 있습니다.`, { objectId: branchName })
    : fail("branch.separated", "branch", "작업 Branch는 기본 Branch와 달라야 합니다.", { objectId: branchName }));
  return checks;
}

async function verifyGitHubFlow(client: GitHubRestClient, input: GitHubLabVerifyInput) {
  const checks = await verifyBranchWorkflow(client, input);
  const branchName = input.branchName?.trim();
  const commitSha = input.commitSha?.trim();
  const issueNumber = input.issueNumber;
  const prNumber = input.pullRequestNumber;

  if (!issueNumber || issueNumber < 1) checks.push(fail("issue.input", "issue", "issueNumber가 필요합니다."));
  else checks.push(await apiCheck("issue.exists", "issue", async () => {
    const issue = await client.getIssue(input.repositoryFullName, issueNumber);
    if (issue.pull_request) return fail("issue.exists", "issue", `#${issueNumber}은 Issue가 아니라 Pull Request입니다.`);
    return pass("issue.exists", "issue", `Issue #${issue.number} 확인`, {
      objectId: String(issue.number), canonicalUrl: issue.html_url, metadata: { state: issue.state },
    });
  }));

  if (!commitSha) checks.push(fail("commit.input", "commit", "commitSha가 필요합니다."));
  else {
    checks.push(await apiCheck("commit.exists", "commit", async () => {
      const commit = await client.getCommit(input.repositoryFullName, commitSha);
      return pass("commit.exists", "commit", `Commit ${commit.sha.slice(0, 7)} 확인`, {
        objectId: commit.sha, canonicalUrl: commit.html_url,
      });
    }));
    if (branchName) {
      checks.push(await apiCheck("commit.on_branch", "commit", async () => {
        const comparison = await client.compareCommitToBranch(input.repositoryFullName, commitSha, branchName);
        const isAncestor = comparison.status === "ahead" || comparison.status === "identical";
        return isAncestor
          ? pass("commit.on_branch", "commit", `Commit이 ${branchName} Branch 이력에 포함됩니다.`, { objectId: commitSha, metadata: comparison })
          : fail("commit.on_branch", "commit", `Commit이 ${branchName} Branch 이력에 포함되지 않습니다.`, { objectId: commitSha, metadata: comparison });
      }));
    }
  }

  if (!prNumber || prNumber < 1) checks.push(fail("pull_request.input", "pull_request", "pullRequestNumber가 필요합니다."));
  else checks.push(await apiCheck("pull_request.flow", "pull_request", async () => {
    const pr = await client.getPullRequest(input.repositoryFullName, prNumber);
    const repoCheck = checks.find((item) => item.checkCode === "repository.exists");
    const defaultBranch = String(repoCheck?.metadata?.defaultBranch ?? "");
    const headOk = Boolean(branchName) && pr.head.ref === branchName;
    const baseOk = Boolean(defaultBranch) && pr.base.ref === defaultBranch;
    const issueLinkOk = Boolean(issueNumber) && closingIssuePattern(issueNumber).test(pr.body ?? "");
    const stateOk = pr.state === "open" || pr.merged || pr.merged_at !== null;
    const ok = headOk && baseOk && issueLinkOk && stateOk;
    const metadata = { head: pr.head.ref, base: pr.base.ref, merged: pr.merged, state: pr.state, issueLinkOk };
    return ok
      ? pass("pull_request.flow", "pull_request", `PR #${pr.number}이 Branch/Base/Issue 연결 규칙을 충족합니다.`, { objectId: String(pr.number), canonicalUrl: pr.html_url, metadata })
      : fail("pull_request.flow", "pull_request", `PR #${pr.number}의 Branch/Base/Closes #Issue 연결을 다시 확인하세요.`, { objectId: String(pr.number), canonicalUrl: pr.html_url, metadata });
  }));

  return checks;
}

async function verifyActions(client: GitHubRestClient, input: GitHubLabVerifyInput) {
  const checks = await verifyRemoteRepository(client, input);
  checks.push(await apiCheck("actions.workflow", "workflow", async () => {
    const workflows = await client.listWorkflows(input.repositoryFullName);
    const first = workflows.workflows[0];
    if (workflows.total_count < 1 || !first) return fail("actions.workflow", "workflow", "Repository에서 GitHub Actions Workflow를 찾지 못했습니다.");
    return pass("actions.workflow", "workflow", `${workflows.total_count}개 Workflow 확인`, {
      objectId: String(first.id), canonicalUrl: first.html_url, metadata: { name: first.name, path: first.path, totalCount: workflows.total_count },
    });
  }));
  checks.push(await apiCheck("actions.run", "workflow_run", async () => {
    const runs = await client.listWorkflowRuns(input.repositoryFullName);
    const first = runs.workflow_runs[0];
    if (!first) return fail("actions.run", "workflow_run", "실행 이력이 아직 없습니다. Workflow 관찰은 가능하지만 실행 증거는 추가하는 것을 권장합니다.", { required: false, metadata: { totalCount: runs.total_count } });
    return pass("actions.run", "workflow_run", `최근 Workflow Run ${first.id} 확인`, {
      required: false, objectId: String(first.id), canonicalUrl: first.html_url,
      metadata: { name: first.name, status: first.status, conclusion: first.conclusion },
    });
  }, false));
  return checks;
}

export async function verifyGitHubLab(
  admin: SupabaseClient,
  userId: string,
  input: GitHubLabVerifyInput,
): Promise<LabVerificationResult> {
  if (input.courseSlug !== "001-foundations") throw new Error("P9 currently supports 001-foundations only");
  const client = await getGitHubClientForUser(admin, userId);
  const checks = input.labSlug === "020-remote-repository"
    ? await verifyRemoteRepository(client, input)
    : input.labSlug === "030-branch-workflow"
      ? await verifyBranchWorkflow(client, input)
      : input.labSlug === "040-github-flow"
        ? await verifyGitHubFlow(client, input)
        : await verifyActions(client, input);

  const status = checks.some((item) => item.required && item.status === "FAIL") ? "RETRY" : "PASS";
  const verifiedAt = new Date().toISOString();
  const { data: attempt, error: attemptError } = await admin.from("lab_attempts").insert({
    user_id: userId,
    course_slug: input.courseSlug,
    lab_slug: input.labSlug,
    repository_full_name: input.repositoryFullName,
    status,
    rule_version: RULE_VERSION,
    summary: {
      branchName: input.branchName ?? null,
      commitSha: input.commitSha ?? null,
      issueNumber: input.issueNumber ?? null,
      pullRequestNumber: input.pullRequestNumber ?? null,
      requiredPass: checks.filter((item) => item.required && item.status === "PASS").length,
      requiredTotal: checks.filter((item) => item.required).length,
    },
    verified_at: verifiedAt,
  }).select("id").single();
  if (attemptError) throw attemptError;

  const rows = checks.map((item) => ({
    attempt_id: attempt.id,
    user_id: userId,
    check_code: item.checkCode,
    object_type: item.objectType,
    object_id: item.objectId ?? null,
    status: item.status,
    message: item.message,
    canonical_url: item.canonicalUrl ?? null,
    metadata: { ...(item.metadata ?? {}), required: item.required },
    checked_at: verifiedAt,
  }));
  if (rows.length > 0) {
    const { error: checksError } = await admin.from("lab_verification_checks").insert(rows);
    if (checksError) throw checksError;
  }

  return {
    attemptId: attempt.id,
    courseSlug: input.courseSlug,
    labSlug: input.labSlug,
    repositoryFullName: input.repositoryFullName,
    status,
    ruleVersion: RULE_VERSION,
    verifiedAt,
    checks,
  };
}

export async function listGitHubLabAttempts(admin: SupabaseClient, userId: string) {
  const { data: attempts, error } = await admin
    .from("lab_attempts")
    .select("id,course_slug,lab_slug,repository_full_name,status,rule_version,summary,verified_at")
    .eq("user_id", userId)
    .order("verified_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  const ids = (attempts ?? []).map((item) => item.id);
  if (ids.length === 0) return [];
  const { data: checks, error: checksError } = await admin
    .from("lab_verification_checks")
    .select("attempt_id,check_code,object_type,object_id,status,message,canonical_url,metadata,checked_at")
    .eq("user_id", userId)
    .in("attempt_id", ids)
    .order("checked_at", { ascending: true });
  if (checksError) throw checksError;
  return (attempts ?? []).map((attempt) => ({
    ...attempt,
    checks: (checks ?? []).filter((check) => check.attempt_id === attempt.id),
  }));
}
