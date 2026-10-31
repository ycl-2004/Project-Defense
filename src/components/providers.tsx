"use client";

import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AccessCodeDialog } from "@/components/shared/access-code-dialog";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSession } from "@/lib/client/session-store";
import type { Locale } from "@/lib/domain";
import { format, MESSAGES, type Messages } from "@/lib/i18n/messages";
import { htmlLang, LOCALE_COOKIE, THEME_COOKIE, type Theme } from "@/lib/preferences";

type Preferences = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** `undefined` = follow the system. */
  theme: Theme | undefined;
  setTheme: (theme: Theme) => void;
  t: Messages;
  f: typeof format;
};

const PreferencesContext = createContext<Preferences | null>(null);

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

export function Providers(props: { locale: Locale; theme: Theme | undefined; children: ReactNode }) {
  const [locale, setLocaleState] = useState(props.locale);
  const [theme, setThemeState] = useState(props.theme);

  const setLocale = useCallback((next: Locale) => {
    writeCookie(LOCALE_COOKIE, next);
    document.documentElement.lang = htmlLang(next);
    setLocaleState(next);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    writeCookie(THEME_COOKIE, next);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
    setThemeState(next);
  }, []);

  useEffect(() => {
    void useSession.persist.rehydrate();
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, theme, setTheme, t: MESSAGES[locale], f: format }),
    [locale, setLocale, theme, setTheme],
  );

  return (
    <PreferencesContext.Provider value={value}>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={250}>
          {props.children}
          <Toaster theme={theme ?? "system"} position="top-center" />
          <AccessCodeDialog />
        </TooltipProvider>
      </MotionConfig>
    </PreferencesContext.Provider>
  );
}

export function usePrefs(): Preferences {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePrefs must be used inside <Providers>");
  return value;
}
