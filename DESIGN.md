---
name: Project Defense (答辩教练)
description: A reference-edition exercise book where the mentor's red pen marks the student's own code and the student answers in ballpoint blue.
colors:
  paper: "#fafbfc"
  paper-dark: "#131417"
  surface: "#ffffff"
  surface-dark: "#18191d"
  sunken: "#f1f3f6"
  sunken-dark: "#1e2024"
  rule: "#dfe5ec"
  rule-dark: "#2a2d33"
  rule-strong: "#c5cdd7"
  rule-strong-dark: "#3a3e46"
  ink: "#16171b"
  ink-dark: "#e8e8e5"
  ink-2: "#4f545c"
  ink-2-dark: "#a3a8b1"
  ink-3: "#6a707a"
  ink-3-dark: "#868c96"
  red-pen: "#c8352a"
  red-pen-dark: "#f07466"
  ballpoint: "#2a5ba6"
  ballpoint-dark: "#8fb4ee"
  ballpoint-wash: "#edf2f9"
typography:
  display:
    fontFamily: "Source Serif 4, Songti SC, STSong, Noto Serif SC, SimSun, serif"
    fontSize: "64px"
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Source Serif 4, Songti SC, STSong, Noto Serif SC, SimSun, serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Source Serif 4, Songti SC, STSong, Noto Serif SC, SimSun, serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.6
  body:
    fontFamily: "-apple-system, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans SC, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  mentor-hand:
    fontFamily: "Kaiti SC, STKaiti, KaiTi, BiauKai, Songti SC, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.75
  student-writing:
    fontFamily: "-apple-system, PingFang SC, sans-serif"
    fontSize: "15.5px"
    lineHeight: "28px"
  code:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "12.5px"
    lineHeight: "22px"
  label:
    fontFamily: "Source Serif 4, Songti SC, serif"
    fontSize: "14px"
    letterSpacing: "0.08em"
rounded:
  none: "0px"
spacing:
  rail: "56px"
  rail-with-notes: "168px"
  ruled-line: "28px"
  header: "56px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "44px"
  button-primary-disabled:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-2}"
  citation-chip:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "28px"
  rail-key:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.red-pen}"
    rounded: "{rounded.none}"
  rail-key-filled:
    backgroundColor: "{colors.red-pen}"
    textColor: "{colors.paper}"
  segmented-checked:
    backgroundColor: "{colors.ballpoint-wash}"
    textColor: "{colors.ballpoint}"
    rounded: "{rounded.none}"
    height: "44px"
---

# Design System: Project Defense

Light/dark pairs are `light-dark()` tokens in `src/app/globals.css`; the `-dark` keys above are the dark halves. Frontmatter is normative.

## Overview

**Creative North Star: "The Marked Exercise Book"**

Every question is pinned to the student's own lines the way a teacher's red pen marks an exercise book, set like a reference edition: code and conversation as twin columns around a centre rail of keys. Cool paper white, iron ink, one red pen, one ballpoint blue, pale rule-blue hairlines. It replaces the earlier warm-cream, tangerine, rounded world completely; nothing of it survives.

Density is calm and printed: 1px rules, square detents, no radius, no shadows, no gradients. Voice is a serious, kind mentor, never a chat bubble and never SaaS chrome.

**Key Characteristics:**
- Two writers, two colours: red pen = the mentor only, ballpoint blue = the student only. Neither ever decorates.
- Ink-filled primary actions; everything else is a ruled text control.
- Marks are strokes and shapes (tick, half tick, cross, dash, brackets, circled numbers), so colour is never the only signal.
- Zero radius everywhere, except the circle of a circled reference number.

## Colors

Cool paper, iron ink, two pens. Contrast measured (WCAG, on paper / on surface).

