import { env } from "@/config/env";
import type { EmbeddingProvider } from "../core/types";
import { MockEmbeddingProvider } from "./mock-embedding-provider";
import { OllamaEmbeddingProvider } from "./ollama-embedding-provider";
import { OpenAIEmbeddingProvider } from "./openai-embedding-provider";

export function createEmbeddingProvider(): EmbeddingProvider {
  if (env.ragEmbeddingMode === "local") return new OllamaEmbeddingProvider();
  if (env.ragEmbeddingMode === "api") return new OpenAIEmbeddingProvider();
  return new MockEmbeddingProvider(env.ragEmbeddingDimensions);
}
