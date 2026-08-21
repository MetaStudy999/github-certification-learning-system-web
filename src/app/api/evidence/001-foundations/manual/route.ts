import { NextResponse } from "next/server";
import { getSupabaseAdminClient, verifySupabaseAccessToken } from "@/lib/supabase/server";
import { createManualEvidence } from "@/modules/evidence/evidence-service";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    const user = await verifySupabaseAccessToken(token);
    const body = await request.json();
    return NextResponse.json(await createManualEvidence(getSupabaseAdminClient(), user.id, body));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }); }
}
