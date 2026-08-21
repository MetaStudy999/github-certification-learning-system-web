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
]) {
  check(existsSync(resolve(path)), `${path} exists`, `${path} missing`);
}

check(
  existsSync(resolve("supabase/config.toml")),
  "Supabase config initialized",
  "Supabase config not initialized yet — run npm run supabase:init",
  false,
);

const contentRoot = resolve(process.cwd(), process.env.GCLS_CONTENT_DIR ?? "../github-certification-learning-system");
const localContentAvailable = existsSync(resolve(contentRoot, "001-foundations"));
const localContentRequired = process.env.GCLS_CONTENT_PROVIDER === "local" || process.env.VERIFY_CONTENT === "1";
check(
  localContentAvailable,
  `GCLS content repository found: ${contentRoot}`,
  `GCLS content repository not found: ${contentRoot}`,
  localContentRequired,
);

if (localContentAvailable) {
  check(
    existsSync(resolve(contentRoot, "001-foundations/080-question-bank/010-basics/README.md")),
    "GH-900 Question Bank source found",
    "GH-900 Question Bank source missing",
    localContentRequired,
  );
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
    } catch (error) {
      check(false, "Content health endpoint", `Content health request failed: ${String(error)}`);
    }

    try {
      const response = await fetch(`${baseUrl}/api/questions/health`, { signal: AbortSignal.timeout(10000) });
      const health = await response.json();
      check(response.ok && health.status === "ok", "Question Bank health endpoint", `Question Bank health failed: ${JSON.stringify(health)}`);
      check(health.setCount === 10, "GH-900 10 question sets detected", `Expected 10 sets; got ${health.setCount}`);
      check(health.questionCount === 100, "GH-900 Q001-Q100 detected", `Expected 100 questions; got ${health.questionCount}`);
    } catch (error) {
      check(false, "Question Bank health endpoint", `Question Bank health request failed: ${String(error)}`);
    }
  }
} else {
  console.log("[SKIP] Runtime health — use VERIFY_RUNNING=1 npm run verify while npm run dev is running");
}

if (failures > 0) process.exit(1);
console.log("Verification complete.");
