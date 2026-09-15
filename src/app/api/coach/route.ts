import { NextResponse } from "next/server";

import { createAIProvider } from "@/modules/ai/provider-factory";

type CoachLevel = "beginner" | "intermediate" | "advanced" | "expert";

type CoachStep = {
  command: string;
  why: string;
  risk: "low" | "medium" | "high";
};

type CoachResult = {
  summary: string;
  risk: "low" | "medium" | "high";
  steps: CoachStep[];
  verify: string;
  safetyNote?: string;
  provider?: string;
  model?: string;
  fallback?: boolean;
};

const HIGH_RISK_PATTERN = /(reset\s+--hard|clean\s+-[^\n]*[fdx]|push[^\n]*--force|branch\s+-D|checkout\s+--\s+\.)/i;

function fallbackFor(question: string): CoachResult {
  const normalized = question.toLowerCase();

  if (normalized.includes("push")) {
    return {
      summary: "먼저 현재 브랜치와 원격 저장소 상태를 확인한 뒤 안전하게 push 원인을 좁혀갑니다.",
      risk: "low",
      steps: [
        { command: "git status", why: "현재 브랜치와 커밋되지 않은 변경사항을 확인합니다.", risk: "low" },
        { command: "git remote -v", why: "원격 저장소 주소가 올바르게 연결되어 있는지 확인합니다.", risk: "low" },
        { command: "git branch --show-current", why: "현재 push하려는 브랜치 이름을 확인합니다.", risk: "low" },
        { command: "git push origin <현재-브랜치>", why: "확인한 현재 브랜치를 원격 저장소로 push합니다.", risk: "medium" },
      ],
      verify: "push 결과와 `git status`를 다시 확인하세요. 오류가 남으면 에러 메시지를 그대로 입력해 주세요.",
      safetyNote: "`--force` 옵션은 기존 원격 이력을 덮어쓸 수 있으므로 MVP에서는 자동 제안하지 않습니다.",
      fallback: true,
    };
  }

  if (normalized.includes("stash")) {
    return {
      summary: "현재 변경사항을 안전하게 임시 보관한 뒤 필요한 작업을 진행합니다.",
      risk: "low",
      steps: [
        { command: "git status", why: "임시 보관할 변경사항을 먼저 확인합니다.", risk: "low" },
        { command: "git stash push -u -m \"WIP: temporary save\"", why: "추적/미추적 변경사항을 설명과 함께 임시 보관합니다.", risk: "low" },
        { command: "git stash list", why: "방금 저장한 stash가 목록에 있는지 확인합니다.", risk: "low" },
      ],
      verify: "원래 작업으로 돌아오면 `git stash pop` 전 `git status`를 먼저 확인하세요.",
      fallback: true,
    };
  }

  return {
    summary: "현재 저장소 상태부터 확인하고, 결과를 바탕으로 다음 명령을 결정합니다.",
    risk: "low",
    steps: [
      { command: "git status", why: "현재 저장소 상태, 브랜치, 변경사항을 확인합니다.", risk: "low" },
      { command: "git log -5 --oneline --decorate", why: "최근 커밋 흐름을 짧게 확인합니다.", risk: "low" },
    ],
    verify: "명령 결과를 붙여넣으면 다음 안전한 단계를 안내할 수 있습니다.",
    fallback: true,
  };
}

