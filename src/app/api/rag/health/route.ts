import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getRagHealth } from "@/modules/rag/health-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await getRagHealth(getSupabaseAdminClient()));
  } catch (error) {
    return NextResponse.json({
      status: "unavailable",
      error: error instanceof Error ? error.message : String(error),
    }, { status: 503 });
  }
}
