import type { EmbeddingBatchResult, EmbeddingProvider, EmbeddingProviderHealth } from "../core/types";

function fnv1a(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function tokenize(text: string): string[] {
  return (text.normalize("NFKC").toLowerCase().match(/[\p{Script=Latin}\p{N}][\p{Script=Latin}\p{N}_-]*|[\p{Script=Hangul}]+/gu) ?? [])
    .filter((token) => token.length > 1 || /^[a-z0-9]$/i.test(token));
}

function deterministicEmbedding(text: string, dimensions: number): number[] {
  const vector = Array.from({ length: dimensions }, () => 0);
  const tokens = tokenize(text);
  const features = [...tokens, ...tokens.slice(0, -1).map((token, index) => `${token}::${tokens[index + 1]}`)];

  for (const feature of features) {
    const hash = fnv1a(feature);
    const position = hash % dimensions;
    const sign = (hash & 1) === 0 ? 1 : -1;
    vector[position] = (vector[position] ?? 0) + sign;
  }

  let norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (norm === 0) {
    vector[fnv1a(text) % dimensions] = 1;
    norm = 1;
  }
  return vector.map((value) => value / norm);
}

export class MockEmbeddingProvider implements EmbeddingProvider {
  readonly name = "mock-embedding";
  readonly model = "deterministic-hash-v1";
  readonly profile: string;

  constructor(readonly dimensions: number) {
    this.profile = `${this.name}:${this.model}:${dimensions}`;
  }

  async healthCheck(): Promise<EmbeddingProviderHealth> {
    return { provider: this.name, status: "ready", detail: this.profile };
  }

  async embed(texts: string[]): Promise<EmbeddingBatchResult> {
    if (texts.length === 0 || texts.some((text) => !text.trim())) throw new Error("embedding input must contain non-empty text");
    return {
      vectors: texts.map((text) => deterministicEmbedding(text, this.dimensions)),
      provider: this.name,
      model: this.model,
      fallback: false,
    };
  }
}
