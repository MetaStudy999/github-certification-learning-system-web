import { env } from "@/config/env";
import type { AIProvider, AIProviderHealth, AIRequest, AIResponse } from "../core/types";

type ResponsesPayload = {
  output?: Array<{
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";

  async healthCheck(): Promise<AIProviderHealth> {
    if (!env.openAIKey || !env.openAIModel) {
      return { provider: this.name, status: "unconfigured", detail: "OPENAI_API_KEY / OPENAI_MODEL required" };
    }
    return { provider: this.name, status: "configured" };
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!env.openAIKey || !env.openAIModel) throw new Error("OpenAI API is not configured");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.openAIKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: env.openAIModel, input: request.prompt }),
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`OpenAI request failed: HTTP ${response.status}`);
    const payload = (await response.json()) as ResponsesPayload;
    const text = payload.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === "output_text")
      ?.text?.trim();

    if (!text) throw new Error("OpenAI returned no output_text");
    return { provider: this.name, model: env.openAIModel, text };
  }
}
