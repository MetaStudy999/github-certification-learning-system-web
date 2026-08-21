"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useEffect, useMemo, useState } from "react";

import { AITutorPanel } from "@/components/ai/ai-tutor-panel";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { PublicQuestion } from "@/modules/question-bank/types";

interface WrongAnswerResult {
  id: string;
  courseSlug: string;
  setSlug: string;
  questionId: string;
  errorCode: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "CLOSED";
  retryStage: "DAY_1" | "DAY_7" | "CLOSED";
  wrongCount: number;
  correctRetryCount: number;
  nextRetryAt: string | null;
}

interface SubmissionResult {
  attemptId: string;
  attemptedAt: string;
  mode: "practice" | "retry";
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  wrongAnswer: WrongAnswerResult | null;
}

interface RetryContext {
  wrongAnswerId: string;
  questionId: string;
}

export function QuestionSetPlayer({ courseSlug, setSlug, questions, retryContext = null }: {
  courseSlug: string;
  setSlug: string;
  questions: PublicQuestion[];
  retryContext?: RetryContext | null;
}) {
  const supabase = getSupabaseBrowserClient();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, SubmissionResult>>({});
  const [busyQuestion, setBusyQuestion] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setAccessToken(data.session?.access_token ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setAccessToken(session?.access_token ?? null));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const correctCount = useMemo(() => Object.values(results).filter((result) => result.isCorrect).length, [results]);
  const answeredCount = Object.keys(results).length;

  async function submit(questionId: string) {
    const answer = selected[questionId];
    if (!answer || !accessToken) return;
    const isRetry = retryContext?.questionId === questionId;
    setBusyQuestion(questionId);
    setMessage("");
    try {
      const response = await fetch(`/api/questions/${courseSlug}/${setSlug}/${questionId}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ selectedAnswer: answer, ...(isRetry ? { mode: "retry", wrongAnswerId: retryContext.wrongAnswerId } : {}) }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
      setResults((current) => ({ ...current, [questionId]: payload as SubmissionResult }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyQuestion(null);
    }
  }

  return (
    <>
      <section className="questionScore panel"><div><p className="eyebrow">Current Set</p><h2>{correctCount} / {answeredCount || 0}</h2></div><span className="badge">{answeredCount}/{questions.length} answered</span></section>
      {retryContext ? <section className="panel"><p className="eyebrow">P5 Retry Mode</p><p><strong>{retryContext.questionId}</strong> 오답 재도전입니다. 이 문항의 제출만 Retry Queue 단계에 반영됩니다.</p><div className="links"><Link href="/wrong-answers">오답 Queue로 돌아가기</Link></div></section> : null}
      {!supabase ? <section className="panel"><p>Supabase 환경변수가 필요합니다.</p></section> : null}
      {supabase && !accessToken ? <section className="panel"><p>정답 제출과 Attempt 저장을 위해 <Link href="/login">로그인</Link>하세요.</p></section> : null}
      {message ? <section className="panel"><p className="statusMessage">{message}</p></section> : null}

      <section className="questionList">
        {questions.map((question) => {
          const result = results[question.id];
          const isRetry = retryContext?.questionId === question.id;
          const retryClosed = isRetry && result?.wrongAnswer?.status === "CLOSED";
          return (
            <article className="questionCard" id={question.id} key={question.id}>
              <p className="eyebrow">{question.id}{isRetry ? " · RETRY" : ""}</p>
              <div className="questionPrompt"><ReactMarkdown>{question.prompt}</ReactMarkdown></div>
              <div className="questionOptions" role="radiogroup" aria-label={`${question.id} choices`}>
                {question.options.map((option) => <label className={`questionOption ${selected[question.id] === option.key ? "selectedOption" : ""}`} key={option.key}><input type="radio" name={question.id} value={option.key} checked={selected[question.id] === option.key} disabled={retryClosed} onChange={() => setSelected((current) => ({ ...current, [question.id]: option.key }))}/><strong>{option.key}.</strong><span><ReactMarkdown>{option.text}</ReactMarkdown></span></label>)}
              </div>
              <div className="buttonRow"><button type="button" disabled={!accessToken || !selected[question.id] || busyQuestion === question.id || retryClosed} onClick={() => submit(question.id)}>{retryClosed ? "Retry CLOSED" : isRetry ? "오답 재도전" : result ? "다시 제출" : "정답 제출"}</button></div>

              <AITutorPanel accessToken={accessToken} courseSlug={courseSlug} setSlug={setSlug} questionId={question.id} attempted={Boolean(result)} />

              {result ? <div className={`answerFeedback ${result.isCorrect ? "correctFeedback" : "incorrectFeedback"}`}><strong>{result.isCorrect ? "정답입니다." : `오답입니다. 정답은 ${result.correctAnswer}입니다.`}</strong><ReactMarkdown>{result.explanation}</ReactMarkdown>{result.wrongAnswer ? <div className="retryFeedback"><p><strong>오답 Queue:</strong> {result.wrongAnswer.priority} · {result.wrongAnswer.status} · {result.wrongAnswer.retryStage}</p>{result.mode === "practice" && !result.isCorrect ? <p>오답 Queue에 자동 등록했습니다. 원인 코드를 분류한 뒤 +1일 재도전을 진행하세요.</p> : null}{result.mode === "retry" && result.isCorrect && result.wrongAnswer.retryStage === "DAY_7" ? <p>DAY_1 재도전을 통과했습니다. 다음 단계는 DAY_7입니다.</p> : null}{result.mode === "retry" && result.wrongAnswer.status === "CLOSED" ? <p>DAY_7까지 통과하여 이 오답 Cycle을 CLOSED 처리했습니다.</p> : null}{result.mode === "retry" && !result.isCorrect ? <p>재도전에서 다시 틀려 HIGH Priority로 올라가고 DAY_1부터 다시 시작합니다.</p> : null}<Link href="/wrong-answers">오답 Queue 확인 →</Link></div> : null}</div> : null}
            </article>
          );
        })}
      </section>
    </>
  );
}
