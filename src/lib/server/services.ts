import { LIMITS } from "@/lib/config";
import type {
  Difficulty,
  FileInfo,
  Locale,
  Part,
  PlannedQuestion,
  ProjectOverview,
  RepoRef,
  Report,
  Thread,
} from "@/lib/domain";
import { AppError } from "@/lib/errors";
import type { GitHubClient } from "@/lib/github/client";
import { findReadme, isReadableSource, selectWithinBudget, withinSubdir } from "@/lib/github/filter";
import { parseRepoUrl } from "@/lib/github/url";
import { resolveCitation } from "@/lib/interview/citations";
import { followUpDifficulty, layerPlan } from "@/lib/interview/layers";
import { canFollowUp, followUpsUsed, type TurnDecision } from "@/lib/interview/machine";
import {
  analysisOutputSchema,
  analysisPrompt,
  codeBundle,
  fileSelectionOutputSchema,
  fileSelectionPrompt,
  hintOutputSchema,
  hintPrompt,
  planOutputSchema,
  planPrompt,
  reportOutputSchema,
  reportPrompt,
  SYSTEM_PROMPT,
  turnOutputSchema,
  turnPrompt,
} from "@/lib/interview/prompts";
import type { JsonLLM } from "@/lib/llm/client";

/**
 * Application services: one function per API route. They take their dependencies as arguments,
 * so tests run them with a fake repository reader and a fake model.
 */
export type RepoReader = Pick<GitHubClient, "resolve" | "tree" | "files">;
export type Deps = { github: RepoReader; llm: JsonLLM };

type PartRef = Pick<Part, "title" | "summary" | "files">;

async function readableFiles(github: RepoReader, repo: RepoRef): Promise<{ all: FileInfo[]; readable: FileInfo[] }> {
  const all = await github.tree(repo);
  const readable = withinSubdir(all, repo.subdir).filter(isReadableSource);
  if (readable.length === 0) throw new AppError("empty_repo", "no readable source files");
  return { all, readable };
}

/** Fetches the Part's files and enforces the byte budget on their real content, not on what the client claims. */
async function loadPartFiles(github: RepoReader, repo: RepoRef, paths: string[]): Promise<Map<string, string>> {
  const fetched = await github.files(repo, paths.slice(0, LIMITS.maxPartFiles));
  const kept = new Map<string, string>();
  let bytes = 0;
  for (const [path, content] of fetched) {
    const size = new TextEncoder().encode(content).length;
    if (size > LIMITS.maxFileBytes || bytes + size > LIMITS.maxPartBytes) continue;
    kept.set(path, content);
    bytes += size;
  }
  if (kept.size === 0) throw new AppError("empty_repo", "part has no readable files");
  return kept;
}

function knownFiles(paths: string[], readable: FileInfo[]): string[] {
  const sizes = new Map(readable.map((file) => [file.path, file.size]));
  return selectWithinBudget(paths, sizes);
}

// ---------- analyse ----------

export type AnalyzeResult = { repo: RepoRef; overview: ProjectOverview; parts: Part[]; fileCount: number };

export async function analyzeRepo(deps: Deps, input: { url: string; locale: Locale }): Promise<AnalyzeResult> {
  const repo = await deps.github.resolve(parseRepoUrl(input.url));
  const { all, readable } = await readableFiles(deps.github, repo);
  const readmeInfo = findReadme(all, repo.subdir);
  const readme = readmeInfo
    ? { path: readmeInfo.path, content: (await deps.github.files(repo, [readmeInfo.path])).get(readmeInfo.path) ?? "" }
    : undefined;

  const output = await deps.llm.completeJson({
    system: SYSTEM_PROMPT,
    user: analysisPrompt({ repo, files: readable, readme, locale: input.locale }),
    schema: analysisOutputSchema,
    thinking: true,
    validate: (data) =>
      data.parts.some((part) => knownFiles(part.files, readable).length > 0)
        ? null
        : "none of the listed files exist in the source file list; use exact paths from the list",
  });

  const parts = output.parts
    .map((part) => ({ ...part, files: knownFiles(part.files, readable) }))
    .filter((part) => part.files.length > 0)
    .map((part, index) => ({ id: `p${index + 1}`, ...part }));

  return { repo, overview: output.project, parts, fileCount: readable.length };
}

// ---------- start: choose files (custom Part) and plan the questions ----------

export type StartInput = {
  repo: RepoRef;
  part: PartRef | { description: string };
  difficulty: Difficulty;
  count: number;
  locale: Locale;
};
export type StartResult = { part: Part; plan: PlannedQuestion[] };

export async function startInterview(deps: Deps, input: StartInput): Promise<StartResult> {
  const { readable } = await readableFiles(deps.github, input.repo);
  const part = await resolvePart(deps, input, readable);
  const files = await loadPartFiles(deps.github, input.repo, part.files);
  const layers = layerPlan(input.count);

  const output = await deps.llm.completeJson({
    system: SYSTEM_PROMPT,
    user: planPrompt({ bundle: codeBundle(input.repo, files), part, difficulty: input.difficulty, layers, locale: input.locale }),
    schema: planOutputSchema,
    thinking: true,
    validate: (data) => {
      if (data.questions.length !== layers.length) {
        return `write exactly ${layers.length} questions, one per slot (got ${data.questions.length})`;
      }
      const problems = data.questions.flatMap((question, index) => {
        const check = resolveCitation(question.citation, files);
        return check.ok ? [] : [`question ${index + 1}: ${check.reason}`];
      });
      return problems.length ? `fix these citations: ${problems.join("; ")}` : null;
    },
  });

  const plan = output.questions.map((question, index): PlannedQuestion => {
    const check = resolveCitation(question.citation, files);
    if (!check.ok) throw new AppError("llm_failed", check.reason);
    return {
      id: `q${index + 1}`,
      // The slot decides the layer; the model only fills it in.
      layer: layers[index],
      difficulty: input.difficulty,
      question: question.question,
      focus: question.focus,
      snippet: check.snippet,
    };
  });

  return { part: { ...part, files: [...files.keys()] }, plan };
}

