import type { RagCitation } from "@/modules/rag/core/types";

export const TUTOR_STAGES = ["HINT", "CONCEPT", "SIMILAR_EXAMPLE", "EXPLANATION"] as const;
export type TutorStage = (typeof TUTOR_STAGES)[number];

export interface TutorResponse {
  stage: TutorStage;
  text: string;
  provider: string;
  model?: string;
  fallback: boolean;
  attempted: boolean;
  answerRevealAllowed: boolean;
  interactionId: string;
  grounded: boolean;
  groundingMode: "off" | "optional" | "required";
  sources: RagCitation[];
}
