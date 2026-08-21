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

for (const path of ["package.json", "tsconfig.json", "next.config.ts", ".env.example", "src/app/page.tsx"]) {
  check(existsSync(resolve(path)), `${path} exists`, `${path} missing`);
}

check(
  existsSync(resolve("supabase/config.toml")),
  "Supabase config initialized",
  "Supabase config not initialized yet — run npm run supabase:init",
  false,
);

check(
  existsSync(resolve("../github-certification-learning-system")),
  "Sibling GCLS content repository found",
  "Sibling content repository not found — needed from P2 onward",
  false,
);

if (process.env.VERIFY_RUNNING === "1") {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/health", { signal: AbortSignal.timeout(2000) });
    check(response.ok, "Running app health endpoint", `App health returned HTTP ${response.status}`);
  } catch {
    check(false, "Running app health endpoint", "App is not reachable at http://127.0.0.1:3000");
  }
} else {
  console.log("[SKIP] Runtime health — use VERIFY_RUNNING=1 npm run verify while npm run dev is running");
}

if (failures > 0) process.exit(1);
console.log("Verification complete.");
