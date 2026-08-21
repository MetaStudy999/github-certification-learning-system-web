import { NextResponse } from "next/server";
import { getSupabaseAdminClient, verifySupabaseAccessToken } from "@/lib/supabase/server";
import { generateEvidencePackage, getEvidencePackage } from "@/modules/evidence/evidence-service";

function token(request: Request) { return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? ""; }
export async function GET(request: Request) {
  try { const user = await verifySupabaseAccessToken(token(request)); return NextResponse.json(await getEvidencePackage(getSupabaseAdminClient(), user.id)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 404 }); }
}
export async function POST(request: Request) {
  try { const user = await verifySupabaseAccessToken(token(request)); return NextResponse.json(await generateEvidencePackage(getSupabaseAdminClient(), user.id)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }); }
}
