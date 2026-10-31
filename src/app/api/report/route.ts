import { reportRequestSchema } from "@/lib/api/contracts";
import { getDeps } from "@/lib/server/deps";
import { handleJson } from "@/lib/server/http";
import { buildReport } from "@/lib/server/services";

export const maxDuration = 180;

export function POST(request: Request) {
  return handleJson(request, reportRequestSchema, (body) => buildReport(getDeps(), body));
}
