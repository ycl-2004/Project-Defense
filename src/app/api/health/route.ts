import { connection } from "next/server";
import { DEEPSEEK } from "@/lib/config";
import { GitHubClient } from "@/lib/github/client";

/**
 * Configuration check for whoever runs the site. Reports whether each key is present and whether
 * GitHub accepts the token; it never returns a key itself.
 */
export async function GET() {
  await connection();
  const token = process.env.GITHUB_TOKEN || undefined;
  const github = await new GitHubClient(token).rateLimit().catch(() => null);

  return Response.json({
    deepseek: { configured: !!process.env.DEEPSEEK_API_KEY, model: process.env.DEEPSEEK_MODEL || DEEPSEEK.defaultModel },
    github: {
      tokenConfigured: !!token,
      tokenAccepted: !!token && !!github && !github.rejected,
      limit: github?.limit ?? null,
      remaining: github?.remaining ?? null,
    },
    accessCode: !!process.env.ACCESS_CODE,
  });
}
