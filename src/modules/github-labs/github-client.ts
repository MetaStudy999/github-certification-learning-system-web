export class GitHubApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "GitHubApiError";
  }
}

function apiBaseUrl(): string {
  return (process.env.GITHUB_API_BASE_URL ?? "https://api.github.com").replace(/\/$/, "");
}

function repositoryParts(fullName: string): { owner: string; repo: string } {
  const match = fullName.trim().match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (!match) throw new Error("repositoryFullName must be owner/repository");
  return { owner: match[1], repo: match[2] };
}

export class GitHubRestClient {
  constructor(private readonly token: string) {}

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${this.token}`,
        "x-github-api-version": "2022-11-28",
        "user-agent": "gcls-web-p9",
      },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) {
      let detail = `GitHub API HTTP ${response.status}`;
      try {
        const payload = await response.json() as { message?: string };
        if (payload.message) detail += `: ${payload.message}`;
      } catch {}
      throw new GitHubApiError(response.status, detail);
    }
    return response.json() as Promise<T>;
  }

  getUser() {
    return this.request<{ login: string; html_url: string }>("/user");
  }

  getRepository(fullName: string) {
    const { owner, repo } = repositoryParts(fullName);
    return this.request<{ full_name: string; default_branch: string; html_url: string; private: boolean }>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    );
  }

  getBranch(fullName: string, branch: string) {
    const { owner, repo } = repositoryParts(fullName);
    return this.request<{ name: string; commit: { sha: string }; protected: boolean }>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches/${encodeURIComponent(branch)}`,
    );
  }

  getCommit(fullName: string, sha: string) {
    const { owner, repo } = repositoryParts(fullName);
    return this.request<{ sha: string; html_url: string }>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}`,
    );
  }

  compareCommitToBranch(fullName: string, commitSha: string, branch: string) {
    const { owner, repo } = repositoryParts(fullName);
    return this.request<{ status: "ahead" | "behind" | "diverged" | "identical"; ahead_by: number; behind_by: number }>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/compare/${encodeURIComponent(commitSha)}...${encodeURIComponent(branch)}`,
    );
  }

  getIssue(fullName: string, issueNumber: number) {
    const { owner, repo } = repositoryParts(fullName);
    return this.request<{ number: number; state: string; html_url: string; pull_request?: unknown }>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}`,
    );
  }

  getPullRequest(fullName: string, number: number) {
    const { owner, repo } = repositoryParts(fullName);
    return this.request<{
      number: number;
      state: string;
      merged: boolean;
      merged_at: string | null;
      html_url: string;
      body: string | null;
      head: { ref: string; sha: string };
      base: { ref: string };
    }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${number}`);
  }

  listWorkflows(fullName: string) {
    const { owner, repo } = repositoryParts(fullName);
    return this.request<{ total_count: number; workflows: Array<{ id: number; name: string; path: string; html_url: string }> }>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows?per_page=10`,
    );
  }

  listWorkflowRuns(fullName: string) {
    const { owner, repo } = repositoryParts(fullName);
    return this.request<{ total_count: number; workflow_runs: Array<{ id: number; name: string; status: string; conclusion: string | null; html_url: string }> }>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/runs?per_page=10`,
    );
  }
}
