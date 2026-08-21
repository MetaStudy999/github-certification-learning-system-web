import { NextResponse } from "next/server";

import { getSupabaseAdminClient, verifySupabaseAccessToken } from "@/lib/supabase/server";
import { connectGitHub, disconnectGitHub, getGitHubConnectionStatus, GitHubConnectionError } from "@/modules/github-labs/connection-service";

export const runtime = "nodejs";

function bearer(request: Request) {
  return request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null;
}

async function authenticatedUser(request: Request) {
  const token = bearer(request);
  if (!token) throw new GitHubConnectionError("authentication required");
  try {
    return await verifySupabaseAccessToken(token);
  } catch {
    throw new GitHubConnectionError("invalid access token");
  }
}

export async function GET(request: Request) {
  try {
    const user = await authenticatedUser(request);
    return NextResponse.json(await getGitHubConnectionStatus(getSupabaseAdminClient(), user.id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticatedUser(request);
    const body = await request.json() as { token?: string };
    if (!body.token) return NextResponse.json({ error: "token is required" }, { status: 400 });
    return NextResponse.json(await connectGitHub(getSupabaseAdminClient(), user.id, body.token));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes("access token") || message.includes("authentication required") ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await authenticatedUser(request);
    await disconnectGitHub(getSupabaseAdminClient(), user.id);
    return NextResponse.json({ connected: false });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 401 });
  }
}
