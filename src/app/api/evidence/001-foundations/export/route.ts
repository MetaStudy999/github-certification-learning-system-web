import { NextResponse } from "next/server";
import { getSupabaseAdminClient, verifySupabaseAccessToken } from "@/lib/supabase/server";
import { evidencePackageMarkdown, getEvidencePackage } from "@/modules/evidence/evidence-service";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    const user = await verifySupabaseAccessToken(token);
    const pkg = await getEvidencePackage(getSupabaseAdminClient(), user.id);
    const format = new URL(request.url).searchParams.get("format") ?? "json";
    if (format === "markdown") return new NextResponse(evidencePackageMarkdown(pkg), { headers: { "content-type": "text/markdown; charset=utf-8", "content-disposition": "attachment; filename=gh-900-evidence-portfolio.md" } });
    return NextResponse.json(pkg, { headers: { "content-disposition": "attachment; filename=gh-900-evidence-package.json" } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }); }
}
