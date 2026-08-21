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
  }
} else {
  console.log("[SKIP] Runtime health — use VERIFY_RUNNING=1 npm run verify while npm run dev is running");
}

if (failures > 0) process.exit(1);
console.log("Verification complete.");