function parseModelJson(text: string): Omit<CoachResult, "provider" | "model" | "fallback"> | null {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try {
    const parsed = JSON.parse(cleaned) as Partial<CoachResult>;
    if (!parsed.summary || !parsed.verify || !Array.isArray(parsed.steps) || parsed.steps.length === 0) return null;

    const steps: CoachStep[] = parsed.steps
      .filter((step): step is CoachStep => Boolean(step?.command && step?.why))
      .slice(0, 5)
      .map((step) => {
        const stepRisk: CoachStep["risk"] = step.risk === "high" || step.risk === "medium" ? step.risk : "low";
        return {
          command: String(step.command),
          why: String(step.why),
          risk: stepRisk,
        };
      });

    if (steps.length === 0) return null;
    const risk: CoachResult["risk"] = parsed.risk === "high" || parsed.risk === "medium" ? parsed.risk : "low";

    return {
      summary: String(parsed.summary),
      risk,
      steps,
      verify: String(parsed.verify),
      safetyNote: parsed.safetyNote ? String(parsed.safetyNote) : undefined,
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { question?: unknown; level?: unknown; context?: unknown }
    | null;

  const question = typeof body?.question === "string" ? body.question.trim() : "";
  const level: CoachLevel =
    body?.level === "intermediate" || body?.level === "advanced" || body?.level === "expert"
      ? body.level
      : "beginner";

  if (!question || question.length > 4000) {
    return NextResponse.json({ error: "question must be 1-4000 characters" }, { status: 400 });
  }

  if (HIGH_RISK_PATTERN.test(question)) {
    return NextResponse.json({
      summary: "데이터 손실 또는 원격 이력 변경 가능성이 있는 고위험 Git 명령이 포함되어 있습니다.",
      risk: "high",
      steps: [
        { command: "git status", why: "현재 변경사항을 먼저 확인합니다.", risk: "low" },
        { command: "git branch backup/safety-check", why: "현재 커밋을 가리키는 안전용 브랜치를 먼저 만듭니다.", risk: "low" },
        { command: "git reflog -10", why: "문제가 생겼을 때 돌아갈 수 있는 최근 참조 기록을 확인합니다.", risk: "low" },
      ],
      verify: "백업 브랜치와 reflog를 확인한 뒤 고위험 명령의 목적과 영향을 다시 검토하세요.",
      safetyNote: "MVP는 reset --hard, clean, force push 같은 파괴적 명령을 자동 실행하지 않습니다.",
      fallback: true,
    } satisfies CoachResult);
  }

  const contextText = body?.context ? JSON.stringify(body.context).slice(0, 2000) : "없음";
  const provider = createAIProvider();

  const prompt = `당신은 안전 중심의 AI Git Coach입니다. 사용자의 수준은 ${level}입니다.\n\n사용자 질문:\n${question}\n\n선택적 Git 상태 문맥:\n${contextText}\n\n목표:\n- 먼저 상태 확인용 읽기 전용 명령을 우선합니다.\n- 파괴적 명령(reset --hard, clean, force push 등)은 바로 제안하지 말고 백업/경고를 우선합니다.\n- 한 번에 2~5단계만 제공합니다.\n- 입문자는 쉬운 한국어로 설명합니다.\n- 실제 실행 결과를 검증하는 마지막 문장을 제공합니다.\n\n반드시 아래 JSON 형식만 출력하세요. 마크다운 코드펜스는 사용하지 마세요.\n{\n  "summary": "짧은 진단",\n  "risk": "low|medium|high",\n  "steps": [\n    {"command":"git status","why":"이 명령을 먼저 쓰는 이유","risk":"low"}\n  ],\n  "verify": "실행 후 무엇을 확인할지",\n  "safetyNote": "선택적 안전 메모"\n}`;

  try {
    const response = await provider.generate({ prompt });
    const parsed = parseModelJson(response.text);
    if (!parsed) {
      const fallback = fallbackFor(question);
      return NextResponse.json({ ...fallback, provider: response.provider, model: response.model, fallback: true });
    }

    return NextResponse.json({
      ...parsed,
      provider: response.provider,
      model: response.model,
      fallback: response.fallback ?? false,
    } satisfies CoachResult);
  } catch (error) {
    const fallback = fallbackFor(question);
    return NextResponse.json({
      ...fallback,
      safetyNote: fallback.safetyNote ?? `AI provider unavailable: ${error instanceof Error ? error.message : "unknown error"}`,
    });
  }
}
