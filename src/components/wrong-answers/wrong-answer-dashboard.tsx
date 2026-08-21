"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ERROR_CODES, type ErrorCode } from "@/modules/wrong-answers/types";

interface WrongAnswerRow {
  id: string;
  course_slug: string;
  set_slug: string;
  question_id: string;
  error_code: ErrorCode | null;
  reflection: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "CLOSED";
  retry_stage: "DAY_1" | "DAY_7" | "CLOSED";
  wrong_count: number;
  correct_retry_count: number;
  first_wrong_at: string;
  next_retry_at: string | null;
}

interface EditorState {
  errorCode: ErrorCode;
  reflection: string;
}

const ERROR_CODE_LABELS: Record<ErrorCode, string> = {
  CONCEPT: "CONCEPT · 개념 부족",
  COMPARE: "COMPARE · 유사 개념 혼동",
  READING: "READING · 조건 해석 실패",
  MEMORY: "MEMORY · 기억 실패",
  PRACTICE: "PRACTICE · 실습 부족",
  SCOPE: "SCOPE · 시험 범위 연결 실패",
};

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function WrongAnswerDashboard({ courseSlug }: { courseSlug: string }) {
  const supabase = getSupabaseBrowserClient();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [rows, setRows] = useState<WrongAnswerRow[]>([]);
  const [editors, setEditors] = useState<Record<string, EditorState>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? null;
      setAccessToken(token);
      if (!token) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("wrong_answer_items")
        .select("id,course_slug,set_slug,question_id,error_code,reflection,priority,status,retry_stage,wrong_count,correct_retry_count,first_wrong_at,next_retry_at")
        .eq("course_slug", courseSlug)
        .order("first_wrong_at", { ascending: false });

      if (error) setMessage(error.message);
      const nextRows = (data ?? []) as WrongAnswerRow[];
      setRows(nextRows);
      setEditors(Object.fromEntries(nextRows.map((row) => [row.id, {
        errorCode: row.error_code ?? "CONCEPT",
        reflection: row.reflection ?? "",
      }])));
      setLoading(false);
    };

    void load();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setAccessToken(session?.access_token ?? null));
    return () => data.subscription.unsubscribe();
  }, [courseSlug, supabase]);

  const summary = useMemo(() => {
    const open = rows.filter((row) => row.status === "OPEN");
    const now = Date.now();
    return {
      open: open.length,
      high: open.filter((row) => row.priority === "HIGH").length,
      due: open.filter((row) => row.next_retry_at && new Date(row.next_retry_at).getTime() <= now).length,
      closed: rows.filter((row) => row.status === "CLOSED").length,
    };
  }, [rows]);

  async function saveClassification(row: WrongAnswerRow) {
    if (!accessToken) return;
    const editor = editors[row.id];
    if (!editor) return;
    setBusyId(row.id);
    setMessage("");

    try {
      const response = await fetch(`/api/wrong-answers/${row.id}/classify`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(editor),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
      const updated = payload.wrongAnswer;
      setRows((current) => current.map((item) => item.id === row.id ? {
        ...item,
        error_code: updated.errorCode,
        priority: updated.priority,
        reflection: editor.reflection,
      } : item));
      setMessage(`${row.question_id} 오답 원인과 학습 메모를 저장했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <section className="panel"><p>오답 Queue를 불러오는 중입니다.</p></section>;
  if (!supabase) return <section className="panel"><p>Supabase 환경변수가 필요합니다.</p></section>;
  if (!accessToken) return <section className="panel"><p><Link href="/login">로그인</Link>하면 사용자별 오답 Queue를 사용할 수 있습니다.</p></section>;

  return (
    <>
      <section className="grid wrongAnswerSummary" aria-label="Wrong answer summary">
        <article className="card"><span className="code">OPEN</span><h3>{summary.open}</h3><p>재학습 필요</p></article>
        <article className="card"><span className="code">HIGH</span><h3>{summary.high}</h3><p>최우선 오답</p></article>
        <article className="card"><span className="code">DUE</span><h3>{summary.due}</h3><p>지금 재도전 가능</p></article>
        <article className="card"><span className="code">CLOSED</span><h3>{summary.closed}</h3><p>복습 주기 완료</p></article>
      </section>

      {message ? <section className="panel"><p className="statusMessage">{message}</p></section> : null}
      {!rows.length ? <section className="panel"><p>아직 등록된 오답이 없습니다. Question Bank에서 틀린 문항이 자동으로 이곳에 등록됩니다.</p></section> : null}

      <section className="questionList" aria-label="Wrong answer queue">
        {rows.map((row) => {
          const editor = editors[row.id] ?? { errorCode: "CONCEPT" as ErrorCode, reflection: "" };
          const due = row.next_retry_at ? new Date(row.next_retry_at).getTime() <= Date.now() : false;
          const retryHref = `/questions/${row.course_slug}/${row.set_slug}?retry=${encodeURIComponent(row.id)}&question=${encodeURIComponent(row.question_id)}#${row.question_id}`;

          return (
            <article className="questionCard" key={row.id}>
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">{row.question_id} · {row.priority}</p>
                  <h2>{row.status} · {row.retry_stage}</h2>
                </div>
                <span className="badge">오답 {row.wrong_count}회 · Retry 정답 {row.correct_retry_count}회</span>
              </div>

              <div className="activityList">
                <div><strong>오답 원인</strong><span>{row.error_code ? ERROR_CODE_LABELS[row.error_code] : "미분류"}</span></div>
                <div><strong>다음 재도전</strong><span>{row.status === "CLOSED" ? "CLOSED" : `${formatDate(row.next_retry_at)}${due ? " · DUE" : ""}`}</span></div>
              </div>

              <div className="wrongAnswerEditor">
                <label>
                  원인 코드
                  <select
                    value={editor.errorCode}
                    onChange={(event) => setEditors((current) => ({
                      ...current,
                      [row.id]: { ...editor, errorCode: event.target.value as ErrorCode },
                    }))}
                  >
                    {ERROR_CODES.map((code) => <option value={code} key={code}>{ERROR_CODE_LABELS[code]}</option>)}
                  </select>
                </label>
                <label>
                  왜 틀렸는지 / 올바른 개념 한 문장
                  <textarea
                    maxLength={2000}
                    rows={3}
                    value={editor.reflection}
                    onChange={(event) => setEditors((current) => ({
                      ...current,
                      [row.id]: { ...editor, reflection: event.target.value },
                    }))}
                    placeholder="예: git fetch는 원격 변경 정보를 가져오지만 현재 브랜치에 자동 통합하지 않는다."
                  />
                </label>
              </div>

              <div className="buttonRow">
                <button type="button" disabled={busyId === row.id} onClick={() => saveClassification(row)}>
                  원인/메모 저장
                </button>
                {row.status === "OPEN" ? <Link href={retryHref}>{due ? "지금 재도전" : "미리 재도전"}</Link> : null}
                <Link href={`/questions/${row.course_slug}/${row.set_slug}#${row.question_id}`}>원문 문제 보기</Link>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
