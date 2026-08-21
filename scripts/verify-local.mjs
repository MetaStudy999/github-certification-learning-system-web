import { existsSync } from "node:fs";
import { resolve } from "node:path";

let failures = 0;
const check = (condition, pass, fail, required = true) => {
  if (condition) console.log(`[PASS] ${pass}`);
  else if (required) {
    failures += 1;
    console.error(`[FAIL] ${fail}`);
  } else console.warn(`[WARN] ${fail}`);
};

const major = Number(process.versions.node.split(".")[0]);
check(major >= 22, `Node ${process.version}`, `Node 22+ required; current ${process.version}`);

for (const path of [
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  ".env.example",
  "src/app/page.tsx",
  "src/modules/content/content-service.ts",
  "src/app/api/content/health/route.ts",
  "src/modules/question-bank/parser.ts",
  "src/modules/question-bank/question-bank-service.ts",
  "src/app/api/questions/health/route.ts",
  "supabase/migrations/20260821231500_p4_question_bank.sql",
  "src/modules/wrong-answers/types.ts",
  "src/modules/wrong-answers/wrong-answer-service.ts",
  "src/components/wrong-answers/wrong-answer-dashboard.tsx",
  "src/app/wrong-answers/page.tsx",
  "src/app/api/wrong-answers/[wrongAnswerId]/classify/route.ts",
  "supabase/migrations/20260821234500_p5_wrong_answer_engine.sql",
  "src/modules/mock-exams/mock-exam-service.ts",
  "src/modules/readiness/readiness-service.ts",
  "supabase/migrations/20260822001500_p6_mock_readiness.sql",
  "src/modules/ai/tutor/tutor-service.ts",
  "src/components/ai/ai-tutor-panel.tsx",
  "src/app/api/ai/tutor/route.ts",
  "supabase/migrations/20260822054000_p7_ai_tutor.sql",
  "src/modules/rag/index-service.ts",
  "src/modules/rag/search-service.ts",
  "src/modules/rag/tutor-context.ts",
  "src/modules/rag/embedding/provider-factory.ts",
  "src/app/api/rag/health/route.ts",
  "src/app/api/rag/index/route.ts",
  "src/app/api/rag/search/route.ts",
  "supabase/migrations/20260822065000_p8_rag_grounding.sql",
  "docs/development/170-p8-rag-grounding.md",
  "docs/development/180-p8-verification.md",
]) {
  check(existsSync(resolve(path)), `${path} exists`, `${path} missing`);
}

check(existsSync(resolve("supabase/config.toml")), "Supabase config initialized", "Supabase config not initialized yet — run npm run supabase:init", false);

const contentRoot = resolve(process.cwd(), process.env.GCLS_CONTENT_DIR ?? "../github-certification-learning-system");
const localContentAvailable = existsSync(resolve(contentRoot, "001-foundations"));
const localContentRequired = process.env.GCLS_CONTENT_PROVIDER === "local" || process.env.VERIFY_CONTENT === "1";
check(localContentAvailable, `GCLS content repository found: ${contentRoot}`, `GCLS content repository not found: ${contentRoot}`, localContentRequired);

if (localContentAvailable) {
  check(existsSync(resolve(contentRoot, "001-foundations/020-terms/README.md")), "GH-900 RAG-safe Terms source found", "GH-900 Terms source missing", localContentRequired);
  check(existsSync(resolve(contentRoot, "001-foundations/080-question-bank/010-basics/README.md")), "GH-900 Question Bank source found", "GH-900 Question Bank source missing", localContentRequired);
  check(existsSync(resolve(contentRoot, "001-foundations/110-mock-exams/010-mock-01/questions.md")), "GH-900 Mock source found", "GH-900 Mock source missing", localContentRequired);
  check(existsSync(resolve(contentRoot, "001-foundations/120-wrong-answers/README.md")), "GH-900 Wrong Answer source found", "GH-900 Wrong Answer source missing", localContentRequired);
}

