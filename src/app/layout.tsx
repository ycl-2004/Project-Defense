import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, JetBrains_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import { Providers } from "@/components/providers";
import { htmlLang, LOCALE_COOKIE, parseLocale, parseTheme, THEME_COOKIE } from "@/lib/preferences";
import { cn } from "@/lib/utils";
import "./globals.css";

const brand = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-brand", display: "swap" });
const ui = Figtree({ subsets: ["latin"], variable: "--font-ui", display: "swap" });
const code = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code", display: "swap" });

export const metadata: Metadata = {
  title: "答辩教练 · Project Defense",
  description:
    "Paste a GitHub repo and practise explaining your own code. 贴上 GitHub 仓库，跟着 AI 教练练习讲清楚自己写的代码。",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1815" },
  ],
};

// The locale and theme cookies shape the whole document, so every page renders per request.
export const instant = false;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [store, headerList] = await Promise.all([cookies(), headers()]);
  const browserLocale = headerList.get("accept-language")?.toLowerCase().startsWith("zh") ? "zh" : "en";
  const locale = parseLocale(store.get(LOCALE_COOKIE)?.value, browserLocale);
  const theme = parseTheme(store.get(THEME_COOKIE)?.value);

  return (
    <html lang={htmlLang(locale)} className={cn(brand.variable, ui.variable, code.variable, theme)}>
      <body className="min-h-dvh">
        <Providers locale={locale} theme={theme}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
