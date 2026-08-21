export const RAG_SOURCE_TIERS = ["PRE_ANSWER", "POST_ATTEMPT"] as const;
export type RagSourceTier = (typeof RAG_SOURCE_TIERS)[number];

export type EmbeddingProviderStatus = "ready" | "configured" | "unavailable" | "unconfigured";

export interface EmbeddingProviderHealth {
  provider: string;
  status: EmbeddingProviderStatus;
  detail?: string;
}

export interface EmbeddingBatchResult {
  vectors: number[][];
  provider: string;
  model: string;
  fallback: boolean;
}

export interface EmbeddingProvider {
  readonly name: string;
  readonly model: string;
  readonly dimensions: number;
  readonly profile: string;
  embed(texts: string[]): Promise<EmbeddingBatchResult>;
  healthCheck(): Promise<EmbeddingProviderHealth>;
}

export interface RagChunkDraft {
  chunkIndex: number;
  heading: string | null;
  content: string;
  contentChars: number;
}

export interface RagCitation {
  chunkId: string;
  documentId: string;
  moduleSlug: string;
  sourceTier: RagSourceTier;
  title: string;
  sourcePath: string;
  sourceUrl: string;
  heading: string | null;
  similarity: number;
}

export interface RagRetrievedChunk extends RagCitation {
  content: string;
}

export interface RagSearchResult {
  query: string;
  courseSlug: string;
  sourceTiers: RagSourceTier[];
  embeddingProvider: string;
  embeddingModel: string;
  embeddingProfile: string;
  sourceRef: string;
  sources: RagRetrievedChunk[];
}

export interface RagIndexResult {
  runId: string;
  courseSlug: string;
  sourceRef: string;
  embeddingProfile: string;
  targetDocuments: number;
  indexedDocuments: number;
  skippedDocuments: number;
  deletedDocuments: number;
  documentCount: number;
  chunkCount: number;
}

export interface RagContextResult {
  grounded: boolean;
  context: string;
  sources: RagCitation[];
  embeddingProfile: string | null;
  sourceRef: string | null;
}
