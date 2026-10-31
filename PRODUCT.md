# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: students aged 13–18 in AI programming courses**, mostly Simplified-Chinese speakers, who built a working app with AI help and now need to explain it. They use the site on a laptop, in class or at home, before a Demo Day, a mentor check-in or an interview. A session lasts 15–30 minutes and is often their first time being questioned about their own code.
- **Mentors and teachers** read the finished report (on screen, as Markdown or as a printed PDF) to see where a student's understanding is solid and what to ask for next.
- **The hiring team at the course provider** evaluates the product by using it. They are judging whether it feels like a real, mature product, not reading a pitch.

## Product Purpose

A rehearsal for the moment someone asks a student "how does this work?". The student pastes a public GitHub repository, picks one feature (a *Part*), a difficulty and a number of questions, and answers five to eight questions that climb from explaining the feature to changing it. Success is a student who can explain their own code better after one session, and a mentor who can verify that from the report without re-reading the whole repository.

## Positioning

Every question is grounded in the student's real code: it cites a file and line range, and the snippet is cut on the server from the commit the session is pinned to, so the coach can point at code but never invent it. Follow-ups react to the student's own words. The report gives evidence (the student's words beside the code) instead of a score, and it is explicitly not a cheating verdict.

## Operating Context

- Flow: paste a link → overview and Parts → choose Part, difficulty (easy / hard / tricky) and 5–8 main questions → answer with the cited code beside the conversation, up to two follow-ups per question, hints and skip → report.
- The five layers every session climbs: explain the feature, understand the code, understand decisions, handle failure, apply it.
- Ratings per question: clear, partial, misconception, unanswered. The five-layer chart is derived from them by a fixed rule.
- Mentors receive the report as a page, a Markdown export or a printed PDF.
- Waits are real: analysis about 10 s, planning 10–17 s, a turn 1–4 s, the report about 15 s.

## Capabilities and Constraints

- Public GitHub repositories only; one Part reads at most 40 files and 300 KB.
- Interface in Simplified Chinese first, English second; the session language is fixed when it starts. Light and dark themes.
- Laptop is the primary device; phones must work but are secondary.
- No accounts and no database: the session lives in the browser; reports are exported, not shared by link.
- Next.js on Vercel, DeepSeek `deepseek-flash`. Code is shown with syntax highlighting.

## Brand Commitments

- The name stays: **答辩教练 · Project Defense**. The logo may be redrawn.
- The stance stays: evidence, not scores; never a cheating verdict; hints and "I don't know" are always allowed.

## Evidence on Hand

- Real sessions produced by the live site: this repository, `vercel/ms`, and `ycl-2004/NoType` (questions, follow-ups, hints and a full report).
- Screenshots in `docs/screenshots/`, a demo recording in `docs/demo.gif`.
- No users, testimonials, schools, partners or usage numbers exist. Never invent them.

## Product Principles

1. The student's own code is the subject; the interface keeps it in view.
2. Ask, don't grade: the coach questions and records evidence, the mentor judges.
3. Being stuck is part of practice; asking for a hint or skipping is never a failure state.
4. Every claim the product makes about a student is traceable to their words and their code.

## Accessibility & Inclusion

- Teen readers, Chinese-first: comfortable reading size and line height for long Chinese text, no italic Chinese.
- Contrast at WCAG AA or better; ratings never rely on colour alone; full keyboard use; respects reduced motion.