### Primary
- **Iron Ink** (#16171b light, #e8e8e5 dark): text, primary action fill, filled detents. 17.3:1 / 15.0:1 on paper.
- **Red Pen** (#c8352a light, #f07466 dark): mentor marks only: Kai margin notes and follow-ups, cited-range wash and bracket, rail keys, circled refs, underlines, rating marks, citation brackets, current detent, logo seal, radar series, thinking squares, errors. 5.07:1 / 6.49:1 on paper (5.25 / 6.19 on surface). Wash `--pen-wash`: rgb(200 53 42 / .055) light, rgb(240 116 102 / .09) dark.
- **Ballpoint Blue** (#2a5ba6 light, #8fb4ee dark): the student's answer text, chosen option, caret, text selection wash, focus ring, active field underline. 6.44:1 / 8.71:1 on paper. Wash #edf2f9 light, rgb(143 180 238 / .1) dark (blue on wash 5.94:1 light).

### Neutral
- **Paper** (#fafbfc / #131417): page. **Surface** (#ffffff / #18191d): code, fields, popovers. **Sunken** (#f1f3f6 / #1e2024): hover, muted fills.
- **Rule** (#dfe5ec / #2a2d33): inner hairlines. **Rule Strong** (#c5cdd7 / #3a3e46): header rule, field borders, grid lines.
- **Ink 2** (#4f545c / #a3a8b1) secondary text, 7.4:1 / 7.7:1. **Ink 3** (#6a707a / #868c96) gutters, placeholders, comments, 4.81:1 / 5.44:1 (4.99 on surface); passes AA only for 14px+ and incidental text, never use it for required reading below 12.5px.

### Named Rules
**The Two Pens Rule.** Red appears only where the mentor wrote or marked; blue only where the student wrote or chose. Code syntax, charts of student data, tags and buttons never borrow either.
**The Ink Primary Rule.** The one primary action per view is a solid ink rectangle with paper text. Red is never a button fill.
**The No-Gradient Rule.** Flat fills only; the only translucency is the two washes.

## Typography

**Printed (display, headings, numerals, apparatus):** Source Serif 4 (Latin, via next/font) falling to system Song (Songti SC / STSong / Noto Serif SC / SimSun).
**UI and body:** system CJK sans (PingFang SC and kin). **Mentor hand:** system Kai (Kaiti SC / STKaiti / KaiTi / BiauKai). **Code:** JetBrains Mono.

**Character:** a reference edition: Song for what is printed (questions, headings), Kai for what the teacher writes, sans for furniture. Chinese is the default; Latin tracking is tightened only on Latin headings.

### Hierarchy
- **Display** (600, 40/54/64px responsive, 1.16): home h1; Latin -0.02em.
- **Headline** (600, 28 to 32px, 1.3): section heads; report h1 36 to 46px; setup step titles 20px; report sections 19 to 22px.
- **Title** (600, 17 to 19px Song): step and layer names, report question titles (17px), mentor verdict (21px).
- **Body** (14 to 16.5px sans, 1.7 to 1.85): lead 16.5px; UI copy 14 to 15px; lines under 40em.
- **Student writing** (15.5px sans / composer 16px, line-height exactly 28px, ballpoint blue).
- **Mentor hand** (Kai 16 to 18px, 1.75 to 1.8): follow-ups 17px, hints 16px (ink-2, not red), report summary 18px; margin notes 14px / 18px.
- **Code** (12.5px / 22px mono; tokens in ink only, see Components).
- **Label / apparatus** (`.apparatus`: Source Serif all-small-caps, +0.08em, 14px): Latin sub-name in the wordmark. Other labels are plain 12.5 to 14px medium sans in ink-2, sentence case.

### Named Rules
**The Hand Rule.** Kai is for mentor words only; the student's words are always sans in blue.
**The Tabular Rule.** Numbers in gutters, keys, counts and scores use tabular figures.

## Layout

Fixed 56px running head with a `rule-strong` bottom rule: wordmark left, centre slot (interview: progress detents), toggles right. Content widths: marketing and setup `max-w-6xl`/1280, report `max-w-5xl`, interview full-bleed. Page gutters 20px mobile, 32px from `sm`.

- **/interview, twin columns plus a rail.** Grid 1.12fr code / 0.88fr conversation (>= desktop). The code column carries a 56px centre rail at its right edge (168px when the mentor has a margin note: 56 rail + 112 note gutter). Conversation column: questions in Song, student answer in blue on 28px rules, mentor follow-up in red Kai, ruled composer pinned at the bottom (hint and skip as underlined text, send as ink). Earlier turns collapse to a numbered ledger. Mobile stacks code above conversation.
- **/ the home spread.** Hero is two columns split by a 1px rule (1.08fr / 1px / 0.92fr): headline, lead and underlined repo field with ink button left; a live-typed demo spread right. Below: four numbered steps joined by a rule, five layers as a ruled list with Kai examples, difficulty definition list, and a specimen report page. Sections are separated by hairlines, not bands or cards.
- **/setup, a rail of steps.** Two columns (0.85fr / 1.5fr): overview and file list left; right a vertical rail of numbered square steps (red-bordered, Song numerals) for Part, difficulty, count, notes. Part options are ruled rows with a blue-washed selected row. Sticky bottom action bar on mobile.
- **/report, a corrected paper.** One centred column: serif title, text export actions as underlined controls plus one ink print button; summary in red Kai; ratings strip; radar beside an exact score list; per-question review pairing the student's words in blue with red marks; mentor verdict in a hairline-framed box whose red heading sits on the top rule.

Rhythm: sections 56 to 80px apart; list rows separated by 1px rules with 10 to 20px padding.

## Elevation & Depth

None. Depth is rules, a `sunken` tone, and one `surface` step for code and fields. No box-shadow anywhere in the routes; a hover is a tone change.

### Named Rules
**The Flat Page Rule.** Do not add shadows, glows, blur or lift on hover. Separate with a 1px rule or a tone.

## Shapes

Every `--radius-*` token is 0. Squares are the unit: square detents (7 to 11px), square numbered steps (24 to 28px), square logo seal (答 in Song on red), square radar vertex dots and thinking dots. The one circle is the circled reference number (16px, 1px red border). Borders are 1px; the selected option adds a 1px inset ballpoint outline. Focus: 2px ballpoint outline, 2px offset.

## Components

### Buttons
Primary: solid ink, paper text, 40 to 48px high, 20 to 24px padding, 14.5 to 15px medium, hover opacity .9, disabled becomes a hairline-bordered paper outline (or .35 opacity in setup). Secondary actions are text with a `rule-strong` underline (4 to 6px offset) that darkens to ink on hover; header controls are 32px ghost squares with a sunken hover. The shadcn `Button` in `components/ui` is only used by the access-code dialog.

### Centre rail (signature)
56px column left-bordered by a rule, sticky to the right edge so it survives horizontal scroll. Contents: a 1px red bracket along the cited range with 7px hollow square detents at both ends; square keys (11px sans, 1px red border, red text; filled red with paper text for the question's own key) at lines the question names; unkeyed refs show a circled number; the mentor's margin note hangs off a 10px red tick in Kai 14px.

### Red-pen marks
Cited lines get gutter numbers in red medium weight and a `pen-wash` background animated in over 700ms. Lines the question names get a 1.5px red underline (5px offset) and a circled number (①②...). Rating marks are 18px strokes in red: tick (clear), tick plus half stroke (partial), cross (misconception), grey dash (unanswered), always with a text label. Citation chip: `[ file.ext · 第 a-b 行 ]` with red brackets, mono file name, 28px high, wash on hover.

### Code view
Plain text renders first, colour arrives without shift. Line height 22px, hanging indent for wrapped lines under their own indentation. Highlight theme is ink only (ink, ink-2 for strings and punctuation, ink-3 for comments, keywords bold), both themes defined in `src/lib/client/highlight.ts`.

### Ruled student writing
Student text and the composer sit on a repeating 1px `rule` line every 28px; composer has only top/bottom `rule-strong` borders, the bottom turning ballpoint on focus.

### Fields, segmented, tags
Repo field is an ink underline turning ballpoint on focus. Segmented control: a 1px bordered row of 44px cells, checked cell = ballpoint wash, blue text, inset blue outline. Difficulty = one to three filled squares plus its name. Layer tag is plain text.

### Progress and waiting
Header progress: one 22px numbered square cell per main question, 5 to 8 (done = ink fill, current = red, pending hairline) with 4px pips for turns used. Thinking = three red 6px squares pulsing opacity. Indeterminate bar = 1px rule with a sliding red segment.

## Motion

Quiet and short. Mark wash-in 700ms `cubic-bezier(.16,1,.3,1)`; demo spread rise 8px / 400ms same ease; thinking pulse 1.2s with 160ms stagger; indeterminate 1.6s. Code follows the cited range with smooth scroll. `prefers-reduced-motion` clamps all animation and transition to 1ms and scroll to auto. Radar has no entrance animation.

## Charts

One radar on five axes (1 to 5), polygon grid in `rule-strong`, one red series at 1.5px with 8% fill and square dots; axis labels ink-2 12.5px. It is aria-hidden: the adjacent score list (name, five square detents with half fills, "n / 5") is the exact and accessible reading. Hover tooltip is a hairline-bordered surface box.

## Print

Report prints as a paper: `@page` margin 14mm 12mm, color-scheme forced light, white body, `.no-print` hides header and actions, headings `break-after: avoid`, chart block `break-inside: avoid` in two columns. Radar animation off so print captures the final frame.

## Accessibility

Text pairs measured above; ink-3 is the weakest at 4.8:1. Focus is a visible 2px ballpoint outline. Every mark pairs shape with a text label. Arrow-key radio navigation in segmented controls; progress uses `aria-current="step"`; thinking is `role="status"`; decorative rail and marks are `aria-hidden` with full path in the chip's `aria-label`. Theme follows system unless a cookie sets `.light`/`.dark`; no flash. Touch targets 40 to 48px on primary actions.

## Do's and Don'ts

### Do:
- **Do** write mentor words in Kai red and student words in sans blue; nothing else uses those colours.
- **Do** use ink-filled rectangles for the primary action and underlined text for the rest.
- **Do** separate with 1px rules, set small numbers in tabular Source Serif or sans, and pair every mark with a label.
- **Do** keep corners at 0 and add new detents as squares.

### Don't:
- **Don't** use chat bubbles, avatars, or IDE-and-chat-panel chrome (tabs, toolbars, a dark editor beside a messenger); turns are label then text, and the code reads as a printed page.
- **Don't** reintroduce cream, tangerine, rounded pills, soft shadows, glass, gradients, or emoji icons.
- **Don't** use the three-up icon-card grid, big-number stat tiles, hero gradients, or eyebrow kickers above headings.
- **Don't** use red for buttons, success/warning semantics, or syntax colours; don't use blue for links or decoration.
- **Don't** colour code tokens; weight and two greys carry structure.
- **Don't** encode meaning in colour alone.

## Known drift (recorded, not canonized)
- `components/ui/button.tsx` and `dialog.tsx` still carry shadcn defaults (ring-3 focus, translucent destructive; the dialog has a ring-1 edge and zoom animation); radius resolves to 0 through the tokens, but they are off-system and used only by the access-code dialog.
- Hand-rolled ink buttons repeat the same class string across routes instead of one shared primary-button component.
