# 001 · Evidence, not a score

**Date:** 2026-10-30 · **Status:** accepted

## Context

Five to eight questions cannot prove that a student understands their code, and they cannot show who wrote it. A single number would be read as exactly that kind of verdict by students, parents and mentors.

## Decision

- The model rates each question on four levels: clear, partial, misconception, unanswered. Every rating carries evidence (the student's words set against the code, with file and lines) and one sentence of feedback.
- Questions the student skipped or never answered are rated *unanswered* by rule, not by the model.
- The five-layer radar is computed in code from the ratings (`RATING_SCORE` in `src/lib/interview/scoring.ts`: clear 5, partial 3, misconception 2, unanswered 1). The model never draws the chart.
- No total score. The report states that it is evidence, not proof, and never a cheating verdict, and it ends with a small code change for the mentor to ask for.

## Consequences

- The same answers always produce the same chart, and the mapping is written down for anyone who asks.
- Mentors still have to read the evidence. That is the intended use.
