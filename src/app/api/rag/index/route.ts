import { NextResponse } from "next/server";

import { env } from "@/config/env";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { indexCourseRag } from "@/modules/rag/index-service";

export const runtime = "nodejs";

interface IndexBody {
  courseSlug?: string;
}

export async function POST(request: Request) {
  if (!env.ragIndexToken) {
    return NextResponse.json({ error: "RAG_INDEX_TOKEN is not configured" }, { status: 503 });
  }
  if (request.headers.get("x-rag-index-token") !== env.ragIndexToken) {
    return NextResponse.json({ error: "invalid RAG index token" }, { status: 401 });
  }

  let body: IndexBody = {};
  try {
    if ((request.headers.get("content-length") ?? "0") !== "0") body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const courseSlug = body.courseSlug?.trim() || "001-foundations";
  if (courseSlug !== "001-foundations") {
    return NextResponse.json({ error: "P8 currently indexes only 001-foundations" }, { status: 400 });
  }

  try {
    return NextResponse.json(await indexCourseRag(getSupabaseAdminClient(), courseSlug));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
