import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/config/env";
import { getCourseModule, listCourseModules } from "@/modules/content/content-service";
import { chunkMarkdown } from "./chunking/markdown-chunker";
import type { EmbeddingProvider, RagChunkDraft, RagIndexResult } from "./core/types";
import { createEmbeddingProvider } from "./embedding/provider-factory";
import { getRagSourceTier } from "./source-policy";

const SUPPORTED_COURSES = new Set(["001-foundations"]);
const EMBEDDING_BATCH_SIZE = 16;
const INSERT_BATCH_SIZE = 50;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function embedChunks(provider: EmbeddingProvider, chunks: RagChunkDraft[]) {
  const embedded: Array<RagChunkDraft & { embedding: number[]; embeddingProvider: string; embeddingModel: string; fallback: boolean }> = [];
  for (let offset = 0; offset < chunks.length; offset += EMBEDDING_BATCH_SIZE) {
    const batch = chunks.slice(offset, offset + EMBEDDING_BATCH_SIZE);
    const result = await provider.embed(batch.map((chunk) => chunk.content));
    batch.forEach((chunk, index) => {
      embedded.push({
        ...chunk,
        embedding: result.vectors[index]!,
        embeddingProvider: result.provider,
        embeddingModel: result.model,
        fallback: result.fallback,
      });
    });
  }
  return embedded;
}

export async function indexCourseRag(admin: SupabaseClient, courseSlug: string): Promise<RagIndexResult> {
  if (!SUPPORTED_COURSES.has(courseSlug)) throw new Error(`RAG course is not supported yet: ${courseSlug}`);

  const embeddingProvider = createEmbeddingProvider();
  const modules = (await listCourseModules(courseSlug))
    .map((module) => ({ module, sourceTier: getRagSourceTier(module.slug) }))
    .filter((item): item is { module: (typeof item)["module"]; sourceTier: NonNullable<(typeof item)["sourceTier"]> } => item.sourceTier !== null);

  const { data: run, error: runError } = await admin.from("rag_index_runs").insert({
    course_slug: courseSlug,
    source_ref: env.contentVersion,
    embedding_profile: embeddingProvider.profile,
    status: "RUNNING",
  }).select("id").single();
  if (runError) throw runError;

  let indexedDocuments = 0;
  let skippedDocuments = 0;
  let deletedDocuments = 0;

  try {
    const { data: existingData, error: existingError } = await admin
      .from("rag_documents")
      .select("id,source_path,content_hash,embedding_profile,source_ref,source_tier")
      .eq("course_slug", courseSlug);
    if (existingError) throw existingError;
    const existingDocuments = existingData ?? [];
    const existingByPath = new Map(existingDocuments.map((document) => [document.source_path as string, document]));
    const targetPaths = new Set<string>();

    for (const { module, sourceTier } of modules) {
      const document = await getCourseModule(courseSlug, module.slug);
      const contentHash = sha256(document.markdown);
      const sourcePath = document.sourcePath;
      targetPaths.add(sourcePath);
      const existing = existingByPath.get(sourcePath);

      if (
        existing
        && existing.content_hash === contentHash
        && existing.embedding_profile === embeddingProvider.profile
        && existing.source_tier === sourceTier
      ) {
        const { error: metadataError } = await admin.from("rag_documents").update({
          title: document.title,
          source_url: document.sourceUrl,
          provider: document.provider,
          source_ref: env.contentVersion,
        }).eq("id", existing.id);
        if (metadataError) throw metadataError;
        skippedDocuments += 1;
        continue;
      }

      const chunks = chunkMarkdown(document.markdown);
      if (chunks.length === 0) throw new Error(`RAG chunker returned no chunks for ${sourcePath}`);
      const embeddedChunks = await embedChunks(embeddingProvider, chunks);

      const { data: storedDocument, error: documentError } = await admin.from("rag_documents").upsert({
        course_slug: courseSlug,
        module_slug: module.slug,
        source_tier: sourceTier,
        title: document.title,
        source_path: sourcePath,
        source_url: document.sourceUrl,
        provider: document.provider,
        source_ref: env.contentVersion,
        content_hash: contentHash,
        embedding_profile: embeddingProvider.profile,
        embedding_dimensions: embeddingProvider.dimensions,
        indexed_at: new Date().toISOString(),
      }, { onConflict: "source_path" }).select("id").single();
      if (documentError) throw documentError;

      const { error: deleteChunksError } = await admin.from("rag_chunks").delete().eq("document_id", storedDocument.id);
      if (deleteChunksError) throw deleteChunksError;

      const chunkRows = embeddedChunks.map((chunk) => ({
        document_id: storedDocument.id,
        chunk_index: chunk.chunkIndex,
        heading: chunk.heading,
        content: chunk.content,
        content_chars: chunk.contentChars,
        embedding: chunk.embedding,
        embedding_provider: chunk.embeddingProvider,
        embedding_model: chunk.embeddingModel,
        embedding_fallback: chunk.fallback,
      }));

      for (let offset = 0; offset < chunkRows.length; offset += INSERT_BATCH_SIZE) {
        const { error: chunkError } = await admin.from("rag_chunks").insert(chunkRows.slice(offset, offset + INSERT_BATCH_SIZE));
        if (chunkError) throw chunkError;
      }
      indexedDocuments += 1;
    }

    const staleIds = existingDocuments
      .filter((document) => !targetPaths.has(document.source_path as string))
      .map((document) => document.id as string);
    if (staleIds.length > 0) {
      const { error: staleError } = await admin.from("rag_documents").delete().in("id", staleIds);
      if (staleError) throw staleError;
      deletedDocuments = staleIds.length;
    }

    const { data: finalDocuments, error: finalDocumentsError } = await admin
      .from("rag_documents")
      .select("id")
      .eq("course_slug", courseSlug);
    if (finalDocumentsError) throw finalDocumentsError;
    const documentIds = (finalDocuments ?? []).map((document) => document.id as string);

    let chunkCount = 0;
    if (documentIds.length > 0) {
      const { count, error: countError } = await admin
        .from("rag_chunks")
        .select("id", { count: "exact", head: true })
        .in("document_id", documentIds);
      if (countError) throw countError;
      chunkCount = count ?? 0;
    }

    const result: RagIndexResult = {
      runId: run.id,
      courseSlug,
      sourceRef: env.contentVersion,
      embeddingProfile: embeddingProvider.profile,
      targetDocuments: modules.length,
      indexedDocuments,
      skippedDocuments,
      deletedDocuments,
      documentCount: documentIds.length,
      chunkCount,
    };

    const { error: completeError } = await admin.from("rag_index_runs").update({
      status: "COMPLETED",
      target_documents: result.targetDocuments,
      indexed_documents: result.indexedDocuments,
      skipped_documents: result.skippedDocuments,
      deleted_documents: result.deletedDocuments,
      document_count: result.documentCount,
      chunk_count: result.chunkCount,
      finished_at: new Date().toISOString(),
    }).eq("id", run.id);
    if (completeError) throw completeError;
    return result;
  } catch (error) {
    await admin.from("rag_index_runs").update({
      status: "FAILED",
      error_message: messageOf(error).slice(0, 2000),
      finished_at: new Date().toISOString(),
    }).eq("id", run.id);
    throw error;
  }
}
