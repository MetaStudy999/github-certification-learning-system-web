import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/config/env";
import type { RagRetrievedChunk, RagSearchResult, RagSourceTier } from "./core/types";
import { createEmbeddingProvider } from "./embedding/provider-factory";
import { RagIndexNotReadyError, RagIndexProfileMismatchError, RagIndexStaleError } from "./errors";
import { getAllowedRagSourceTiers } from "./source-policy";

interface MatchRow {
  chunk_id: string;
  document_id: string;
  module_slug: string;
  source_tier: RagSourceTier;
  title: string;
  source_path: string;
  source_url: string;
  heading: string | null;
  content: string;
  similarity: number | string;
}

async function assertCompatibleIndex(admin: SupabaseClient, courseSlug: string, profile: string): Promise<string> {
  const { data, error } = await admin
    .from("rag_documents")
    .select("embedding_profile,source_ref")
    .eq("course_slug", courseSlug);
  if (error) throw error;
  if (!data || data.length === 0) throw new RagIndexNotReadyError(`RAG index is empty for ${courseSlug}`);

  const profiles = new Set(data.map((row) => row.embedding_profile as string));
  if (profiles.size !== 1 || !profiles.has(profile)) {
    throw new RagIndexProfileMismatchError(`RAG index profile mismatch: indexed=${[...profiles].join(",")} current=${profile}`);
  }

  const sourceRefs = new Set(data.map((row) => row.source_ref as string));
  if (sourceRefs.size !== 1 || !sourceRefs.has(env.contentVersion)) {
    throw new RagIndexStaleError(`RAG index source version mismatch: indexed=${[...sourceRefs].join(",")} current=${env.contentVersion}`);
  }
  return [...sourceRefs][0]!;
}

export async function searchRag(
  admin: SupabaseClient,
  input: {
    courseSlug: string;
    query: string;
    answerRevealAllowed: boolean;
    limit?: number;
    minSimilarity?: number;
  },
): Promise<RagSearchResult> {
  const query = input.query.trim();
  if (!query || query.length > 4000) throw new Error("RAG query must be 1-4000 characters");

  const provider = createEmbeddingProvider();
  const sourceRef = await assertCompatibleIndex(admin, input.courseSlug, provider.profile);
  const embedded = await provider.embed([query]);
  const sourceTiers = getAllowedRagSourceTiers(input.answerRevealAllowed);
  const limit = Math.min(8, Math.max(1, input.limit ?? env.ragTopK));
  const minSimilarity = Math.min(1, Math.max(-1, input.minSimilarity ?? env.ragMinSimilarity));

  const { data, error } = await admin.rpc("match_rag_chunks", {
    query_embedding: embedded.vectors[0]!,
    match_course_slug: input.courseSlug,
    allowed_source_tiers: sourceTiers,
    match_count: limit,
    min_similarity: minSimilarity,
  });
  if (error) throw error;

  const sources: RagRetrievedChunk[] = ((data ?? []) as MatchRow[]).map((row) => ({
    chunkId: row.chunk_id,
    documentId: row.document_id,
    moduleSlug: row.module_slug,
    sourceTier: row.source_tier,
    title: row.title,
    sourcePath: row.source_path,
    sourceUrl: row.source_url,
    heading: row.heading,
    content: row.content,
    similarity: Number(row.similarity),
  }));

  return {
    query,
    courseSlug: input.courseSlug,
    sourceTiers,
    embeddingProvider: embedded.provider,
    embeddingModel: embedded.model,
    embeddingProfile: provider.profile,
    sourceRef,
    sources,
  };
}
