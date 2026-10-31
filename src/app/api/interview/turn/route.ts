import { questionRequestSchema } from "@/lib/api/contracts";
import { getDeps } from "@/lib/server/deps";
import { handleJson } from "@/lib/server/http";
import { nextTurn } from "@/lib/server/services";

export const maxDuration = 60;

export function POST(request: Request) {
  return handleJson(request, questionRequestSchema, (body) => nextTurn(getDeps(), body));
}
