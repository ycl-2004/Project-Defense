import { questionRequestSchema } from "@/lib/api/contracts";
import { getDeps } from "@/lib/server/deps";
import { handleJson } from "@/lib/server/http";
import { giveHint } from "@/lib/server/services";

export const maxDuration = 60;

export function POST(request: Request) {
  return handleJson(request, questionRequestSchema, (body) => giveHint(getDeps(), body));
}
