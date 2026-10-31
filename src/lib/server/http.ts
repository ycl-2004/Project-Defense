import { timingSafeEqual } from "node:crypto";
import type { z } from "zod";
import { ACCESS_CODE_HEADER } from "@/lib/api/contracts";
import { AppError } from "@/lib/errors";

function accessAllowed(request: Request): boolean {
  const expected = process.env.ACCESS_CODE;
  if (!expected) return true;
  const given = Buffer.from(request.headers.get(ACCESS_CODE_HEADER) ?? "");
  const wanted = Buffer.from(expected);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

/**
 * Shared shell for every POST route: optional access code, body validation, error mapping.
 * The browser only ever sees an error code; details go to the server log.
 */
export async function handleJson<S extends z.ZodType>(
  request: Request,
  schema: S,
  run: (body: z.infer<S>) => Promise<unknown>,
): Promise<Response> {
  try {
    if (!accessAllowed(request)) throw new AppError("access_denied");
    const parsed = schema.safeParse(await request.json().catch(() => undefined));
    if (!parsed.success) throw new AppError("bad_request", parsed.error.message);
    return Response.json(await run(parsed.data));
  } catch (error) {
    const appError = error instanceof AppError ? error : new AppError("upstream", String(error));
    if (appError.code !== "access_denied") console.error(`[api] ${appError.code}: ${appError.message}`);
    return Response.json({ error: appError.code }, { status: appError.status });
  }
}
