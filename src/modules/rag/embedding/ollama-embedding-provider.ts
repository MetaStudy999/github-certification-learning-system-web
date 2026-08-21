import { env } from "@/config/env";
import type { EmbeddingBatchResult, EmbeddingProvider, EmbeddingProviderHealth } from "../core/types";
import { validateEmbeddingVectors } from "./validation";

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  readonly name = "ollama-embedding";
  readonly model = env.ollamaEmbeddingModel;
  readonly dimensions = env.ragEmbeddingDimensions;
  readonly profile = `${this.name}:${this.model}:${this.dimensions}`;

  async healthCheck(): Promise<EmbeddingProviderHealth> {
    if (!this.model) return { provider: this.name, status: "unconfigured", detail: "OLLAMA_EMBEDDING_MODEL required" };
    try {
      const response = await fetch(`${env.ollamaBaseUrl}/api/tags`, {
        signal: AbortSignal.timeout(1500),
        cache: "no-store",
      });
      return response.ok
        ? { provider: this.name, status: "ready", detail: this.profile }
        : { provider: this.name, status: "unavailable", detail: `HTTP ${response.status}` };
    } catch {
      return { provider: this.name, status: "unavailable", detail: "Ollama is not reachable" };
    }
  }

  async embed(texts: string[]): Promise<EmbeddingBatchResult> {
    if (!this.model) throw new Error("OLLAMA_EMBEDDING_MODEL is not configured");
    if (texts.length === 0 || texts.some((text) => !text.trim())) throw new Error("embedding input must contain non-empty text");

    const response = await fetch(`${env.ollamaBaseUrl}/api/embed`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: this.model, input: texts, dimensions: this.dimensions }),
      signal: AbortSignal.timeout(60_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Ollama embed request failed: HTTP ${response.status}`);

    const payload = (await response.json()) as { embeddings?: unknown };
    return {
      vectors: validateEmbeddingVectors(payload.embeddings, texts.length, this.dimensions, this.name),
      provider: this.name,
      model: this.model,
      fallback: false,
    };
  }
}
