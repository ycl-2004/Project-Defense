# 004 · Next.js on Vercel with DeepSeek

**Date:** 2026-10-30 · **Status:** accepted

## Context

The site must keep an API key on a server, be quick to deploy for a demo link, and stay one codebase.

## Decision

- **Next.js 16 App Router, TypeScript, one repository.** Pages and API routes ship together. A Python backend could have reused the author's Pluggable Agent LLM layer, but that code lives in private repositories and would add a second language and a second deploy.
- **Vercel.** GitHub Pages only serves static files, so it cannot hold the key. Route handlers set `maxDuration` (60–180 s) within the Hobby plan's 300-second limit.
- **DeepSeek `deepseek-flash` through the official `openai` SDK** (`baseURL https://api.deepseek.com`). JSON mode for every call. Thinking mode is on for one-off work (analysis, planning, report) and off for the interactive turns and hints, which keeps a turn to a few seconds.
- **GitHub reads**: three REST calls (repository, commit, tree) per analysis, file bodies from `raw.githubusercontent.com`, an optional read-only token for the higher rate limit.
- **UI**: Tailwind CSS v4, shadcn/ui on Radix primitives, Shiki for highlighting, Motion, Recharts, zustand.

## Consequences

Changing the model is one environment variable (`DEEPSEEK_MODEL`). Moving to another OpenAI-compatible provider means a new `JsonLLM` implementation; nothing above `src/lib/llm/` knows which model it talks to.
