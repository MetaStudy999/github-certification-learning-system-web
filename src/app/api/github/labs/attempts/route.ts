import { NextResponse } from "next/server";

import { getSupabaseAdminClient, verifySupabaseAccessToken } from "@/lib/supabase/server";
import { listGitHubLabAttempts } from "@/modules/github-labs/verification-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "authentication required" }, { status: 401 });
  try {
    const user = await verifySupabaseAccessToken(token);
    return NextResponse.json({ attempts: await listGitHubLabAttempts(getSupabaseAdminClient(), user.id) });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid access token") return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
