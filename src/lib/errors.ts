/**
 * Errors the user can act on. The code travels to the browser, which shows a translated message;
 * the detail stays in server logs.
 */
export const ERROR_CODES = [
  "invalid_url",
  "repo_not_found",
  "rate_limited",
  "empty_repo",
  "bad_request",
  "access_denied",
  "llm_failed",
  "upstream",
  "not_configured",
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

const HTTP_STATUS: Record<ErrorCode, number> = {
  invalid_url: 400,
  repo_not_found: 404,
  rate_limited: 429,
  empty_repo: 422,
  bad_request: 400,
  access_denied: 401,
  llm_failed: 502,
  upstream: 502,
  not_configured: 500,
};

export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    detail?: string,
  ) {
    super(detail ?? code);
    this.name = "AppError";
  }

  get status(): number {
    return HTTP_STATUS[this.code];
  }
}

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === "string" && (ERROR_CODES as readonly string[]).includes(value);
}
