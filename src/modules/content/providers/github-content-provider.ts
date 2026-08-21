import { ContentNotFoundError } from "../core/provider";
import type { ContentDocument, ContentEntry, ContentProvider } from "../core/types";

interface GitHubContentItem {
  name: string;
  path: string;
  type: "file" | "dir";
}

function encodeRepositoryPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export class GitHubContentProvider implements ContentProvider {
  readonly id = "github";

  constructor(
    private readonly repository: string,
    private readonly ref: string,
    private readonly token?: string,
  ) {}

  private headers() {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    return headers;
  }

  async list(path: string): Promise<ContentEntry[]> {
    const url = `https://api.github.com/repos/${this.repository}/contents/${encodeRepositoryPath(path)}?ref=${encodeURIComponent(this.ref)}`;
    const response = await fetch(url, { headers: this.headers(), cache: "no-store" });

    if (!response.ok) {
      throw new ContentNotFoundError(`GitHub content list failed: ${response.status} ${path}`);
    }

    const data = (await response.json()) as GitHubContentItem[];
    if (!Array.isArray(data)) {
      throw new ContentNotFoundError(`GitHub path is not a directory: ${path}`);
    }

    return data.map((entry) => ({
      name: entry.name,
      path: entry.path,
      type: entry.type === "dir" ? "directory" : "file",
    }));
  }

  async readText(path: string): Promise<ContentDocument> {
    const url = `https://raw.githubusercontent.com/${this.repository}/${encodeURIComponent(this.ref)}/${encodeRepositoryPath(path)}`;
    const response = await fetch(url, { headers: this.token ? { Authorization: `Bearer ${this.token}` } : undefined, cache: "no-store" });

    if (!response.ok) {
      throw new ContentNotFoundError(`GitHub content read failed: ${response.status} ${path}`);
    }

    return {
      path,
      content: await response.text(),
      provider: this.id,
      sourceUrl: `https://github.com/${this.repository}/blob/${encodeURIComponent(this.ref)}/${encodeRepositoryPath(path)}`,
    };
  }
}
