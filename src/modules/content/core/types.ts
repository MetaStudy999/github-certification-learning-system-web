export type ContentEntryType = "file" | "directory";

export interface ContentEntry {
  name: string;
  path: string;
  type: ContentEntryType;
}

export interface ContentDocument {
  path: string;
  content: string;
  provider: string;
  sourceUrl: string;
}

export interface ContentProvider {
  readonly id: string;
  list(path: string): Promise<ContentEntry[]>;
  readText(path: string): Promise<ContentDocument>;
}

export interface CourseDefinition {
  slug: string;
  code: string;
  title: string;
  exam: string;
  level: string;
}

export interface CourseModule {
  slug: string;
  code: string;
  label: string;
  path: string;
}

export interface CourseModuleDocument extends CourseModule {
  title: string;
  markdown: string;
  provider: string;
  sourceUrl: string;
  sourcePath: string;
}
