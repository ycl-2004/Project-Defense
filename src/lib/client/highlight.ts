import type { HighlighterCore, ThemedToken } from "shiki/core";

let highlighter: Promise<HighlighterCore> | undefined;

/** One lazily created highlighter; languages load on first use, so unused grammars are never downloaded. */
function getHighlighter(): Promise<HighlighterCore> {
  highlighter ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, { bundledThemes }] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
      import("shiki/themes"),
    ]);
    return createHighlighterCore({
      themes: [bundledThemes["vitesse-light"], bundledThemes["vitesse-dark"]],
      langs: [],
      engine: createJavaScriptRegexEngine(),
    });
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
    themes: { light: "vitesse-light", dark: "vitesse-dark" },
    defaultColor: false,
  }).tokens;
}
