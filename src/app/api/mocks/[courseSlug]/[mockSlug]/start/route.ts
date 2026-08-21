import { NextResponse } from "next/server";

import { getSupabaseAdminClient, verifySupabaseAccessToken } from "@/lib/supabase/server";
import { startMockAttempt } from "@/modules/mock-exams/mock-attempt-service";
import { ContentNotFoundError } from "@/modules/content/core/provider";

interface RouteProps {
  params: Promise<{ courseSlug: string; mockSlug: string }>;
}

export async function POST(request: Request, { params }: RouteProps) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "authentication required" }, { status: 401 });

  const { courseSlug, mockSlug } = await params;
  try {
    const user = await verifySupabaseAccessToken(token);
    const attempt = await startMockAttempt(getSupabaseAdminClient(), user.id, courseSlug, mockSlug);
    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    if (error instanceof ContentNotFoundError) return NextResponse.json({ error: error.message }, { status: 404 });
    if (error instanceof Error && error.message === "invalid access token") {
      return NextResponse.json({ error: "invalid access token" }, { status: 401 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
