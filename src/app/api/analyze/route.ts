import { analyzeRequestSchema } from "@/lib/api/contracts";
import { getDeps } from "@/lib/server/deps";
import { handleJson } from "@/lib/server/http";
import { analyzeRepo } from "@/lib/server/services";

export const maxDuration = 120;

export function POST(request: Request) {
  return handleJson(request, analyzeRequestSchema, (body) => analyzeRepo(getDeps(), body));
}
