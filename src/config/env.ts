export type AIMode = "mock" | "local" | "api" | "hybrid";

function asAIMode(value: string | undefined): AIMode {
  if (value === "local" || value === "api" || value === "hybrid") return value;
  return "mock";
}

export const env = {
  aiMode: asAIMode(process.env.AI_MODE),
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "",
  openAIKey: process.env.OPENAI_API_KEY ?? "",
  openAIModel: process.env.OPENAI_MODEL ?? "",
  contentDir: process.env.GCLS_CONTENT_DIR ?? "../github-certification-learning-system",
} as const;
