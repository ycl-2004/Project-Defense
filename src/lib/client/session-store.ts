"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LIMITS } from "@/lib/config";
import type { Difficulty, Locale, Part, ProjectOverview, RepoRef, Report } from "@/lib/domain";
import type { InterviewState } from "@/lib/interview/machine";

/**
 * Everything about the current practice session, saved in this browser only.
 * The server is stateless; each request carries what it needs from here.
 */
export type Analysis = { url: string; repo: RepoRef; overview: ProjectOverview; parts: Part[]; fileCount: number };
export type Setup = { partId: string | null; custom: string; difficulty: Difficulty; count: number };
export type ActiveSession = {
  locale: Locale;
  repo: RepoRef;
  part: Part;
  difficulty: Difficulty;
  interview: InterviewState;
  startedAt: string;
};
export type SavedReport = { report: Report; createdAt: string };

type State = {
  analysis?: Analysis;
  setup: Setup;
  session?: ActiveSession;
  report?: SavedReport;
  accessCode?: string;
  accessPrompt: boolean;
};

type Actions = {
  setAnalysis: (analysis: Analysis) => void;
  updateSetup: (patch: Partial<Setup>) => void;
  beginSession: (session: Omit<ActiveSession, "startedAt">) => void;
  setInterview: (interview: InterviewState) => void;
  setReport: (report: Report) => void;
  setAccessCode: (code: string) => void;
  setAccessPrompt: (open: boolean) => void;
};

const defaultSetup: Setup = { partId: null, custom: "", difficulty: "hard", count: LIMITS.defaultQuestions };

export const useSession = create<State & Actions>()(
  persist(
    (set) => ({
      setup: defaultSetup,
      accessPrompt: false,
      setAnalysis: (analysis) =>
        set({ analysis, setup: { ...defaultSetup, partId: analysis.parts[0]?.id ?? null }, session: undefined, report: undefined }),
      updateSetup: (patch) => set((state) => ({ setup: { ...state.setup, ...patch } })),
      beginSession: (session) => set({ session: { ...session, startedAt: new Date().toISOString() }, report: undefined }),
      setInterview: (interview) => set((state) => (state.session ? { session: { ...state.session, interview } } : {})),
      setReport: (report) => set({ report: { report, createdAt: new Date().toISOString() } }),
      setAccessCode: (accessCode) => set({ accessCode, accessPrompt: false }),
      setAccessPrompt: (accessPrompt) => set({ accessPrompt }),
    }),
    {
      name: "project-defense:v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ analysis, setup, session, report, accessCode }) => ({ analysis, setup, session, report, accessCode }),
    },
  ),
);

const subscribeHydration = (onChange: () => void) => useSession.persist.onFinishHydration(onChange);

/** False during server render and until localStorage has been read. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeHydration, () => useSession.persist.hasHydrated(), () => false);
}
