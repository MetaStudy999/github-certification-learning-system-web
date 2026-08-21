import type { AIProvider, AIProviderHealth, AIRequest, AIResponse } from "../core/types";

export class HybridProvider implements AIProvider {
  readonly name = "hybrid";

  constructor(
    private readonly local: AIProvider,
    private readonly cloud: AIProvider,
  ) {}

  async healthCheck(): Promise<AIProviderHealth> {
    const [local, cloud] = await Promise.all([this.local.healthCheck(), this.cloud.healthCheck()]);
    if (local.status === "ready") return { provider: this.name, status: "ready", detail: "local ready" };
    if (cloud.status === "configured" || cloud.status === "ready") {
      return { provider: this.name, status: "configured", detail: "cloud fallback configured" };
    }
    return { provider: this.name, status: "unavailable", detail: "no usable provider" };
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    try {
      return await this.local.generate(request);
    } catch {
      const response = await this.cloud.generate(request);
      return { ...response, fallback: true };
    }
  }
}
