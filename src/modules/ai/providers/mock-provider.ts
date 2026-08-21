import type { AIProvider, AIProviderHealth, AIRequest, AIResponse } from "../core/types";

function tutorMock(prompt: string): string | null {
  const stage = prompt.match(/\[GCLS_TUTOR_STAGE:([A-Z_]+)\]/)?.[1];
  if (stage === "HINT") return "핵심 단서: 문제에서 묻는 GitHub 기능의 '주된 목적'과 각 선택지의 역할을 먼저 구분해 보세요. 정답은 직접 공개하지 않습니다.";
  if (stage === "CONCEPT") return "핵심 개념: GitHub 기능은 버전 관리, 협업, 자동화, 보안처럼 역할이 분리됩니다. 문제의 동사가 어떤 역할을 요구하는지 기준으로 비교하세요.";
  if (stage === "SIMILAR_EXAMPLE") return "유사 예제: 팀이 코드 변경을 자동 검사하려면 '자동화' 범주의 기능을 먼저 찾습니다. 같은 방식으로 원래 문제의 요구 역할을 분류한 뒤 다시 풀어보세요.";
  if (stage === "EXPLANATION") return "제출 기록이 확인되었습니다. Source of Truth의 정답과 해설을 기준으로 맞는 이유와 다른 선택지가 덜 적절한 이유를 단계별로 비교하세요. 한 문장 요약: 기능 이름보다 목적을 먼저 식별합니다.";
  return null;
}

export class MockProvider implements AIProvider {
  readonly name = "mock";

  async generate(request: AIRequest): Promise<AIResponse> {
    return {
      provider: this.name,
      model: "deterministic-mock",
      text: tutorMock(request.prompt) ?? `Mock Tutor: ${request.prompt}`,
    };
  }

  async healthCheck(): Promise<AIProviderHealth> {
    return { provider: this.name, status: "ready" };
  }
}
