import { NextResponse } from "next/server";

import { getQuestionBankCatalog } from "@/modules/question-bank/question-bank-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await getQuestionBankCatalog("001-foundations");
    return NextResponse.json({
      status: catalog.sets.length === 10 && catalog.totalQuestions === 100 ? "ok" : "degraded",
      courseSlug: "001-foundations",
      provider: catalog.provider,
      setCount: catalog.sets.length,
      questionCount: catalog.totalQuestions,
    }, { status: catalog.sets.length === 10 && catalog.totalQuestions === 100 ? 200 : 503 });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
