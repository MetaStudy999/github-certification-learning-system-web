import { NextResponse } from "next/server";

import { getSupabaseAdminClient, verifySupabaseAccessToken } from "@/lib/supabase/server";
import { RagIndexNotReadyError, RagIndexProfileMismatchError, RagIndexStaleError } from "@/modules/rag/errors";
import { searchRag } from "@/modules/rag/search-service";

export const runtime = "nodejs";

interface SearchBody {
  courseSlug?: string;
  query?: string;
  limit?: number;
}

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "authentication required" }, { status: 401 });

  let body: SearchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const courseSlug = body.courseSlug?.trim() || "001-foundations";
  const query = body.query?.trim() ?? "";
  if (courseSlug !== "001-foundations" || !query || query.length > 4000) {
    return NextResponse.json({ error: "001-foundations and a 1-4000 character query are required" }, { status: 400 });
  }

  try {
    await verifySupabaseAccessToken(token);
    const result = await searchRag(getSupabaseAdminClient(), {
      courseSlug,
      query,
      answerRevealAllowed: false,
      limit: body.limit,
    });
    return NextResponse.json({
      ...result,
      sources: result.sources.map(({ content, ...source }) => ({ ...source, snippet: content.slice(0, 320) })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid access token") {
      return NextResponse.json({ error: "invalid access token" }, { status: 401 });
    }
    if (error instanceof RagIndexNotReadyError) {
      return NextResponse.json({ error: error.message, code: "RAG_INDEX_NOT_READY" }, { status: 503 });
    }
    if (error instanceof RagIndexProfileMismatchError) {
      return NextResponse.json({ error: error.message, code: "RAG_PROFILE_MISMATCH" }, { status: 503 });
    }
    if (error instanceof RagIndexStaleError) {
      return NextResponse.json({ error: error.message, code: "RAG_INDEX_STALE" }, { status: 503 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
