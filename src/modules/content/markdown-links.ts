import { posix } from "node:path";

const DEFAULT_REPOSITORY = "MetaStudy999/github-certification-learning-system";
const DEFAULT_REF = "main";

export function resolveMarkdownHref(href: string | undefined, sourcePath: string) {
  if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:)/i.test(href)) return href;

  const [pathPart, fragment] = href.split("#", 2);
  const repository = process.env.GCLS_CONTENT_REPOSITORY ?? DEFAULT_REPOSITORY;
  const ref = process.env.GCLS_CONTENT_REF ?? DEFAULT_REF;
  const resolved = pathPart.startsWith("/")
    ? posix.normalize(pathPart.slice(1))
    : posix.normalize(posix.join(posix.dirname(sourcePath), pathPart));
  const mode = pathPart.endsWith("/") || !posix.extname(pathPart) ? "tree" : "blob";
  const encoded = resolved.split("/").map(encodeURIComponent).join("/");
  const suffix = fragment ? `#${encodeURIComponent(fragment)}` : "";
  return `https://github.com/${repository}/${mode}/${encodeURIComponent(ref)}/${encoded}${suffix}`;
}
