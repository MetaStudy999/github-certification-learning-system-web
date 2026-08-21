import { env } from "@/config/env";
import { createAIProvider } from "@/modules/ai/provider-factory";

export const runtime = "nodejs";

export async function GET() {
  const provider = createAIProvider();
  const health = await provider.healthCheck();

  return Response.json({
    mode: env.aiMode,
    ...health,
    timestamp: new Date().toISOString(),
  });
}
