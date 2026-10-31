<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Defense · 答辩教练

Students paste a public GitHub repository; a DeepSeek-backed coach asks 5–8 layered questions that cite real lines, follows up, and writes an evidence-based report. Next.js 16 App Router, TypeScript, deployed on Vercel. Read `README.md` for the product, `DESIGN.md` for the visual system and `docs/decisions/` for why things are the way they are.

## Commands

- `npm run dev` · `npm run lint` · `npm run typecheck` · `npm test` (unit, no network) · `npm run test:e2e` (Playwright, AI mocked) · `npm run build`
- `npm run eval:live` calls the real GitHub and DeepSeek APIs and costs money. Run it by hand after changing prompts or the model; never in CI.
- Before calling work done: lint, typecheck, unit tests and build pass; UI changes are checked in screenshots at 1440 and 390 px, light and dark.

## Layers

- **Contract**: `src/lib/domain.ts` (types + zod), `src/lib/api/contracts.ts` (request bodies), `JsonLLM` in `src/lib/llm/client.ts`.
- **Domain**: `src/lib/github/` (links, filtering, client) and `src/lib/interview/` (layers, state machine, citations, scoring, prompts, export). Pure where possible.
- **Application**: `src/lib/server/services.ts` takes its dependencies as arguments; route handlers in `src/app/api/**` stay thin and go through `handleJson`.
- **UI**: `src/components/**`, browser state in `src/lib/client/session-store.ts`.

## Rules

- Every limit lives in `src/lib/config.ts`; every visible string in `src/lib/i18n/messages.ts` (`en` is typed from `zh`, so both stay complete).
- Never trust model output: parse with zod, add a `validate` hook for domain checks, and show code only through `resolveCitation`, which cuts it from the real file.
- The follow-up cap and "skipped means unanswered" are enforced on the server, not only in the browser.
- Prompts: rules only in `SYSTEM_PROMPT`; repository text and answers fenced as data; keep the system prompt identical across calls and the code bundle first, so DeepSeek's prefix cache hits.
- Next.js 16 specifics: the root layout reads cookies and exports `instant = false`; route handlers may export `maxDuration` but not `runtime` or `dynamic`; pages stay mounted when hidden, so API calls start from user actions, not effects.
- UI: colours are tokens in `src/app/globals.css` (`light-dark()`); no italics; no coloured side bars on cards or selected items; Chinese uses the system font stack with weights 400/500/600; status colours always come with an icon and a label.
- Tests: shared behaviour is tested once in `tests/` with the fakes in `tests/fakes.ts`; e2e mocks `/api/**` and `raw.githubusercontent.com`.
- Secrets live only in `.env.local` or the Vercel dashboard. Commit with a clear subject line and the co-author trailer used in history.
