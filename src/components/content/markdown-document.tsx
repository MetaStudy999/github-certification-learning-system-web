import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { resolveMarkdownHref } from "@/modules/content/markdown-links";

interface MarkdownDocumentProps {
  markdown: string;
  sourcePath: string;
}

export function MarkdownDocument({ markdown, sourcePath }: MarkdownDocumentProps) {
  return (
    <article className="markdownDocument">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            const resolved = resolveMarkdownHref(href, sourcePath);
            const external = Boolean(resolved?.startsWith("http"));
            return (
              <a href={resolved} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
