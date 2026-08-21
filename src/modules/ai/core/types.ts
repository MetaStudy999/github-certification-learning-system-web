export type AIProviderStatus = "ready" | "configured" | "unavailable" | "unconfigured";

export interface AIRequest {
  prompt: string;
}

export interface AIResponse {
  text: string;
  provider: string;
  model?: string;
  fallback?: boolean;
}

export interface AIProviderHealth {
  provider: string;
  status: AIProviderStatus;
  detail?: string;
}

export interface AIProvider {
  readonly name: string;
  generate(request: AIRequest): Promise<AIResponse>;
  healthCheck(): Promise<AIProviderHealth>;
}
