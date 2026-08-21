export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    status: "ok",
    service: "gcls-web",
    phase: "P1",
    timestamp: new Date().toISOString(),
  });
}
