import { createAIProvider } from "@/modules/ai/provider-factory";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: unknown };
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

  if (!prompt || prompt.length > 2000) {
    return Response.json({ error: "prompt must be 1-2000 characters" }, { status: 400 });
  }

  try {
    const result = await createAIProvider().generate({ prompt });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI provider failed";
    return Response.json({ error: message }, { status: 503 });
  }
}
