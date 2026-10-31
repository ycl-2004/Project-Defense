"use client";

import {
  ACCESS_CODE_HEADER,
  type AnalyzeRequest,
  type QuestionRequest,
  type ReportRequest,
  type StartRequest,
} from "@/lib/api/contracts";
import type { Report } from "@/lib/domain";
import { isErrorCode, type ErrorCode } from "@/lib/errors";
import type { TurnDecision } from "@/lib/interview/machine";
import type { AnalyzeResult, StartResult } from "@/lib/server/services";
import { useSession } from "./session-store";

export type ClientErrorCode = ErrorCode | "network";

export class ApiError extends Error {
  constructor(readonly code: ClientErrorCode) {
    super(code);
    this.name = "ApiError";
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const { accessCode, setAccessPrompt } = useSession.getState();
  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json", ...(accessCode ? { [ACCESS_CODE_HEADER]: accessCode } : {}) },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("network");
  }
  const data: unknown = await response.json().catch(() => undefined);
  if (response.ok) return data as T;

  const code = data && typeof data === "object" && "error" in data && isErrorCode(data.error) ? data.error : "upstream";
  if (code === "access_denied") setAccessPrompt(true);
  throw new ApiError(code);
}

export const api = {
  analyze: (body: AnalyzeRequest) => post<AnalyzeResult>("/api/analyze", body),
  start: (body: StartRequest) => post<StartResult>("/api/interview/start", body),
  turn: (body: QuestionRequest) => post<TurnDecision>("/api/interview/turn", body),
  hint: (body: QuestionRequest) => post<{ hint: string }>("/api/interview/hint", body),
  report: (body: ReportRequest) => post<Report>("/api/report", body),
};

export function errorCodeOf(error: unknown): ClientErrorCode {
  return error instanceof ApiError ? error.code : "upstream";
}
