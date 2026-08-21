import { NextResponse } from "next/server";

import { getAllMockExams } from "@/modules/mock-exams/mock-exam-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const exams = await getAllMockExams("001-foundations");
    const questionCount = exams.reduce((sum, exam) => sum + exam.questions.length, 0);
    return NextResponse.json({
      status: "ok",
      examCount: exams.length,
      questionCount,
      providers: [...new Set(exams.map((exam) => exam.provider))],
      exams: exams.map((exam) => ({ slug: exam.slug, role: exam.role, questions: exam.questions.length, targetPercent: exam.targetPercent })),
    });
  } catch (error) {
    return NextResponse.json({ status: "error", error: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
