import type { AIProvider, AIProviderHealth, AIRequest, AIResponse } from "../core/types";

export class MockProvider implements AIProvider {
  readonly name = "mock";

  async generate(request: AIRequest): Promise<AIResponse> {
    return {
      provider: this.name,
      model: "deterministic-mock",
      text: `Mock Tutor: ${request.prompt}`,
    };
  }

  async healthCheck(): Promise<AIProviderHealth> {
    return { provider: this.name, status: "ready" };
  }
}
