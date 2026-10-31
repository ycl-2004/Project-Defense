import OpenAI from "openai";
import { z } from "zod";
import { DEEPSEEK } from "@/lib/config";
import { AppError } from "@/lib/errors";

export type JsonRequest<T> = {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  /** DeepSeek thinking mode: slower, better for one-off analysis and reports. */
  thinking: boolean;
  maxTokens?: number;
  /** Domain check on parsed output. Return a problem description to ask the model to try again. */
  validate?: (data: T) => string | null;
};

/** Contract every model client meets; the app and the tests depend on this, not on DeepSeek. */
export interface JsonLLM {
  completeJson<T>(request: JsonRequest<T>): Promise<T>;
}

const MAX_ATTEMPTS = 3;

export class DeepSeekLLM implements JsonLLM {
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model: string = DEEPSEEK.defaultModel,
    client?: OpenAI,
  ) {
    this.client = client ?? new OpenAI({ apiKey, baseURL: DEEPSEEK.baseURL, timeout: 120_000, maxRetries: 2 });
  }

  async completeJson<T>(request: JsonRequest<T>): Promise<T> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: request.system },
      { role: "user", content: request.user },
    ];
    let problem = "";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const content = await this.call(messages, request);
      const outcome = checkReply(content, request);
      if (outcome.ok) return outcome.data;

      problem = outcome.problem;
      // The model sees its own reply and what was wrong with it, then answers again.
      messages.push(
        { role: "assistant", content: content || "(empty)" },
        { role: "user", content: `That reply cannot be used: ${problem}\nReply again with only the corrected json object.` },
      );
    }
    throw new AppError("llm_failed", problem);
  }

  private async call(messages: OpenAI.Chat.ChatCompletionMessageParam[], request: Pick<JsonRequest<unknown>, "thinking" | "maxTokens">): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        response_format: { type: "json_object" },
        max_tokens: request.maxTokens ?? (request.thinking ? 24_000 : 4_000),
        // @ts-expect-error DeepSeek-specific switch, sent as-is in the request body.
        thinking: { type: request.thinking ? "enabled" : "disabled" },
        ...(request.thinking ? { reasoning_effort: "low" as const } : {}),
      });
      return completion.choices[0]?.message?.content?.trim() ?? "";
    } catch (error) {
      throw new AppError("llm_failed", `deepseek request failed: ${String(error)}`);
    }
  }
}

type ReplyCheck<T> = { ok: true; data: T } | { ok: false; problem: string };

/** Parses, schema-checks and domain-checks one reply. Exported for tests. */
export function checkReply<T>(content: string, request: Pick<JsonRequest<T>, "schema" | "validate">): ReplyCheck<T> {
  if (!content) return { ok: false, problem: "the reply was empty" };
  const json = extractJsonObject(content);
  if (json === undefined) return { ok: false, problem: "the reply was not a json object" };
  const parsed = request.schema.safeParse(json);
  if (!parsed.success) return { ok: false, problem: `it does not match the required format: ${z.prettifyError(parsed.error)}` };
  const domainProblem = request.validate?.(parsed.data);
  if (domainProblem) return { ok: false, problem: domainProblem };
  return { ok: true, data: parsed.data };
}

/** JSON mode should return bare JSON, but tolerate code fences or stray text around it. */
export function extractJsonObject(text: string): unknown {
  const unfenced = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  for (const candidate of [unfenced, unfenced.slice(unfenced.indexOf("{"), unfenced.lastIndexOf("}") + 1)]) {
    if (!candidate) continue;
    try {
      const value: unknown = JSON.parse(candidate);
      if (value && typeof value === "object" && !Array.isArray(value)) return value;
    } catch {
      // try the next candidate
    }
  }
  return undefined;
}
