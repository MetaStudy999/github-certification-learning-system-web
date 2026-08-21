import { NextResponse } from "next/server";

import { getSupabaseAdminClient, verifySupabaseAccessToken } from "@/lib/supabase/server";
import { submitMockAttempt } from "@/modules/mock-exams/mock-attempt-service";

interface RouteProps {
  params: Promise<{ attemptId: string }>;
}

export async function POST(request: Request, { params }: RouteProps) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "authentication required" }, { status: 401 });

  let body: { selections?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const selections = body.selections;
  if (!selections || typeof selections !== "object" || Array.isArray(selections)) {
    return NextResponse.json({ error: "selections object is required" }, { status: 400 });
  }

  const { attemptId } = await params;
  try {
    const user = await verifySupabaseAccessToken(token);
    const result = await submitMockAttempt(getSupabaseAdminClient(), user.id, attemptId, selections);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "invalid access token") {
      return NextResponse.json({ error: "invalid access token" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Error && (error.message.includes("must be answered") || error.message.includes("valid answer") || error.message.includes("already submitted"))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
