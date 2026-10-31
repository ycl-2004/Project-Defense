import { z } from "zod";

/**
 * Contract layer: the shapes every other layer agrees on.
 * Both the API routes and the browser import these, so a field is defined once.
 */

export const LOCALES = ["zh", "en"] as const;
export const localeSchema = z.enum(LOCALES);
export type Locale = z.infer<typeof localeSchema>;

export const DIFFICULTIES = ["easy", "hard", "tricky"] as const;
export const difficultySchema = z.enum(DIFFICULTIES);
export type Difficulty = z.infer<typeof difficultySchema>;

/** The five layers of understanding, in the order an interview climbs them. */
export const LAYERS = ["explain", "code", "decision", "failure", "apply"] as const;
export const layerSchema = z.enum(LAYERS);
export type Layer = z.infer<typeof layerSchema>;

export const RATINGS = ["clear", "partial", "misconception", "unanswered"] as const;
export const ratingSchema = z.enum(RATINGS);
export type Rating = z.infer<typeof ratingSchema>;

export const repoRefSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  /** Branch, tag or commit the user pointed at. */
  ref: z.string(),
  /** Commit SHA the whole interview is pinned to, so the code can't change mid-session. */
  sha: z.string(),
  /** Optional sub-directory the user limited the repo to ("" = whole repo). */
  subdir: z.string(),
});
export type RepoRef = z.infer<typeof repoRefSchema>;

export const fileInfoSchema = z.object({
  path: z.string(),
  size: z.number().int().nonnegative(),
});
export type FileInfo = z.infer<typeof fileInfoSchema>;

export const partSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  files: z.array(z.string()),
});
export type Part = z.infer<typeof partSchema>;

export const projectOverviewSchema = z.object({
  name: z.string(),
  oneLiner: z.string(),
  stack: z.array(z.string()),
  summary: z.string(),
});
export type ProjectOverview = z.infer<typeof projectOverviewSchema>;

export const citationSchema = z.object({
  path: z.string(),
  startLine: z.number().int().positive(),
  endLine: z.number().int().positive(),
});
export type Citation = z.infer<typeof citationSchema>;

/** A citation plus the code cut from the real file on the server. */
export const snippetSchema = citationSchema.extend({
  code: z.string(),
});
export type Snippet = z.infer<typeof snippetSchema>;

export const plannedQuestionSchema = z.object({
  id: z.string(),
  layer: layerSchema,
  difficulty: difficultySchema,
  question: z.string(),
  /** What understanding the question probes; shown in the report, not during the interview. */
  focus: z.string(),
  snippet: snippetSchema,
  /** The mentor's short margin note, pinned to one line inside the snippet. */
  note: z.object({ line: z.number().int().positive(), text: z.string().max(60) }).optional(),
});
export type PlannedQuestion = z.infer<typeof plannedQuestionSchema>;

export const exchangeSchema = z.object({
  kind: z.enum(["main", "followup"]),
  prompt: z.string(),
  difficulty: difficultySchema,
  snippet: snippetSchema.optional(),
  answer: z.string().optional(),
  skipped: z.boolean().optional(),
});
export type Exchange = z.infer<typeof exchangeSchema>;

export const threadSchema = z.object({
  questionId: z.string(),
  exchanges: z.array(exchangeSchema),
  hints: z.array(z.string()),
});
export type Thread = z.infer<typeof threadSchema>;

export const reportQuestionSchema = z.object({
  id: z.string(),
  rating: ratingSchema,
  evidence: z.string(),
  comment: z.string(),
});
export type ReportQuestion = z.infer<typeof reportQuestionSchema>;

export const reportSchema = z.object({
  summary: z.string(),
  questions: z.array(reportQuestionSchema),
  strengths: z.array(z.string()),
  misconceptions: z.array(z.string()),
  studyNext: z.array(
    z.object({ topic: z.string(), why: z.string(), files: z.array(z.string()) }),
  ),
  mentorNextStep: z.object({ task: z.string(), why: z.string() }),
});
export type Report = z.infer<typeof reportSchema>;
