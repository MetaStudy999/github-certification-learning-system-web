import type { ContentProvider } from "./types";

export class ContentNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentNotFoundError";
  }
}

export class ContentConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentConfigurationError";
  }
}

export type { ContentProvider };
