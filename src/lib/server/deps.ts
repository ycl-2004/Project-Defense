import { DEEPSEEK } from "@/lib/config";
import { AppError } from "@/lib/errors";
import { GitHubClient } from "@/lib/github/client";
import { DeepSeekLLM } from "@/lib/llm/client";
import type { Deps } from "./services";

let github: GitHubClient | undefined;

/** Real dependencies from environment variables. The GitHub client is reused so its file cache survives between requests. */
export function getDeps(): Deps {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new AppError("not_configured", "DEEPSEEK_API_KEY is not set");
  github ??= new GitHubClient(process.env.GITHUB_TOKEN || undefined);
  return { github, llm: new DeepSeekLLM(apiKey, process.env.DEEPSEEK_MODEL || DEEPSEEK.defaultModel) };
}
