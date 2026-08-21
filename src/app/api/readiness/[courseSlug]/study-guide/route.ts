import { NextResponse } from "next/server";

import { getSupabaseAdminClient, verifySupabaseAccessToken } from "@/lib/supabase/server";
import { confirmStudyGuide } from "@/modules/readiness/readiness-service";

export async function POST(request: Request, { params }: { params: Promise<{ courseSlug: string }> }) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "authentication required" }, { status: 401 });
  const { courseSlug } = await params;

  try {
    const user = await verifySupabaseAccessToken(token);
    const confirmedAt = await confirmStudyGuide(getSupabaseAdminClient(), user.id, courseSlug);
    return NextResponse.json({ confirmedAt });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid access token") return NextResponse.json({ error: "invalid access token" }, { status: 401 });
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
