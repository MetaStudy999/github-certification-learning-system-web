"use client";

import { FormEvent, useMemo, useState } from "react";

import styles from "./coach-demo.module.css";

type Step = {
  command: string;
  why: string;
  risk: "low" | "medium" | "high";
};

type CoachResponse = {
  summary: string;
  risk: "low" | "medium" | "high";
  steps: Step[];
  verify: string;
  safetyNote?: string;
  provider?: string;
  model?: string;
  fallback?: boolean;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const initialResponse: CoachResponse = {
  summary: "push 문제는 원인이 여러 가지일 수 있습니다. 먼저 현재 상태부터 안전하게 확인하겠습니다.",
  risk: "low",
  steps: [
    { command: "git status", why: "현재 브랜치와 커밋되지 않은 변경사항을 확인합니다.", risk: "low" },
    { command: "git remote -v", why: "원격 저장소 연결 주소를 확인합니다.", risk: "low" },
    { command: "git branch --show-current", why: "현재 브랜치 이름을 확인합니다.", risk: "low" },
    { command: "git push origin main", why: "확인한 브랜치를 원격 저장소에 push합니다.", risk: "medium" },
  ],
  verify: "push 결과를 확인하고, 오류가 남으면 에러 메시지를 그대로 AI에게 알려주세요.",
  safetyNote: "강제 push(--force)는 원격 이력을 덮어쓸 수 있어 자동 실행하지 않습니다.",
  provider: "demo",
};

const commits = [
  { lane: 0, title: "Merge pull request #42", meta: "feat: dashboard", time: "2h", branch: "main" },
  { lane: 0, title: "fix: resolve login issue", meta: "MJ · verified", time: "5h" },
  { lane: 1, title: "feat: add authentication", meta: "HS · selected", time: "1d", branch: "feature/login", active: true },
  { lane: 1, title: "refactor: auth flow", meta: "HS · clean up", time: "1d" },
  { lane: 1, title: "feat: login page UI", meta: "HS · component", time: "2d" },
  { lane: 2, title: "Merge branch 'develop'", meta: "MJ · merge", time: "3d", branch: "develop" },
  { lane: 2, title: "feat: user profile", meta: "DK · profile", time: "3d" },
  { lane: 0, title: "docs: update README", meta: "SY · docs", time: "5d" },
  { lane: 2, title: "release: v1.0.0", meta: "MJ · release", time: "1w", branch: "release/v1.0" },
];

function laneClass(lane: number) {
  if (lane === 1) return styles.node1;
  if (lane === 2) return styles.node2;
  return styles.node0;
}

function lineClass(lane: number) {
  if (lane === 1) return styles.lane1;
  if (lane === 2) return styles.lane2;
  return styles.lane0;
}

export default function CoachDemoPage() {
  const [question, setQuestion] = useState("push가 안 돼요. 어떻게 해야 하나요?");
  const [response, setResponse] = useState<CoachResponse>(initialResponse);
  const [selectedStep, setSelectedStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "$ git status",
    "On branch main",
    "Your branch is up to date with 'origin/main'.",
    "Changes not staged for commit:",
    "  modified: src/components/Header.tsx",
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "user", text: "push가 안 돼요. 어떻게 해야 하나요?" },
    { role: "assistant", text: initialResponse.summary },
  ]);

  const current = response.steps[selectedStep] ?? response.steps[0];
  const progress = useMemo(() => `${Math.max(1, selectedStep + 1)}/${Math.max(1, response.steps.length)}`, [response.steps.length, selectedStep]);

  async function ask(questionText: string) {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);

    try {
      const apiResponse = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          level: "beginner",
          context: {
            branch: "main",
            changedFiles: ["src/components/Header.tsx"],
            remote: "origin",
          },
        }),
      });

      const payload = (await apiResponse.json()) as CoachResponse | { error?: string };
      if (!apiResponse.ok || !("steps" in payload)) {
        throw new Error("error" in payload ? payload.error : `HTTP ${apiResponse.status}`);
      }

      setResponse(payload);
      setSelectedStep(0);
      setMessages((prev) => [...prev, { role: "assistant", text: payload.summary }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `AI 연결 오류가 있어 안전한 기본 가이드를 유지합니다. (${error instanceof Error ? error.message : "unknown"})` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await ask(question);
  }

  function simulateRun() {
    if (!current) return;
    setTerminalHistory((prev) => [
      ...prev,
      `$ ${current.command}`,
      current.command.startsWith("git status")
        ? "On branch main · working tree has 1 modified file"
        : current.command.startsWith("git remote")
          ? "origin  git@github.com:demo/awesome-project.git (fetch/push)"
          : "✓ demo command completed safely",
    ]);
    if (selectedStep < response.steps.length - 1) setSelectedStep((value) => value + 1);
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brand}><span className={styles.brandMark}>⌘</span> AI Git Coach</div>
          <div className={styles.tagline}>Learn Git. Solve Problems. Get Certified.</div>
          <div className={styles.statusPill}>● AI + Git Safety Mode</div>
        </header>

        <div className={styles.workspace}>
          <section className={`${styles.panel} ${styles.graphPanel}`}>
            <div className={styles.panelHeader}>
              <div><h2>Git Graph</h2><p>awesome-project · main</p></div>
              <span className={styles.smallBadge}>LIVE MAP</span>
            </div>
            <div className={styles.graphTabs}>
              <span className={`${styles.graphTab} ${styles.graphTabActive}`}>Graph</span>
              <span className={styles.graphTab}>Branches</span>
              <span className={styles.graphTab}>Tags</span>
            </div>
            <div className={styles.graphList}>
              {commits.map((commit, index) => (
                <div key={`${commit.title}-${index}`} className={`${styles.commitRow} ${commit.active ? styles.commitRowActive : ""}`}>
                  <div className={styles.lanes}>
                    <span className={`${styles.laneLine} ${lineClass(commit.lane)}`} />
                    <span className={`${styles.node} ${laneClass(commit.lane)} ${commit.active ? styles.nodeGlow : ""}`} />
                  </div>
                  <div className={styles.commitText}>
                    <strong>{commit.title}</strong>
                    <span>{commit.meta}</span>
                    {commit.branch ? <span className={styles.branchPill}>{commit.branch}</span> : null}
                  </div>
                  <span className={styles.commitTime}>{commit.time}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><h2>Guided Terminal</h2><p>한 단계씩 실행하고 결과를 확인합니다.</p></div>
              <span className={styles.smallBadge}>Step {progress}</span>
            </div>
            <div className={styles.centerBody}>
              <div className={styles.progressLine}>
                <span>현재 진행</span>
                <div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${((selectedStep + 1) / Math.max(1, response.steps.length)) * 100}%` }} /></div>
                <span>{progress}</span>
              </div>

              <article className={styles.commandCard}>
                <div className={styles.commandLabel}>지금 터미널에 입력할 명령어</div>
                <div className={styles.commandText}>{current?.command ?? "git status"}</div>
                <div className={styles.commandWhy}>{current?.why ?? "현재 저장소 상태를 확인합니다."}</div>
                <div className={styles.actionRow}>
                  <button type="button" className={styles.runButton} onClick={simulateRun}>▶ 실행 시뮬레이션</button>
                  <button type="button" className={styles.secondaryButton} onClick={() => navigator.clipboard?.writeText(current?.command ?? "git status")}>명령어 복사</button>
                </div>
              </article>

              <article className={styles.explainCard}>
                <h3>왜 이 명령어를 먼저 쓰나요?</h3>
                <p>{current?.why} 실행 후 결과를 다시 읽어 다음 명령을 결정합니다. 고위험 명령은 자동 실행하지 않습니다.</p>
              </article>

              <div className={styles.terminal} aria-label="terminal demo">
                {terminalHistory.map((line, index) => (
                  <div key={`${line}-${index}`} className={line.startsWith("$") ? styles.prompt : line.includes("modified") ? styles.terminalWarn : styles.terminalDim}>{line}</div>
                ))}
                <div><span className={styles.prompt}>dev@project ~/awesome-project (main) $ </span>▌</div>
              </div>
            </div>
          </section>

          <section className={`${styles.panel} ${styles.chatPanel}`}>
            <div className={styles.panelHeader}>
              <div><h2>AI Coach</h2><p>{response.provider ?? "demo"}{response.model ? ` · ${response.model}` : ""}</p></div>
              <span className={styles.smallBadge}>● Online</span>
            </div>
            <div className={styles.chatBody}>
              <div className={styles.chatScroll}>
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={message.role === "user" ? styles.userBubble : styles.aiBubble}>{message.text}</div>
                ))}

                <div className={styles.stepList}>
                  {response.steps.map((step, index) => (
                    <button key={`${step.command}-${index}`} type="button" className={`${styles.stepButton} ${index === selectedStep ? styles.stepButtonActive : ""}`} onClick={() => setSelectedStep(index)}>
                      <code>{index + 1}. {step.command}</code>
                      <span>{step.why} · 위험도 {step.risk}</span>
                    </button>
                  ))}
                </div>

                <div className={styles.aiBubble}><strong>검증</strong><br />{response.verify}</div>
                {response.safetyNote ? <div className={styles.safety}>⚠ {response.safetyNote}</div> : null}
              </div>

              <div className={styles.chatComposer}>
                <div className={styles.quickRow}>
                  <button type="button" className={styles.suggestionButton} onClick={() => void ask("브랜치를 잘못 만들었어요")}>브랜치 문제</button>
                  <button type="button" className={styles.suggestionButton} onClick={() => void ask("stash 사용법이 생각나지 않아요")}>stash</button>
                  <button type="button" className={styles.suggestionButton} onClick={() => void ask("git reset --hard를 해도 되나요?")}>위험 명령</button>
                </div>
                <form className={styles.inputRow} onSubmit={submit}>
                  <input className={styles.input} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Git 문제나 에러 메시지를 입력하세요" />
                  <button className={`${styles.sendButton} ${loading ? styles.loading : ""}`} disabled={loading}>{loading ? "..." : "전송"}</button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
