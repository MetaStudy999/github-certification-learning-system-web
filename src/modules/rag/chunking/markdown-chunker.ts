import type { RagChunkDraft } from "../core/types";

interface Section {
  heading: string | null;
  body: string;
}

function splitSections(markdown: string): Section[] {
  const sections: Section[] = [];
  let heading: string | null = null;
  let lines: string[] = [];

  const flush = () => {
    const body = lines.join("\n").trim();
    if (body) sections.push({ heading, body });
    lines = [];
  };

  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const match = line.match(/^#{1,4}\s+(.+?)\s*$/);
    if (match) {
      flush();
      heading = match[1]?.trim() || null;
      continue;
    }
    lines.push(line);
  }
  flush();
  return sections;
}

function splitOversizedBlock(block: string, maxChars: number): string[] {
  const pieces: string[] = [];
  let remaining = block.trim();
  while (remaining.length > maxChars) {
    let cut = remaining.lastIndexOf("\n", maxChars);
    if (cut < Math.floor(maxChars * 0.55)) cut = remaining.lastIndexOf(" ", maxChars);
    if (cut < Math.floor(maxChars * 0.55)) cut = maxChars;
    const piece = remaining.slice(0, cut).trim();
    if (piece) pieces.push(piece);
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) pieces.push(remaining);
  return pieces;
}

export function chunkMarkdown(markdown: string, maxChars = 1400): RagChunkDraft[] {
  const chunks: RagChunkDraft[] = [];

  for (const section of splitSections(markdown)) {
    const headingPrefix = section.heading ? `## ${section.heading}\n\n` : "";
    const maxBodyChars = Math.max(300, maxChars - headingPrefix.length);
    const blocks = section.body
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .flatMap((block) => splitOversizedBlock(block, maxBodyChars));

    let current = "";
    const emit = () => {
      const body = current.trim();
      if (!body) return;
      const content = `${headingPrefix}${body}`.trim();
      chunks.push({
        chunkIndex: chunks.length,
        heading: section.heading,
        content,
        contentChars: content.length,
      });
      current = "";
    };

    for (const block of blocks) {
      const candidate = current ? `${current}\n\n${block}` : block;
      if (candidate.length > maxBodyChars && current) emit();
      current = current ? `${current}\n\n${block}` : block;
      if (current.length >= maxBodyChars) emit();
    }
    emit();
  }

  return chunks;
}