async function resolvePart(deps: Deps, input: StartInput, readable: FileInfo[]): Promise<Part> {
  if (!("description" in input.part)) {
    const files = knownFiles(input.part.files, readable);
    if (files.length === 0) throw new AppError("bad_request", "part files not in repository");
    return { id: "selected", title: input.part.title, summary: input.part.summary, files };
  }

  const description = input.part.description.trim().slice(0, LIMITS.maxCustomPartChars);
  if (!description) throw new AppError("bad_request", "empty part description");
  const output = await deps.llm.completeJson({
    system: SYSTEM_PROMPT,
    user: fileSelectionPrompt({ repo: input.repo, files: readable, description, locale: input.locale }),
    schema: fileSelectionOutputSchema,
    thinking: false,
    validate: (data) =>
      knownFiles(data.files, readable).length > 0 ? null : "none of these files exist; use exact paths from the list",
  });
  return { id: "custom", title: output.title, summary: output.summary, files: knownFiles(output.files, readable) };
}

// ---------- one turn: follow up or move on ----------

export type QuestionContext = {
  repo: RepoRef;
  part: PartRef;
  locale: Locale;
  question: PlannedQuestion;
  thread: Thread;
};

export async function nextTurn(deps: Deps, input: QuestionContext): Promise<TurnDecision> {
  const last = input.thread.exchanges[input.thread.exchanges.length - 1];
  if (!last?.answer) throw new AppError("bad_request", "the latest question has no answer");
  // The cap is enforced here, whatever the client or the model would prefer.
  if (!canFollowUp(input.thread)) return { type: "next" };

  const files = await loadPartFiles(deps.github, input.repo, input.part.files);
  const output = await deps.llm.completeJson({
    system: SYSTEM_PROMPT,
    user: turnPrompt({
      bundle: codeBundle(input.repo, files),
      part: input.part,
      question: input.question,
      thread: input.thread,
      followUpsUsed: followUpsUsed(input.thread),
      locale: input.locale,
    }),
    schema: turnOutputSchema,
    thinking: false,
    validate: (data) => (data.decision === "followup" && !data.followUp ? "a follow-up decision needs a followUp object" : null),
  });

  if (output.decision === "next" || !output.followUp) return { type: "next" };
  const citation = output.followUp.citation ? resolveCitation(output.followUp.citation, files) : undefined;
  return {
    type: "followup",
    prompt: output.followUp.question,
    difficulty: followUpDifficulty(last.difficulty, output.followUp.harder),
    // A follow-up with a broken citation is still useful; it just shows no new code.
    ...(citation?.ok ? { snippet: citation.snippet } : {}),
  };
}

export async function giveHint(deps: Deps, input: QuestionContext): Promise<{ hint: string }> {
  const files = await loadPartFiles(deps.github, input.repo, input.part.files);
  return deps.llm.completeJson({
    system: SYSTEM_PROMPT,
    user: hintPrompt({ bundle: codeBundle(input.repo, files), part: input.part, question: input.question, thread: input.thread, locale: input.locale }),
    schema: hintOutputSchema,
    thinking: false,
  });
}

// ---------- report ----------

export type ReportInput = {
  repo: RepoRef;
  part: PartRef;
  locale: Locale;
  plan: PlannedQuestion[];
  threads: Thread[];
};

/** A question nobody answered is "unanswered" by definition; the model is not asked to judge it. */
function isUnanswered(thread: Thread | undefined): boolean {
  return !thread || thread.exchanges.every((exchange) => exchange.skipped || !exchange.answer);
}

export async function buildReport(deps: Deps, input: ReportInput): Promise<Report> {
  const files = await loadPartFiles(deps.github, input.repo, input.part.files);
  const ids = input.plan.map((question) => question.id);

  const output = await deps.llm.completeJson({
    system: SYSTEM_PROMPT,
    user: reportPrompt({ bundle: codeBundle(input.repo, files), part: input.part, plan: input.plan, threads: input.threads, locale: input.locale }),
    schema: reportOutputSchema,
    thinking: true,
    validate: (data) => {
      const rated = new Set(data.questions.map((question) => question.id));
      const missing = ids.filter((id) => !rated.has(id));
      return missing.length ? `rate every question; missing: ${missing.join(", ")}` : null;
    },
  });

  const threadById = new Map(input.threads.map((thread) => [thread.questionId, thread]));
  const ratedById = new Map(output.questions.map((question) => [question.id, question]));
  const questions = ids.map((id) => {
    const rated = ratedById.get(id)!;
    return isUnanswered(threadById.get(id)) ? { ...rated, rating: "unanswered" as const } : rated;
  });

  return { ...output, questions };
}
