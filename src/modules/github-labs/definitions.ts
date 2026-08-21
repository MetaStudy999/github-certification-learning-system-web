import type { GitHubLabSlug } from "./types";

export interface GitHubLabDefinition {
  slug: GitHubLabSlug;
  code: string;
  title: string;
  sourcePath: string;
  verification: string;
}

export const GITHUB_LAB_DEFINITIONS: GitHubLabDefinition[] = [
  {
    slug: "020-remote-repository",
    code: "020",
    title: "Remote Repository",
    sourcePath: "001-foundations/060-labs/020-remote-repository/README.md",
    verification: "Repository + default branch가 GitHub API에서 조회되는지 확인",
  },
  {
    slug: "030-branch-workflow",
    code: "030",
    title: "Branch Workflow",
    sourcePath: "001-foundations/060-labs/030-branch-workflow/README.md",
    verification: "기본 Branch와 분리된 작업 Branch가 존재하는지 확인",
  },
  {
    slug: "040-github-flow",
    code: "040",
    title: "GitHub Flow",
    sourcePath: "001-foundations/060-labs/040-github-flow/README.md",
    verification: "Issue → Branch → Commit → Pull Request → Issue Link 흐름 확인",
  },
  {
    slug: "080-modern-development",
    code: "080",
    title: "Modern Development",
    sourcePath: "001-foundations/060-labs/080-modern-development/README.md",
    verification: "Repository에 GitHub Actions Workflow가 존재하는지 확인",
  },
];
