"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { PublicQuestion } from "@/modules/question-bank/types";

interface SubmissionResult {
  attemptId: string;
  attemptedAt: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

export function QuestionSetPlayer({ courseSlug, setSlug, questions }: { courseSlug: string; setSlug: string; questions: PublicQuestion[] }) {
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
    setBusyQuestion(questionId);
    setMessage("");

    try {
      const response = await fetch(`/api/questions/${courseSlug}/${setSlug}/${questionId}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ selectedAnswer: answer }),
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
      <section className="questionScore panel">
        <div><p className="eyebrow">Current Set</p><h2>{correctCount} / {answeredCount || 0}</h2></div>
        <span className="badge">{answeredCount}/{questions.length} answered</span>
      </section>

      {!supabase ? <section className="panel"><p>Supabase 환경변수가 필요합니다.</p></section> : null}
      {supabase && !accessToken ? <section className="panel"><p>정답 제출과 Attempt 저장을 위해 <Link href="/login">로그인</Link>하세요.</p></section> : null}
      {message ? <section className="panel"><p className="statusMessage">{message}</p></section> : null}

      <section className="questionList">
        {questions.map((question) => {
          const result = results[question.id];
          return (
            <article className="questionCard" id={question.id} key={question.id}>
              <p className="eyebrow">{question.id}</p>
              <div className="questionPrompt"><ReactMarkdown>{question.prompt}</ReactMarkdown></div>
              <div className="questionOptions" role="radiogroup" aria-label={`${question.id} choices`}>
                {question.options.map((option) => (
                  <label className={`questionOption ${selected[question.id] === option.key ? "selectedOption" : ""}`} key={option.key}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option.key}
                      checked={selected[question.id] === option.key}
                      onChange={() => setSelected((current) => ({ ...current, [question.id]: option.key }))}
                    />
                    <strong>{option.key}.</strong>
                    <span><ReactMarkdown>{option.text}</ReactMarkdown></span>
                  </label>
                ))}
              </div>
              <div className="buttonRow">
                <button type="button" disabled={!accessToken || !selected[question.id] || busyQuestion === question.id} onClick={() => submit(question.id)}>
                  {result ? "다시 제출" : "정답 제출"}
                </button>
              </div>

              {result ? (
                <div className={`answerFeedback ${result.isCorrect ? "correctFeedback" : "incorrectFeedback"}`}>
                  <strong>{result.isCorrect ? "정답입니다." : `오답입니다. 정답은 ${result.correctAnswer}입니다.`}</strong>
                  <ReactMarkdown>{result.explanation}</ReactMarkdown>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </>
  );
}
