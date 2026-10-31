# Design system

**Thesis.** A warm study desk: cream paper, ink-dark type, one confident tangerine accent. Calm and focused like a real defense, with warmth at the moments that matter (the first question, a follow-up, the report). No illustrations; the type, spacing and the code itself carry the character.

## Tokens

All colours are CSS variables in `src/app/globals.css`, each defined once with `light-dark(light, dark)`. The page follows the system theme until the user picks one; the choice is a cookie the server applies as `.light` / `.dark` on `<html>`, so there is no flash.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `paper` | `#fbf7f0` | `#1b1815` | page background |
| `surface` | `#ffffff` | `#231f1b` | cards, inputs |
| `sunken` | `#f4ede2` | `#2b2621` | chips, tracks, the student's bubbles |
| `line` / `line-strong` | `#e8dfd1` / `#d9cdbb` | `#3a332c` / `#4a4138` | borders |
| `ink` / `ink-2` / `ink-3` | `#221e1a` / `#6b6259` / `#8a8076` | `#ede6dc` / `#a89e92` / `#857b70` | text |
| `brand` | `#c94f25` | `#f08a5d` | the one accent: primary actions, progress, the radar |
| `brand-soft` / `brand-ink` | `#fbe3d6` / `#a63e1b` | tinted / `#f5a27c` | the coach's bubbles, highlights |
| `code-bg` / `code-mark` | `#fffdf9` / `#fdebd9` | `#1f1b18` / tinted | code panel and cited lines |

Measured contrast: ink on paper 15.5:1; `ink-2` on paper 5.6:1; white on `brand` 4.54:1; dark-mode ink 14.3:1.

**Ratings** (clear · partial · misconception · unanswered) have a text colour, a soft background and a chart mark. The marks (`#1f7a4d · #b07a1a · #b23a3a` light, `#3f9f72 · #b9852a · #e0607a` dark) pass the dataviz palette checker's lightness, chroma and normal-vision gates; colour-blind separation sits in the 6–8 band, which is allowed because every rating also shows an icon and a label. *Unanswered* is a deliberate neutral grey.

## Type

- Display and numbers: **Bricolage Grotesque** (`font-display`). UI: **Figtree**. Code: **JetBrains Mono**. All self-hosted with `next/font`.
- Chinese uses the system stack (PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans SC), never a downloaded CJK webfont.
- Chinese weights 400/500/600 only; body line height 1.6–1.85; no negative letter-spacing on Chinese; no italics anywhere.
- Model text renders through `RichText`: backticked identifiers become small inline code, nothing is parsed as HTML.

## Shape and depth

Radius scale 8 / 12 / 16 / 20 / 28 / 36 px; buttons 12 px, cards 16–28 px. Two shadows only: `shadow-card` for resting cards, `shadow-lift` for the one card that should come forward. No shadows in print.

## Layout

- Home: left-aligned hero with the link field; the right side replays a real exchange with the real components.
- Session (≥1024 px): code panel left, conversation right, each scrolling on its own with `overscroll-behavior: contain`; progress in the header. Below 1024 px: one column, code behind a toggle, the composer pinned to the bottom.
- Selected states use a full border and a tinted fill, never a side bar.

## Motion

UI transitions stay at or under 300 ms and animate only opacity and transform. New turns rise 10 px and fade in; cited lines wash in. Charts do not animate, because a resize or a print would capture their first frame. `prefers-reduced-motion` turns animation off.

## Charts

The five-layer radar is one series in `brand` with a hairline grid. The exact scores sit beside it as a list with meters, which is also the accessible equivalent. The rating strip has one segment per question with 2 px gaps and a legend with icons, labels and counts.

## Print

Printing expands every question, keeps cards whole, hides navigation and actions, drops shadows and always uses the light palette.
