# 003 · Stateless server, session in the browser

**Date:** 2026-10-30 · **Status:** accepted for v1

## Context

The first version needs to be easy to deploy and safe to leave running: no accounts, no database to secure or pay for.

## Decision

- The browser keeps the session in `localStorage` (zustand `persist`) and sends what each call needs: the pinned repository, the Part's file paths, the question and the thread so far.
- Request bodies are validated with zod and capped (answer length, number of exchanges, files per Part). File contents are re-read from GitHub at the pinned commit and the byte budget is enforced on the real content.
- Rules that matter for cost or fairness are enforced on the server: the follow-up cap and "skipped means unanswered".
- Reports are exported as Markdown or PDF instead of shared by link.

## Consequences

- No shareable report link yet; a database-backed link is the natural next step.
- A determined student could edit their own transcript before asking for a report. The tool is for practice and the mentor verifies the evidence, so this is acceptable for v1.
