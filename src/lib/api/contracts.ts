import { z } from "zod";
import { LIMITS } from "@/lib/config";
import {
  difficultySchema,
  exchangeSchema,
  localeSchema,
  plannedQuestionSchema,
  repoRefSchema,
  threadSchema,
} from "@/lib/domain";

/**
 * Request bodies for every API route. The routes validate with these and the browser builds
 * requests from the same types, so a field cannot drift between the two sides.
 * Sizes are capped here because the server is stateless and must not trust what it is sent.
 */

const partRefSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().max(600),
  files: z.array(z.string().min(1).max(500)).min(1).max(LIMITS.maxPartFiles),
});

const boundedThreadSchema = threadSchema.extend({
  exchanges: z
    .array(
      exchangeSchema.extend({
        prompt: z.string().max(2000),
        answer: z.string().max(LIMITS.maxAnswerChars).optional(),
      }),
    )
    .min(1)
    .max(1 + LIMITS.maxFollowUps),
  hints: z.array(z.string().max(1000)).max(10),
});

export const analyzeRequestSchema = z.object({
  url: z.string().min(1).max(500),
  locale: localeSchema,
});
export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const startRequestSchema = z.object({
  repo: repoRefSchema,
  part: z.union([partRefSchema, z.object({ description: z.string().min(1).max(LIMITS.maxCustomPartChars) })]),
  difficulty: difficultySchema,
  count: z.number().int().min(LIMITS.minQuestions).max(LIMITS.maxQuestions),
  locale: localeSchema,
});
export type StartRequest = z.infer<typeof startRequestSchema>;

export const questionRequestSchema = z.object({
  repo: repoRefSchema,
  part: partRefSchema,
  locale: localeSchema,
  question: plannedQuestionSchema,
  thread: boundedThreadSchema,
});
export type QuestionRequest = z.infer<typeof questionRequestSchema>;

export const reportRequestSchema = z.object({
  repo: repoRefSchema,
  part: partRefSchema,
  locale: localeSchema,
  plan: z.array(plannedQuestionSchema).min(1).max(LIMITS.maxQuestions),
  threads: z.array(boundedThreadSchema).max(LIMITS.maxQuestions),
});
export type ReportRequest = z.infer<typeof reportRequestSchema>;

export const ACCESS_CODE_HEADER = "x-access-code";
