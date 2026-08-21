import { env } from "@/config/env";
import type { EmbeddingBatchResult, EmbeddingProvider, EmbeddingProviderHealth } from "../core/types";
import { validateEmbeddingVectors } from "./validation";

type EmbeddingsPayload = {
  data?: Array<{ index?: number; embedding?: unknown }>;
};

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly name = "openai-embedding";
  readonly model = env.openAIEmbeddingModel;
  readonly dimensions = env.ragEmbeddingDimensions;
  readonly profile = `${this.name}:${this.model}:${this.dimensions}`;

  async healthCheck(): Promise<EmbeddingProviderHealth> {
    if (!env.openAIKey || !this.model) {
      return { provider: this.name, status: "unconfigured", detail: "OPENAI_API_KEY / OPENAI_EMBEDDING_MODEL required" };
    }
    return { provider: this.name, status: "configured", detail: this.profile };
  }

  async embed(texts: string[]): Promise<EmbeddingBatchResult> {
    if (!env.openAIKey || !this.model) throw new Error("OpenAI embeddings are not configured");
    if (texts.length === 0 || texts.some((text) => !text.trim())) throw new Error("embedding input must contain non-empty text");

    const response = await fetch(`${env.openAIBaseUrl}/embeddings`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.openAIKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
        dimensions: this.dimensions,
        encoding_format: "float",
      }),
      signal: AbortSignal.timeout(60_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`OpenAI embeddings request failed: HTTP ${response.status}`);

    const payload = (await response.json()) as EmbeddingsPayload;
    const ordered = [...(payload.data ?? [])]
      .sort((left, right) => (left.index ?? 0) - (right.index ?? 0))
      .map((item) => item.embedding);

    return {
      vectors: validateEmbeddingVectors(ordered, texts.length, this.dimensions, this.name),
      provider: this.name,
      model: this.model,
      fallback: false,
    };
  }
}
