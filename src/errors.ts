export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

export function pgErrorCode(err: unknown): string | undefined {
  return (err as { code?: string }).code;
}
