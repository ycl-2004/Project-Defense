# 002 · Code snippets are cut on the server

**Date:** 2026-10-30 · **Status:** accepted

## Context

A question about code the student never wrote is worse than no question. Language models misquote code and drift on line numbers.

## Decision

- The model sees each file with line numbers (`N| code`) and answers with a citation: path, start line, end line. It never supplies the code itself.
- `resolveCitation` (`src/lib/interview/citations.ts`) checks the citation against the file at the pinned commit and cuts the snippet. Ranges longer than 40 lines are trimmed; unknown files, out-of-range or blank lines are rejected.
- When planning, any rejected citation is sent back to the model with the exact problem, up to three attempts (`checkReply` in `src/lib/llm/client.ts`). For a follow-up, a broken citation is dropped and the question is kept.
- The session is pinned to one commit SHA, so the code cannot change under the student mid-session.

## Consequences

Every snippet a student or mentor sees exists in the repository at that commit. `npm run eval:live` re-reads each cited range from GitHub and compares it byte for byte.
