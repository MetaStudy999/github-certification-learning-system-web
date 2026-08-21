import { NextResponse } from "next/server";

import { getSupabaseAdminClient, verifySupabaseAccessToken } from "@/lib/supabase/server";
import { classifyWrongAnswer, ERROR_CODES, type ErrorCode } from "@/modules/wrong-answers/wrong-answer-service";

interface ClassifyRouteProps {
  params: Promise<{ wrongAnswerId: string }>;
}

export async function POST(request: Request, { params }: ClassifyRouteProps) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "authentication required" }, { status: 401 });

  let body: { errorCode?: string; reflection?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const errorCode = body.errorCode?.trim().toUpperCase() as ErrorCode | undefined;
  if (!errorCode || !ERROR_CODES.includes(errorCode)) {
    return NextResponse.json({ error: `errorCode must be one of ${ERROR_CODES.join(", ")}` }, { status: 400 });
  }

  const reflection = body.reflection?.trim() ?? "";
  if (reflection.length > 2000) {
    return NextResponse.json({ error: "reflection must be 2000 characters or less" }, { status: 400 });
  }

  const { wrongAnswerId } = await params;

  try {
    const user = await verifySupabaseAccessToken(token);
    const wrongAnswer = await classifyWrongAnswer(getSupabaseAdminClient(), {
      userId: user.id,
      wrongAnswerId,
      errorCode,
      reflection,
    });
    return NextResponse.json({ wrongAnswer });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid access token") {
      return NextResponse.json({ error: "invalid access token" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "wrong answer item not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
