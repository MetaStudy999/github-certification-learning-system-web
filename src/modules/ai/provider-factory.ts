import { env } from "@/config/env";
import type { AIProvider } from "./core/types";
import { HybridProvider } from "./providers/hybrid-provider";
import { MockProvider } from "./providers/mock-provider";
import { OllamaProvider } from "./providers/ollama-provider";
import { OpenAIProvider } from "./providers/openai-provider";

export function createAIProvider(): AIProvider {
  if (env.aiMode === "local") return new OllamaProvider();
  if (env.aiMode === "api") return new OpenAIProvider();
  if (env.aiMode === "hybrid") return new HybridProvider(new OllamaProvider(), new OpenAIProvider());
  return new MockProvider();
}
