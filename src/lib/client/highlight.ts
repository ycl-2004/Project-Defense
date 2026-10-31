import type { HighlighterCore, ThemedToken, ThemeRegistration } from "shiki/core";

/**
 * Code is printed matter in this world: ink only, structure carried by weight and two greys.
 * Red stays the mentor's pen and blue the student's, so syntax never borrows either.
 */
function inkTheme(name: string, ink: string, ink2: string, ink3: string): ThemeRegistration {
  return {
    name,
    type: name.endsWith("dark") ? "dark" : "light",
    colors: { "editor.foreground": ink, "editor.background": "#00000000" },
    tokenColors: [
      { settings: { foreground: ink } },
      { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: ink3 } },
      { scope: ["string", "string.quoted", "constant.character", "constant.numeric", "constant.language"], settings: { foreground: ink2 } },
      {
        scope: ["keyword", "storage", "storage.type", "storage.modifier", "keyword.control", "keyword.operator.new", "variable.language"],
        settings: { foreground: ink, fontStyle: "bold" },
      },
      { scope: ["entity.name.function", "support.function", "entity.name.type", "entity.name.class", "support.type"], settings: { foreground: ink } },
      { scope: ["punctuation", "meta.brace", "keyword.operator"], settings: { foreground: ink2, fontStyle: "" } },
    ],
  };
}

const THEMES = {
  light: inkTheme("ink-light", "#16171b", "#4f545c", "#6a707a"),
  dark: inkTheme("ink-dark", "#e8e8e5", "#a3a8b1", "#868c96"),
};

let highlighter: Promise<HighlighterCore> | undefined;

/** One lazily created highlighter; languages load on first use, so unused grammars are never downloaded. */
function getHighlighter(): Promise<HighlighterCore> {
  highlighter ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
    ]);
    return createHighlighterCore({ themes: [THEMES.light, THEMES.dark], langs: [], engine: createJavaScriptRegexEngine() });
  })();
  return highlighter;
}

/**
 * Tokens per line with both theme colours as CSS variables (`--shiki-light` / `--shiki-dark`),
 * or `null` when the language is unknown and the code should render as plain text.
 */
export async function highlightLines(code: string, lang: string): Promise<ThemedToken[][] | null> {
  const [core, { bundledLanguages }] = await Promise.all([getHighlighter(), import("shiki/langs")]);
  const loader = bundledLanguages[lang as keyof typeof bundledLanguages];
  if (!loader) return null;
  if (!core.getLoadedLanguages().includes(lang)) await core.loadLanguage(loader);
  return core.codeToTokens(code, {
    lang,
    themes: { light: THEMES.light.name!, dark: THEMES.dark.name! },
    defaultColor: false,
  }).tokens;
}
