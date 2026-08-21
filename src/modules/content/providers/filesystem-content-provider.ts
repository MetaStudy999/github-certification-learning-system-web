import { readdir, readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import { ContentNotFoundError } from "../core/provider";
import type { ContentDocument, ContentEntry, ContentProvider } from "../core/types";

function encodeRepositoryPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export class FileSystemContentProvider implements ContentProvider {
  readonly id = "local";

  constructor(
    private readonly root: string,
    private readonly repository: string,
    private readonly ref: string,
  ) {}

  private safePath(path: string) {
    const target = resolve(this.root, path);
    const rel = relative(this.root, target);

    if (rel.startsWith("..") || isAbsolute(rel)) {
      throw new ContentNotFoundError(`Unsafe content path: ${path}`);
    }

    return target;
  }

  async list(path: string): Promise<ContentEntry[]> {
    try {
      const entries = await readdir(this.safePath(path), { withFileTypes: true });
      return entries.map((entry) => ({
        name: entry.name,
        path: [path, entry.name].filter(Boolean).join("/"),
        type: entry.isDirectory() ? "directory" : "file",
      }));
    } catch (error) {
      throw new ContentNotFoundError(`Cannot list local content path ${path}: ${String(error)}`);
    }
  }

  async readText(path: string): Promise<ContentDocument> {
    try {
      const content = await readFile(this.safePath(path), "utf8");
      return {
        path,
        content,
        provider: this.id,
        sourceUrl: `https://github.com/${this.repository}/blob/${encodeURIComponent(this.ref)}/${encodeRepositoryPath(path)}`,
      };
    } catch (error) {
      throw new ContentNotFoundError(`Cannot read local content file ${path}: ${String(error)}`);
    }
  }
}
