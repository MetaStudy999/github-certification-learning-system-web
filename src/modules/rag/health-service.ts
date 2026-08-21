import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/config/env";
import { createEmbeddingProvider } from "./embedding/provider-factory";

export async function getRagHealth(admin: SupabaseClient) {
  const provider = createEmbeddingProvider();
  const [embedding, documentsResult, chunksResult] = await Promise.all([
    provider.healthCheck(),
    admin.from("rag_documents").select("embedding_profile,source_ref", { count: "exact" }).eq("course_slug", "001-foundations"),
    admin.from("rag_chunks").select("id", { count: "exact", head: true }),
  ]);
  if (documentsResult.error) throw documentsResult.error;
  if (chunksResult.error) throw chunksResult.error;

  const profiles = new Set((documentsResult.data ?? []).map((row) => row.embedding_profile as string));
  const sourceRefs = new Set((documentsResult.data ?? []).map((row) => row.source_ref as string));
  const compatible = profiles.size === 1 && profiles.has(provider.profile);
  const fresh = sourceRefs.size === 1 && sourceRefs.has(env.contentVersion);
  const documentCount = documentsResult.count ?? 0;
  const chunkCount = chunksResult.count ?? 0;

  return {
    status: documentCount > 0 && chunkCount > 0 && compatible && fresh ? "ready" : documentCount === 0 ? "empty" : "stale",
    course: "001-foundations",
    groundingMode: env.ragGroundingMode,
    embeddingMode: env.ragEmbeddingMode,
    embeddingDimensions: env.ragEmbeddingDimensions,
    embeddingProfile: provider.profile,
    indexedProfiles: [...profiles],
    sourceVersion: env.contentVersion,
    indexedSourceRefs: [...sourceRefs],
    documentCount,
    chunkCount,
    embedding,
  };
}
