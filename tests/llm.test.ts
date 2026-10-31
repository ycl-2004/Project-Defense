import type OpenAI from "openai";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { checkReply, DeepSeekLLM, extractJsonObject } from "@/lib/llm/client";

const schema = z.object({ answer: z.number() });

describe("extractJsonObject", () => {
  it.each([
    ['{"answer": 1}', { answer: 1 }],
    ['```json\n{"answer": 2}\n```', { answer: 2 }],
    ['Sure! {"answer": 3} hope that helps', { answer: 3 }],
  ])("reads %j", (text, expected) => {
    expect(extractJsonObject(text)).toEqual(expected);
  });

  it.each(["", "   ", "[1,2]", "not json"])("returns undefined for %j", (text) => {
    expect(extractJsonObject(text)).toBeUndefined();
  });
});

describe("checkReply", () => {
  it("reports empty, malformed, off-schema and domain problems", () => {
    expect(checkReply("", { schema })).toMatchObject({ ok: false, problem: "the reply was empty" });
    expect(checkReply("nope", { schema })).toMatchObject({ ok: false });
    expect(checkReply('{"answer": "x"}', { schema })).toMatchObject({ ok: false });
    const validate = (data: { answer: number }) => (data.answer > 10 ? "too big" : null);
    expect(checkReply('{"answer": 11}', { schema, validate })).toEqual({ ok: false, problem: "too big" });
    expect(checkReply('{"answer": 4}', { schema, validate })).toEqual({ ok: true, data: { answer: 4 } });
  });
});

function fakeOpenAI(replies: string[]) {
  const calls: Record<string, unknown>[] = [];
  const client = {
    chat: {
      completions: {
        create: async (body: Record<string, unknown>) => {
          calls.push(structuredClone(body));
          return { choices: [{ message: { content: replies.shift() ?? "" } }] };
        },
      },
    },
  } as unknown as OpenAI;
  return { client, calls };
}

describe("DeepSeekLLM", () => {
  it("sends json mode and the thinking switch", async () => {
    const { client, calls } = fakeOpenAI(['{"answer": 1}']);
    await new DeepSeekLLM("key", "deepseek-flash", client).completeJson({ system: "s", user: "u json", schema, thinking: false });
    expect(calls[0]).toMatchObject({
      model: "deepseek-flash",
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
    });
    expect(calls[0]).not.toHaveProperty("reasoning_effort");
  });

  it("retries with the problem described, then succeeds", async () => {
    const { client, calls } = fakeOpenAI(["", '{"answer": 99}', '{"answer": 5}']);
    const result = await new DeepSeekLLM("key", "m", client).completeJson({
      system: "s",
      user: "u",
      schema,
      thinking: true,
      validate: (data) => (data.answer > 10 ? "answer must be at most 10" : null),
    });
    expect(result).toEqual({ answer: 5 });
    expect(calls).toHaveLength(3);
    const lastMessages = calls[2].messages as { role: string; content: string }[];
    expect(lastMessages.at(-1)?.content).toContain("answer must be at most 10");
  });

  it("gives up after three bad replies", async () => {
    const { client } = fakeOpenAI(["x", "y", "z"]);
    await expect(
      new DeepSeekLLM("key", "m", client).completeJson({ system: "s", user: "u", schema, thinking: false }),
    ).rejects.toMatchObject({ code: "llm_failed" });
  });
});
