"use client";

import { Moon, Sun } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { HeadControl } from "./site-header";

export function LocaleToggle() {
  const { locale, setLocale, t } = usePrefs();
  return (
    <HeadControl onClick={() => setLocale(locale === "zh" ? "en" : "zh")} aria-label={t.common.switchLocale} title={t.common.switchLocale}>
      <span className="apparatus text-[14px] text-inherit">{t.common.localeShort}</span>
    </HeadControl>
  );
}

export function ThemeToggle() {
  const { theme, setTheme, t } = usePrefs();
  const toggle = () => {
    const isDark = theme ? theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(isDark ? "light" : "dark");
  };
  return (
    <HeadControl onClick={toggle} aria-label={t.common.toggleTheme} title={t.common.toggleTheme} className="w-8 justify-center px-0">
      <Sun className="size-4 dark:hidden" strokeWidth={1.5} />
      <Moon className="hidden size-4 dark:block" strokeWidth={1.5} />
    </HeadControl>
  );
}
