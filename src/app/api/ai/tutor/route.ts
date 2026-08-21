import { NextResponse } from "next/server";

import { getSupabaseAdminClient, verifySupabaseAccessToken } from "@/lib/supabase/server";
import { ContentNotFoundError } from "@/modules/content/core/provider";
import { generateTutorResponse, TutorAccessError } from "@/modules/ai/tutor/tutor-service";
import { TUTOR_STAGES, type TutorStage } from "@/modules/ai/tutor/types";

export const runtime = "nodejs";

interface TutorBody {
  courseSlug?: string;
  setSlug?: string;
  questionId?: string;
  stage?: TutorStage;
}

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "authentication required" }, { status: 401 });

  let body: TutorBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const courseSlug = body.courseSlug?.trim();
  const setSlug = body.setSlug?.trim();
  const questionId = body.questionId?.trim().toUpperCase();
  const stage = body.stage;
  if (!courseSlug || !setSlug || !questionId || !stage || !TUTOR_STAGES.includes(stage)) {
    return NextResponse.json({ error: "courseSlug, setSlug, questionId and valid stage are required" }, { status: 400 });
  }

  try {
    const user = await verifySupabaseAccessToken(token);
    const result = await generateTutorResponse(getSupabaseAdminClient(), {
      userId: user.id,
      courseSlug,
      setSlug,
      questionId,
      stage,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ContentNotFoundError) return NextResponse.json({ error: error.message }, { status: 404 });
    if (error instanceof TutorAccessError) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof Error && error.message === "invalid access token") {
      return NextResponse.json({ error: "invalid access token" }, { status: 401 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
