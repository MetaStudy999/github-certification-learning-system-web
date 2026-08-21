import type { RagSourceTier } from "./core/types";

const RAG_MODULE_POLICY: Record<string, RagSourceTier> = {
  "010-overview": "PRE_ANSWER",
  "020-terms": "PRE_ANSWER",
  "030-concepts": "PRE_ANSWER",
  "040-official-docs": "PRE_ANSWER",
  "050-guides": "PRE_ANSWER",
  "060-labs": "PRE_ANSWER",
  "070-exercises": "POST_ATTEMPT",
  "090-final-review": "POST_ATTEMPT",
  "100-projects": "POST_ATTEMPT",
  "140-resources": "PRE_ANSWER",
};

export function getRagSourceTier(moduleSlug: string): RagSourceTier | null {
  return RAG_MODULE_POLICY[moduleSlug] ?? null;
}

export function getAllowedRagSourceTiers(answerRevealAllowed: boolean): RagSourceTier[] {
  return answerRevealAllowed ? ["PRE_ANSWER", "POST_ATTEMPT"] : ["PRE_ANSWER"];
}

export function getIndexedRagModuleSlugs(): string[] {
  return Object.keys(RAG_MODULE_POLICY).sort();
}
