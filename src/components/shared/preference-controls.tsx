"use client";

import { Languages, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePrefs } from "@/components/providers";

export function LocaleToggle() {
  const { locale, setLocale, t } = usePrefs();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 rounded-full px-3 text-ink-2 hover:text-ink"
          onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
          aria-label={t.common.switchLocale}
        >
          <Languages className="size-4" />
          <span className="text-[13px] font-medium">{t.common.localeShort}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t.common.switchLocale}</TooltipContent>
    </Tooltip>
  );
}

export function ThemeToggle() {
  const { theme, setTheme, t } = usePrefs();
  const toggle = () => {
    const isDark = theme ? theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(isDark ? "light" : "dark");
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full text-ink-2 hover:text-ink"
          onClick={toggle}
          aria-label={t.common.toggleTheme}
        >
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t.common.toggleTheme}</TooltipContent>
    </Tooltip>
  );
}
