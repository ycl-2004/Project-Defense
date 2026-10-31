/**
 * Every product limit lives here, so the API, the UI and the tests share one source.
 */
export const LIMITS = {
  minQuestions: 5,
  maxQuestions: 8,
  defaultQuestions: 6,
  maxFollowUps: 2,
  maxAnswerChars: 2000,
  maxCustomPartChars: 300,
  minParts: 3,
  maxParts: 6,
  /** Files read for one Part. */
  maxPartFiles: 40,
  maxPartBytes: 300_000,
  /** Files bigger than this are never read (generated code, data dumps). */
  maxFileBytes: 100_000,
  maxReadmeChars: 20_000,
  maxTreeEntriesInPrompt: 1500,
  maxSnippetLines: 40,
} as const;

export const DEEPSEEK = {
  baseURL: "https://api.deepseek.com",
  defaultModel: "deepseek-flash",
} as const;
