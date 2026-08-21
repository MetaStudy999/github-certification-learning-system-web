import { NextResponse } from "next/server";

import { getContentHealth } from "@/modules/content/content-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await getContentHealth();
    return NextResponse.json(health, { status: health.status === "ok" ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: error instanceof Error ? error.message : String(error) },
      { status: 503 },
    );
  }
}
