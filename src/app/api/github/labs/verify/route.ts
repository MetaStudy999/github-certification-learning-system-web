import { NextResponse } from "next/server";

import { getSupabaseAdminClient, verifySupabaseAccessToken } from "@/lib/supabase/server";
import { GitHubConnectionError } from "@/modules/github-labs/connection-service";
import { GITHUB_LAB_SLUGS, type GitHubLabSlug, type GitHubLabVerifyInput } from "@/modules/github-labs/types";
import { verifyGitHubLab } from "@/modules/github-labs/verification-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "authentication required" }, { status: 401 });
  try {
    const user = await verifySupabaseAccessToken(token);
    const body = await request.json() as Partial<GitHubLabVerifyInput>;
    const labSlug = body.labSlug as GitHubLabSlug | undefined;
    if (!labSlug || !GITHUB_LAB_SLUGS.includes(labSlug)) return NextResponse.json({ error: "valid labSlug is required" }, { status: 400 });
    const repositoryFullName = body.repositoryFullName?.trim();
    if (!repositoryFullName) return NextResponse.json({ error: "repositoryFullName is required" }, { status: 400 });
    const result = await verifyGitHubLab(getSupabaseAdminClient(), user.id, {
      courseSlug: body.courseSlug ?? "001-foundations",
      labSlug,
      repositoryFullName,
      branchName: body.branchName,
      commitSha: body.commitSha,
      issueNumber: body.issueNumber,
      pullRequestNumber: body.pullRequestNumber,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GitHubConnectionError) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof Error && error.message === "invalid access token") return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
