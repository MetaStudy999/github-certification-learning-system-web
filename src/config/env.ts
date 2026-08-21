export type AIMode = "mock" | "local" | "api" | "hybrid";
export type RagEmbeddingMode = "mock" | "local" | "api";
export type RagGroundingMode = "off" | "optional" | "required";

function asAIMode(value: string | undefined): AIMode {
  if (value === "local" || value === "api" || value === "hybrid") return value;
  return "mock";
}

function asRagEmbeddingMode(value: string | undefined): RagEmbeddingMode {
  if (value === "local" || value === "api") return value;
  return "mock";
}

function asRagGroundingMode(value: string | undefined): RagGroundingMode {
  if (value === "off" || value === "required") return value;
  return "optional";
}

function asInteger(value: string | undefined, fallback: number, minimum: number, maximum: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function asSimilarity(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(1, Math.max(-1, parsed));
}

function asEmbeddingDimensions(value: string | undefined): 384 {
  const parsed = value === undefined || value === "" ? 384 : Number(value);
  if (parsed !== 384) throw new Error("RAG_EMBEDDING_DIMENSIONS must be 384 for the P8 pgvector schema");
  return 384;
}

export const env = {
  aiMode: asAIMode(process.env.AI_MODE),
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "",
  openAIBaseUrl: (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, ""),
  openAIKey: process.env.OPENAI_API_KEY ?? "",
  openAIModel: process.env.OPENAI_MODEL ?? "",
  contentDir: process.env.GCLS_CONTENT_DIR ?? "../github-certification-learning-system",
  contentRef: process.env.GCLS_CONTENT_REF ?? "main",
  contentVersion: process.env.GCLS_CONTENT_VERSION ?? process.env.GCLS_CONTENT_REF ?? "main",
  ragEmbeddingMode: asRagEmbeddingMode(process.env.RAG_EMBEDDING_MODE),
  ragEmbeddingDimensions: asEmbeddingDimensions(process.env.RAG_EMBEDDING_DIMENSIONS),
  ragGroundingMode: asRagGroundingMode(process.env.RAG_GROUNDING_MODE),
  ragTopK: asInteger(process.env.RAG_TOP_K, 5, 1, 8),
  ragMinSimilarity: asSimilarity(process.env.RAG_MIN_SIMILARITY, 0.05),
  ragIndexToken: process.env.RAG_INDEX_TOKEN ?? "",
  ollamaEmbeddingModel: process.env.OLLAMA_EMBEDDING_MODEL ?? "all-minilm",
  openAIEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
} as const;
