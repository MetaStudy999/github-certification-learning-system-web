export class RagIndexNotReadyError extends Error {
  constructor(message = "RAG index is not ready") {
    super(message);
    this.name = "RagIndexNotReadyError";
  }
}

export class RagIndexProfileMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RagIndexProfileMismatchError";
  }
}

export class RagIndexStaleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RagIndexStaleError";
  }
}

export class RagGroundingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RagGroundingError";
  }
}
