import { LOCALES, type Locale } from "@/lib/domain";

/** Locale and theme live in cookies so the server renders the right language and colours on first paint. */
export const LOCALE_COOKIE = "pd-locale";
export const THEME_COOKIE = "pd-theme";
export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export function parseLocale(value: string | undefined, fallback: Locale = "zh"): Locale {
  return (LOCALES as readonly string[]).includes(value ?? "") ? (value as Locale) : fallback;
}

/** `undefined` means "follow the system". */
export function parseTheme(value: string | undefined): Theme | undefined {
  return (THEMES as readonly string[]).includes(value ?? "") ? (value as Theme) : undefined;
}

export function htmlLang(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : "en";
}
