import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { ContentConfigurationError } from "./core/provider";
import type { ContentProvider } from "./core/types";
import { FileSystemContentProvider } from "./providers/filesystem-content-provider";
import { GitHubContentProvider } from "./providers/github-content-provider";

const DEFAULT_REPOSITORY = "MetaStudy999/github-certification-learning-system";
const DEFAULT_REF = "main";
const DEFAULT_LOCAL_DIR = "../github-certification-learning-system";

export type ContentProviderMode = "auto" | "local" | "github";

export function createContentProvider(): ContentProvider {
  const mode = (process.env.GCLS_CONTENT_PROVIDER ?? "auto") as ContentProviderMode;
  const repository = process.env.GCLS_CONTENT_REPOSITORY ?? DEFAULT_REPOSITORY;
  const ref = process.env.GCLS_CONTENT_REF ?? DEFAULT_REF;
  const root = resolve(process.cwd(), process.env.GCLS_CONTENT_DIR ?? DEFAULT_LOCAL_DIR);
  const localAvailable = existsSync(resolve(root, "001-foundations"));

  if (mode === "local") {
    if (!localAvailable) {
      throw new ContentConfigurationError(`GCLS local content repository not found: ${root}`);
    }
    return new FileSystemContentProvider(root, repository, ref);
  }

  if (mode === "github") {
    return new GitHubContentProvider(repository, ref, process.env.GCLS_CONTENT_GITHUB_TOKEN);
  }

  if (mode === "auto") {
    return localAvailable
      ? new FileSystemContentProvider(root, repository, ref)
      : new GitHubContentProvider(repository, ref, process.env.GCLS_CONTENT_GITHUB_TOKEN);
  }

  throw new ContentConfigurationError(`Unsupported GCLS_CONTENT_PROVIDER: ${mode}`);
}