if (process.env.VERIFY_RUNNING === "1") {
  const baseUrl = process.env.VERIFY_BASE_URL ?? "http://127.0.0.1:3000";
  try {
    const response = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(3000) });
    check(response.ok, "Running app health endpoint", `App health returned HTTP ${response.status}`);
  } catch {
    check(false, "Running app health endpoint", `App is not reachable at ${baseUrl}`);
  }

  if (localContentRequired) {
    try {
      const response = await fetch(`${baseUrl}/api/content/health`, { signal: AbortSignal.timeout(5000) });
      const health = await response.json();
      check(response.ok && health.status === "ok", "Content health endpoint", `Content health failed: ${JSON.stringify(health)}`);
      check(health.moduleCount === 15, "GH-900 15 modules detected", `Expected 15 modules; got ${health.moduleCount}`);
    } catch (error) { check(false, "Content health endpoint", `Content health request failed: ${String(error)}`); }

    try {
      const response = await fetch(`${baseUrl}/api/questions/health`, { signal: AbortSignal.timeout(10000) });
      const health = await response.json();
      check(response.ok && health.status === "ok", "Question Bank health endpoint", `Question Bank health failed: ${JSON.stringify(health)}`);
      check(health.setCount === 10, "GH-900 10 question sets detected", `Expected 10 sets; got ${health.setCount}`);
      check(health.questionCount === 100, "GH-900 Q001-Q100 detected", `Expected 100 questions; got ${health.questionCount}`);
    } catch (error) { check(false, "Question Bank health endpoint", `Question Bank health request failed: ${String(error)}`); }

    try {
      const response = await fetch(`${baseUrl}/api/mocks/health`, { signal: AbortSignal.timeout(10000) });
      const health = await response.json();
      check(response.ok && health.status === "ok", "Mock health endpoint", `Mock health failed: ${JSON.stringify(health)}`);
      check(health.examCount === 3, "GH-900 3 Mock exams detected", `Expected 3 mocks; got ${health.examCount}`);
      check(health.questionCount === 120, "GH-900 120 Mock questions detected", `Expected 120 mock questions; got ${health.questionCount}`);
    } catch (error) { check(false, "Mock health endpoint", `Mock health request failed: ${String(error)}`); }

    try {
      const response = await fetch(`${baseUrl}/wrong-answers`, { signal: AbortSignal.timeout(5000) });
      check(response.ok, "P5 Wrong Answer page", `Wrong Answer page failed with HTTP ${response.status}`);
    } catch (error) { check(false, "P5 Wrong Answer page", `Wrong Answer page request failed: ${String(error)}`); }
  }

  try {
    const response = await fetch(`${baseUrl}/api/ai/health`, { signal: AbortSignal.timeout(5000) });
    const health = await response.json();
    check(response.ok && Boolean(health.provider), "P7 AI provider health", `AI health failed: ${JSON.stringify(health)}`);
  } catch (error) { check(false, "P7 AI provider health", `AI health request failed: ${String(error)}`); }

  if (process.env.VERIFY_RAG === "1") {
    try {
      const response = await fetch(`${baseUrl}/api/rag/health`, { signal: AbortSignal.timeout(5000) });
      const health = await response.json();
      check(response.ok && health.status === "ready", "P8 RAG index ready", `RAG health failed: ${JSON.stringify(health)}`);
      check(health.documentCount >= 10, "P8 GH-900 RAG documents indexed", `Expected >=10 RAG documents; got ${health.documentCount}`);
      check(health.chunkCount >= 10, "P8 GH-900 RAG chunks indexed", `Expected >=10 RAG chunks; got ${health.chunkCount}`);
    } catch (error) { check(false, "P8 RAG health", `RAG health request failed: ${String(error)}`); }
  } else {
    console.log("[SKIP] P8 RAG readiness — use VERIFY_RUNNING=1 VERIFY_RAG=1 npm run verify after indexing");
  }
} else {
  console.log("[SKIP] Runtime health — use VERIFY_RUNNING=1 npm run verify while npm run dev is running");
}

if (failures > 0) process.exit(1);
console.log("Verification complete.");
