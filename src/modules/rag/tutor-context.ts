import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/config/env";
import type { RagCitation, RagContextResult } from "./core/types";
import { RagGroundingError, RagIndexNotReadyError, RagIndexProfileMismatchError, RagIndexStaleError } from "./errors";
import { searchRag } from "./search-service";

const MAX_SOURCE_CHARS = 1600;
const MAX_CONTEXT_CHARS = 7200;

function citationFromSource(source: Awaited<ReturnType<typeof searchRag>>["sources"][number]): RagCitation {
  const { content: _content, ...citation } = source;
  return citation;
}

export async function buildTutorRagContext(
  admin: SupabaseClient,
  input: { courseSlug: string; query: string; answerRevealAllowed: boolean },
): Promise<RagContextResult> {
  if (env.ragGroundingMode === "off") {
    return { grounded: false, context: "", sources: [], embeddingProfile: null, sourceRef: null };
  }

  try {
    const result = await searchRag(admin, input);
    if (result.sources.length === 0) {
      if (env.ragGroundingMode === "required") throw new RagGroundingError("RAG retrieval returned no Source of Truth context");
      return { grounded: false, context: "", sources: [], embeddingProfile: result.embeddingProfile, sourceRef: result.sourceRef };
    }

    const excerpts = result.sources.map((source, index) => [
      `[S${index + 1}]`,
      `Title: ${source.title}`,
      `Path: ${source.sourcePath}`,
      source.heading ? `Heading: ${source.heading}` : null,
      `Excerpt:\n${source.content.slice(0, MAX_SOURCE_CHARS)}`,
    ].filter(Boolean).join("\n"));

    const context = [
      "[GCLS_RAG_CONTEXT]",
      `Source version: ${result.sourceRef}`,
      `Embedding profile: ${result.embeddingProfile}`,
      ...excerpts,
    ].join("\n\n").slice(0, MAX_CONTEXT_CHARS);

    return {
      grounded: true,
      context,
      sources: result.sources.map(citationFromSource),
      embeddingProfile: result.embeddingProfile,
      sourceRef: result.sourceRef,
    };
  } catch (error) {
    if (
      error instanceof RagIndexNotReadyError
      || error instanceof RagIndexProfileMismatchError
      || error instanceof RagIndexStaleError
    ) {
      if (env.ragGroundingMode === "required") throw new RagGroundingError(error.message);
      return { grounded: false, context: "", sources: [], embeddingProfile: null, sourceRef: null };
    }
    throw error;
  }
}
