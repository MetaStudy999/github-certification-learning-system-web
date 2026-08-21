"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { MockAttemptSummary, PublicMockQuestion } from "@/modules/mock-exams/types";

interface MockResult extends MockAttemptSummary {
  answers: Array<{ questionId: string; selectedAnswer: string; correctAnswer: string; isCorrect: boolean; explanation: string }>;
}

function timeLabel(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60).toString().padStart(2, "0");
  const rest = Math.floor(safe % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function MockExamPlayer({ courseSlug, mockSlug, questions, recommendedMinutes, targetPercent }: {
  courseSlug: string;
  mockSlug: string;
  questions: PublicMockQuestion[];
  recommendedMinutes: number;
  targetPercent: number;
}) {
  const supabase = getSupabaseBrowserClient();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(recommendedMinutes * 60);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MockResult | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setAccessToken(data.session?.access_token ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setAccessToken(session?.access_token ?? null));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!attemptId || result) return;
    const timer = window.setInterval(() => setRemaining((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [attemptId, result]);

  const answered = Object.keys(selections).length;
  const answerByQuestion = useMemo(() => new Map(result?.answers.map((answer) => [answer.questionId, answer]) ?? []), [result]);

  async function start() {
    if (!accessToken) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/mocks/${courseSlug}/${mockSlug}/start`, { method: "POST", headers: { authorization: `Bearer ${accessToken}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
      setAttemptId(payload.attemptId);
      setRemaining(payload.recommendedSeconds);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!accessToken || !attemptId) return;
    if (answered !== questions.length) {
      setMessage(`${questions.length}문항을 모두 답한 후 제출하세요. 현재 ${answered}/${questions.length}문항입니다.`);
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/mocks/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ selections }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
      setResult(payload as MockResult);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  if (!supabase) return <section className="panel"><p>Supabase 환경변수가 필요합니다.</p></section>;
  if (!accessToken) return <section className="panel"><p>Mock 응시와 기록 저장을 위해 <Link href="/login">로그인</Link>하세요.</p></section>;

  return (
    <>
      <section className="questionScore panel mockControl">
        <div><p className="eyebrow">Mock Session</p><h2>{attemptId ? timeLabel(remaining) : `${recommendedMinutes}:00`}</h2><p>권장 시간 · 목표 {targetPercent}%+</p></div>
        <div className="mockControlActions">
          <span className="badge">{answered}/{questions.length} answered</span>
          {!attemptId ? <button type="button" disabled={busy} onClick={start}>Mock 시작</button> : null}
          {attemptId && !result ? <button type="button" disabled={busy} onClick={submit}>전체 제출</button> : null}
        </div>
      </section>

      {remaining === 0 && attemptId && !result ? <section className="panel"><p>권장 60분이 지났습니다. 남은 문항을 마무리하고 제출하세요.</p></section> : null}
      {message ? <section className="panel"><p className="statusMessage">{message}</p></section> : null}
      {result ? <section className="panel mockResult"><p className="eyebrow">Result</p><h2>{result.correctAnswers}/{result.totalQuestions} · {result.scorePercent}%</h2><p><strong>{result.judgment}</strong> · 경과 {timeLabel(result.elapsedSeconds)}</p><div className="links"><Link href={`/readiness/${courseSlug}`}>Exam Readiness 확인</Link><Link href="/wrong-answers">오답 Queue</Link></div></section> : null}

      <section className="questionList">
        {questions.map((question) => {
          const answer = answerByQuestion.get(question.id);
          return <article className="questionCard" id={question.id} key={question.id}>
            <p className="eyebrow">{question.id}</p>
            <div className="questionPrompt"><ReactMarkdown>{question.prompt}</ReactMarkdown></div>
            <div className="questionOptions" role="radiogroup" aria-label={`${question.id} choices`}>
              {question.options.map((option) => <label className={`questionOption ${selections[question.id] === option.key ? "selectedOption" : ""}`} key={option.key}>
                <input type="radio" name={question.id} value={option.key} disabled={!attemptId || Boolean(result)} checked={selections[question.id] === option.key} onChange={() => setSelections((current) => ({ ...current, [question.id]: option.key }))} />
                <strong>{option.key}.</strong><span><ReactMarkdown>{option.text}</ReactMarkdown></span>
              </label>)}
            </div>
            {answer ? <div className={`answerFeedback ${answer.isCorrect ? "correctFeedback" : "incorrectFeedback"}`}><strong>{answer.isCorrect ? "정답" : `오답 · 정답 ${answer.correctAnswer}`}</strong><ReactMarkdown>{answer.explanation}</ReactMarkdown></div> : null}
          </article>;
        })}
      </section>
    </>
  );
}
