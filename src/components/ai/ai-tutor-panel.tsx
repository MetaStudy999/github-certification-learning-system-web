"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

import type { TutorResponse, TutorStage } from "@/modules/ai/tutor/types";

const stages: Array<{ stage: TutorStage; label: string; description: string }> = [
  { stage: "HINT", label: "1. Hint", description: "정답을 말하지 않는 핵심 단서" },
  { stage: "CONCEPT", label: "2. Concept", description: "필수 개념과 유사 개념 비교" },
  { stage: "SIMILAR_EXAMPLE", label: "3. Similar Example", description: "다른 상황으로 한 번 더 이해" },
  { stage: "EXPLANATION", label: "5. Explanation", description: "실제 제출 이력이 있을 때 정답·오답 이유 해설" },
];

export function AITutorPanel({
  accessToken,
  courseSlug,
  setSlug,
  questionId,
  attempted,
}: {
  accessToken: string | null;
  courseSlug: string;
  setSlug: string;
  questionId: string;
  attempted: boolean;
}) {
  const [result, setResult] = useState<TutorResponse | null>(null);
  const [busy, setBusy] = useState<TutorStage | null>(null);
  const [message, setMessage] = useState("");

  async function requestTutor(stage: TutorStage) {
    if (!accessToken) return;
    setBusy(stage);
    setMessage("");
    try {
      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ courseSlug, setSlug, questionId, stage }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
      setResult(payload as TutorResponse);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(null);
    }
  }

  if (!accessToken) {
    return <div className="aiTutorPanel"><p><Link href="/login">로그인</Link>하면 AI Tutor의 단계별 도움을 사용할 수 있습니다.</p></div>;
  }

  return (
    <div className="aiTutorPanel">
      <div className="aiTutorHeader">
        <div><p className="eyebrow">P7 · AI Tutor</p><strong>Hint → Concept → Similar Example → Retry → Explanation</strong></div>
        <span className="badge">AI ≠ 채점기</span>
      </div>
      <p className="aiTutorNote">Hint~Similar Example에서는 선택지와 정답을 AI에 제공하지 않습니다. Explanation은 DB의 실제 제출 이력을 서버가 확인한 뒤에만 열립니다.</p>
      <div className="aiTutorActions">
        {stages.map((item) => (
          <button
            className="buttonSecondary"
            type="button"
            disabled={busy !== null}
            onClick={() => requestTutor(item.stage)}
            key={item.stage}
            title={item.stage === "EXPLANATION" && !attempted ? "현재 또는 이전 세션의 실제 제출 기록이 필요합니다." : item.description}
          >
            {busy === item.stage ? "생성 중…" : item.label}
          </button>
        ))}
      </div>
      {!attempted ? <p className="aiTutorNote"><strong>4. Retry:</strong> 위 도움을 참고해 선택지를 고르고 기존 정답 제출 버튼으로 다시 풀어보세요. 이전 제출 이력이 있다면 Explanation은 서버 확인 후 바로 열립니다.</p> : null}
      {message ? <p className="statusMessage">{message}</p> : null}
      {result ? (
        <div className="aiTutorResponse">
          <div className="aiTutorMeta"><strong>{result.stage}</strong><span>{result.provider}{result.model ? ` · ${result.model}` : ""}{result.fallback ? " · fallback" : ""}</span></div>
          <ReactMarkdown>{result.text}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
}
