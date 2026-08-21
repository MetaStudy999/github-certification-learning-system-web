import { env } from "@/config/env";
import type { AIProvider, AIProviderHealth, AIRequest, AIResponse } from "../core/types";

export class OllamaProvider implements AIProvider {
  readonly name = "ollama";

  async healthCheck(): Promise<AIProviderHealth> {
    try {
      const response = await fetch(`${env.ollamaBaseUrl}/api/tags`, {
        signal: AbortSignal.timeout(1500),
        cache: "no-store",
      });
      return response.ok
        ? { provider: this.name, status: "ready" }
        : { provider: this.name, status: "unavailable", detail: `HTTP ${response.status}` };
    } catch {
      return { provider: this.name, status: "unavailable", detail: "Ollama is not reachable" };
    }
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!env.ollamaModel) throw new Error("OLLAMA_MODEL is not configured");

    const response = await fetch(`${env.ollamaBaseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: env.ollamaModel,
        messages: [{ role: "user", content: request.prompt }],
        stream: false,
      }),
      signal: AbortSignal.timeout(30_000),
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Ollama request failed: HTTP ${response.status}`);
    const payload = (await response.json()) as { message?: { content?: string } };
    const text = payload.message?.content?.trim();
    if (!text) throw new Error("Ollama returned no text");

    return { provider: this.name, model: env.ollamaModel, text };
  }
}
