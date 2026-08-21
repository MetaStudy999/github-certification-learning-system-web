"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { GitHubLabDefinition } from "@/modules/github-labs/definitions";
import type { GitHubConnectionStatus, GitHubLabSlug, LabVerificationResult } from "@/modules/github-labs/types";

interface AttemptRow {
  id: string;
  lab_slug: string;
  repository_full_name: string;
  status: "PASS" | "RETRY";
  verified_at: string;
  checks: Array<{ check_code: string; status: "PASS" | "FAIL"; message: string; canonical_url: string | null }>;
}

async function jsonOrError(response: Response) {
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
  return payload;
}

export function GitHubLabsDashboard({ definitions }: { definitions: GitHubLabDefinition[] }) {
  const supabase = getSupabaseBrowserClient();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [connection, setConnection] = useState<GitHubConnectionStatus | null>(null);
  const [pat, setPat] = useState("");
  const [labSlug, setLabSlug] = useState<GitHubLabSlug>("040-github-flow");
  const [repositoryFullName, setRepositoryFullName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [commitSha, setCommitSha] = useState("");
  const [issueNumber, setIssueNumber] = useState("");
  const [pullRequestNumber, setPullRequestNumber] = useState("");
  const [result, setResult] = useState<LabVerificationResult | null>(null);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setAccessToken(data.session?.access_token ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setAccessToken(session?.access_token ?? null));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  async function refresh(token = accessToken) {
    if (!token) return;
    const headers = { authorization: `Bearer ${token}` };
    const [connectionResponse, attemptsResponse] = await Promise.all([
      fetch("/api/github/connection", { headers, cache: "no-store" }),
      fetch("/api/github/labs/attempts", { headers, cache: "no-store" }),
    ]);
    setConnection(await jsonOrError(connectionResponse) as GitHubConnectionStatus);
    const history = await jsonOrError(attemptsResponse) as { attempts: AttemptRow[] };
    setAttempts(history.attempts);
  }

  useEffect(() => {
    if (!accessToken) {
      setConnection(null);
      setAttempts([]);
      return;
    }
    void refresh(accessToken).catch((error) => setMessage(error instanceof Error ? error.message : String(error)));
  }, [accessToken]);

  async function connect() {
    if (!accessToken || !pat) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/github/connection", {
        method: "POST",
        headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
        body: JSON.stringify({ token: pat }),
      });
      setConnection(await jsonOrError(response) as GitHubConnectionStatus);
      setPat("");
      setMessage("GitHub 연결을 검증하고 서버에 암호화 저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    if (!accessToken) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/github/connection", { method: "DELETE", headers: { authorization: `Bearer ${accessToken}` } });
      await jsonOrError(response);
      setConnection({ connected: false });
      setResult(null);
      setMessage("GitHub 연결을 삭제했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  const needsBranch = labSlug === "030-branch-workflow" || labSlug === "040-github-flow";
  const needsFlow = labSlug === "040-github-flow";
  const definition = useMemo(() => definitions.find((item) => item.slug === labSlug), [definitions, labSlug]);

  async function verifyLab() {
    if (!accessToken || !repositoryFullName) return;
    setBusy(true);
    setMessage("");
    setResult(null);
    try {
      const response = await fetch("/api/github/labs/verify", {
        method: "POST",
        headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug: "001-foundations",
          labSlug,
          repositoryFullName,
          ...(needsBranch ? { branchName } : {}),
          ...(needsFlow ? {
            commitSha,
            issueNumber: Number(issueNumber),
            pullRequestNumber: Number(pullRequestNumber),
          } : {}),
        }),
      });
      setResult(await jsonOrError(response) as LabVerificationResult);
      await refresh(accessToken);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!supabase ? <section className="panel"><p>Supabase 환경변수가 필요합니다.</p></section> : null}
      {supabase && !accessToken ? <section className="panel"><p>GitHub Lab 검증을 사용하려면 먼저 <Link href="/login">로그인</Link>하세요.</p></section> : null}
      {message ? <section className="panel"><p className="statusMessage">{message}</p></section> : null}

      <section className="panel">
        <div className="panelHeader">
          <div><p className="eyebrow">P9 · GitHub Connection</p><h2>읽기 전용 Lab 검증 연결</h2></div>
          <span className="badge">{connection?.connected ? `CONNECTED · ${connection.githubLogin}` : "NOT CONNECTED"}</span>
        </div>
        <p>Local P9에서는 Fine-grained PAT를 서버가 GitHub API로 검증한 뒤 AES-256-GCM으로 암호화 저장합니다. 저장된 Token은 브라우저로 다시 반환하지 않습니다.</p>
        <p><strong>권장 Repository 권한:</strong> Contents — Read, Issues — Read, Pull requests — Read, Actions — Read. Repository access는 학습용 Repository만 선택하세요.</p>
        {accessToken && !connection?.connected ? (
          <div>
            <label>Fine-grained PAT<input type="password" autoComplete="off" value={pat} onChange={(event) => setPat(event.target.value)} placeholder="github_pat_..." /></label>
            <div className="buttonRow"><button type="button" disabled={busy || pat.length < 20} onClick={connect}>GitHub 연결</button></div>
          </div>
        ) : null}
        {connection?.connected ? (
          <div>
            <p>Token fingerprint: <code>{connection.tokenFingerprint}</code> · 연결 방식: {connection.connectionKind}</p>
            <div className="buttonRow"><button className="buttonSecondary" type="button" disabled={busy} onClick={disconnect}>연결 삭제</button></div>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <div className="panelHeader"><div><p className="eyebrow">Verification Rule Engine</p><h2>실제 GitHub 객체 검증</h2></div><span className="badge">PASS / RETRY</span></div>
        <label>Lab
          <select value={labSlug} onChange={(event) => setLabSlug(event.target.value as GitHubLabSlug)}>
            {definitions.map((item) => <option key={item.slug} value={item.slug}>{item.code} · {item.title}</option>)}
          </select>
        </label>
        {definition ? <p>{definition.verification}</p> : null}
        <label>Repository (owner/repo)<input value={repositoryFullName} onChange={(event) => setRepositoryFullName(event.target.value)} placeholder="MetaStudy999/github-foundations-lab" /></label>
        {needsBranch ? <label>작업 Branch<input value={branchName} onChange={(event) => setBranchName(event.target.value)} placeholder="docs/add-study-goal" /></label> : null}
        {needsFlow ? <>
          <label>Commit SHA<input value={commitSha} onChange={(event) => setCommitSha(event.target.value)} placeholder="40-character commit SHA" /></label>
          <label>Issue Number<input inputMode="numeric" value={issueNumber} onChange={(event) => setIssueNumber(event.target.value)} placeholder="7" /></label>
          <label>Pull Request Number<input inputMode="numeric" value={pullRequestNumber} onChange={(event) => setPullRequestNumber(event.target.value)} placeholder="8" /></label>
        </> : null}
        <div className="buttonRow"><button type="button" disabled={busy || !accessToken || !connection?.connected || !repositoryFullName} onClick={verifyLab}>GitHub API로 검증</button></div>
      </section>

      {result ? <section className="panel">
        <div className="panelHeader"><div><p className="eyebrow">Latest Verification</p><h2>{result.labSlug}</h2></div><span className="badge">{result.status}</span></div>
        <p>{result.repositoryFullName} · Rule {result.ruleVersion}</p>
        <div className="grid">
          {result.checks.map((check) => <article className="card" key={`${check.checkCode}-${check.objectId ?? "none"}`}><span className="code">{check.status}</span><h3>{check.checkCode}</h3><p>{check.message}</p>{check.canonicalUrl ? <a href={check.canonicalUrl} target="_blank" rel="noreferrer">GitHub Evidence ↗</a> : null}</article>)}
        </div>
      </section> : null}

      <section className="panel">
        <div className="panelHeader"><div><p className="eyebrow">Evidence History</p><h2>최근 Lab 검증</h2></div><span className="badge">{attempts.length}</span></div>
        {attempts.length === 0 ? <p>아직 검증 기록이 없습니다.</p> : <div className="grid">{attempts.slice(0, 12).map((attempt) => <article className="card" key={attempt.id}><span className="code">{attempt.status}</span><h3>{attempt.lab_slug}</h3><p>{attempt.repository_full_name}</p><p>{new Date(attempt.verified_at).toLocaleString()}</p></article>)}</div>}
      </section>
    </>
  );
}
