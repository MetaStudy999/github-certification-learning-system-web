import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const major = Number(process.versions.node.split(".")[0]);
if (major < 22) {
  console.error(`Node.js 22+ is required. Current: ${process.version}`);
  process.exit(1);
}

const root = process.cwd();
const envTarget = resolve(root, ".env.local");
if (!existsSync(envTarget)) {
  copyFileSync(resolve(root, ".env.example"), envTarget);
  console.log("[created] .env.local from .env.example");
} else {
  console.log("[exists] .env.local");
}

const contentDir = resolve(root, "../github-certification-learning-system");
console.log(existsSync(contentDir)
  ? "[ok] sibling GCLS content repository found"
  : "[next] clone MetaStudy999/github-certification-learning-system beside this repository");

console.log(existsSync(resolve(root, "supabase/config.toml"))
  ? "[ok] Supabase local config found"
  : "[next] run: npm run supabase:init");

console.log("[next] npm run supabase:start");
console.log("[next] fill Supabase values in .env.local from local status output");
console.log("[next] npm run dev");
console.log("[next] npm run verify");
