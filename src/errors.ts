export class ToolhutchError extends Error {
  constructor(message: string, readonly code = "TOOLHUTCH_ERROR") {
    super(message);
    this.name = "ToolhutchError";
  }
}

export function asErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
