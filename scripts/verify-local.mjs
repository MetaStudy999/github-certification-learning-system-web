import { existsSync } from "node:fs";
import { resolve } from "node:path";

let failures = 0;
const check = (condition, pass, fail, required = true) => {
  if (condition) console.log(`[PASS] ${pass}`);
  else if (required) { failures += 1; console.error(`[FAIL] ${fail}`); }
  else console.warn(`[WARN] ${fail}`);
};

const major = Number(process.versions.node.split(".")[0]);
check(major >= 22, `Node ${process.version}`, `Node 22+ required; current ${process.version}`);

for (const path of [
  "package.json", "tsconfig.json", "next.config.ts", ".env.example", "src/app/page.tsx",
  "src/modules/content/content-service.ts", "src/app/api/content/health/route.ts",
  "src/modules/question-bank/parser.ts", "src/modules/question-bank/question-bank-service.ts", "src/app/api/questions/health/route.ts",
  "supabase/migrations/20260821231500_p4_question_bank.sql",
  "src/modules/wrong-answers/wrong-answer-service.ts", "src/app/wrong-answers/page.tsx", "supabase/migrations/20260821234500_p5_wrong_answer_engine.sql",
  "src/modules/mock-exams/mock-exam-service.ts", "src/modules/readiness/readiness-service.ts", "supabase/migrations/20260822001500_p6_mock_readiness.sql",
  "src/modules/ai/tutor/tutor-service.ts", "src/components/ai/ai-tutor-panel.tsx", "supabase/migrations/20260822054000_p7_ai_tutor.sql",
  "src/modules/rag/index-service.ts", "src/modules/rag/search-service.ts", "src/modules/rag/tutor-context.ts", "supabase/migrations/20260822065000_p8_rag_grounding.sql",
  "src/modules/github-labs/github-client.ts", "src/modules/github-labs/connection-service.ts", "src/modules/github-labs/verification-service.ts",
  "src/components/github-labs/github-labs-dashboard.tsx", "src/app/labs/001-foundations/page.tsx",
  "src/app/api/github/connection/route.ts", "src/app/api/github/labs/verify/route.ts", "src/app/api/github/labs/attempts/route.ts",
  "supabase/migrations/20260822063000_p9_github_labs.sql",
  "docs/development/190-p9-github-labs.md", "docs/development/200-p9-verification.md",
]) check(existsSync(resolve(path)), `${path} exists`, `${path} missing`);

check(existsSync(resolve("supabase/config.toml")), "Supabase config initialized", "Supabase config not initialized yet — run npm run supabase:init", false);

const contentRoot = resolve(process.cwd(), process.env.GCLS_CONTENT_DIR ?? "../github-certification-learning-system");
const localContentAvailable = existsSync(resolve(contentRoot, "001-foundations"));
const localContentRequired = process.env.GCLS_CONTENT_PROVIDER === "local" || process.env.VERIFY_CONTENT === "1";
check(localContentAvailable, `GCLS content repository found: ${contentRoot}`, `GCLS content repository not found: ${contentRoot}`, localContentRequired);

if (localContentAvailable) {
  check(existsSync(resolve(contentRoot, "001-foundations/020-terms/README.md")), "GH-900 Terms source found", "GH-900 Terms source missing", localContentRequired);
  check(existsSync(resolve(contentRoot, "001-foundations/060-labs/040-github-flow/README.md")), "GH-900 GitHub Flow Lab source found", "GH-900 GitHub Flow Lab source missing", localContentRequired);
  check(existsSync(resolve(contentRoot, "001-foundations/060-labs/080-modern-development/README.md")), "GH-900 Actions Lab source found", "GH-900 Actions Lab source missing", localContentRequired);
  check(existsSync(resolve(contentRoot, "001-foundations/080-question-bank/010-basics/README.md")), "GH-900 Question Bank source found", "GH-900 Question Bank source missing", localContentRequired);
  check(existsSync(resolve(contentRoot, "001-foundations/110-mock-exams/010-mock-01/questions.md")), "GH-900 Mock source found", "GH-900 Mock source missing", localContentRequired);
}

if (process.env.VERIFY_RUNNING === "1") {
  const baseUrl = process.env.VERIFY_BASE_URL ?? "http://127.0.0.1:3000";
  try { const response = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(3000) }); check(response.ok, "Running app health endpoint", `App health returned HTTP ${response.status}`); }
  catch { check(false, "Running app health endpoint", `App is not reachable at ${baseUrl}`); }

  if (localContentRequired) {
    try { const r = await fetch(`${baseUrl}/api/content/health`); const h = await r.json(); check(r.ok && h.moduleCount === 15, "GH-900 15 modules detected", `Content health failed: ${JSON.stringify(h)}`); } catch (e) { check(false, "Content health", String(e)); }
    try { const r = await fetch(`${baseUrl}/api/questions/health`); const h = await r.json(); check(r.ok && h.questionCount === 100, "GH-900 Q001-Q100 detected", `Question health failed: ${JSON.stringify(h)}`); } catch (e) { check(false, "Question health", String(e)); }
    try { const r = await fetch(`${baseUrl}/api/mocks/health`); const h = await r.json(); check(r.ok && h.questionCount === 120, "GH-900 120 Mock questions detected", `Mock health failed: ${JSON.stringify(h)}`); } catch (e) { check(false, "Mock health", String(e)); }
  }

  try { const r = await fetch(`${baseUrl}/api/ai/health`); const h = await r.json(); check(r.ok && Boolean(h.provider), "P7 AI provider health", `AI health failed: ${JSON.stringify(h)}`); } catch (e) { check(false, "P7 AI health", String(e)); }
  try { const r = await fetch(`${baseUrl}/labs/001-foundations`); check(r.ok, "P9 GitHub Labs page", `P9 Labs page HTTP ${r.status}`); } catch (e) { check(false, "P9 Labs page", String(e)); }

  if (process.env.VERIFY_RAG === "1") {
    try { const r = await fetch(`${baseUrl}/api/rag/health`); const h = await r.json(); check(r.ok && h.status === "ready", "P8 RAG index ready", `RAG health failed: ${JSON.stringify(h)}`); } catch (e) { check(false, "P8 RAG health", String(e)); }
  } else console.log("[SKIP] P8 RAG readiness — use VERIFY_RUNNING=1 VERIFY_RAG=1 npm run verify after indexing");
} else console.log("[SKIP] Runtime health — use VERIFY_RUNNING=1 npm run verify while npm run dev is running");

if (failures > 0) process.exit(1);
console.log("Verification complete.");
