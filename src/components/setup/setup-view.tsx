"use client";

import { ArrowRight, FolderSearch, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePrefs } from "@/components/providers";
import { EmptyState, PageSkeleton } from "@/components/shared/empty-state";
import { Segmented } from "@/components/shared/segmented";
import { SiteHeader } from "@/components/shared/site-header";
import { DifficultyTag } from "@/components/shared/tags";
import { Button } from "@/components/ui/button";
import { api, errorCodeOf, type ClientErrorCode } from "@/lib/client/api";
import { useHydrated, useSession } from "@/lib/client/session-store";
import { LIMITS } from "@/lib/config";
import { DIFFICULTIES } from "@/lib/domain";
import { startInterview } from "@/lib/interview/machine";
import { CUSTOM_PART, PartPicker } from "./part-picker";
import { PlanningPanel } from "./planning-panel";
import { ProjectOverview } from "./project-overview";

const COUNTS = Array.from({ length: LIMITS.maxQuestions - LIMITS.minQuestions + 1 }, (_, index) => String(LIMITS.minQuestions + index));

function Step({ index, title, lead, children }: { index: number; title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-[3px] grid size-6 shrink-0 place-items-center rounded-full bg-ink text-[12.5px] font-semibold text-paper">{index}</span>
        <div>
          <h2 className="text-[18px] font-semibold leading-[1.4] text-ink">{title}</h2>
          {lead && <p className="mt-0.5 text-[14px] text-ink-2">{lead}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function SetupView() {
  const { t, f, locale } = usePrefs();
  const router = useRouter();
  const hydrated = useHydrated();
  const analysis = useSession((state) => state.analysis);
  const setup = useSession((state) => state.setup);
  const updateSetup = useSession((state) => state.updateSetup);
  const beginSession = useSession((state) => state.beginSession);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ClientErrorCode | null>(null);

  if (!hydrated) return <Shell><PageSkeleton /></Shell>;
  if (!analysis) {
    return (
      <Shell>
        <EmptyState icon={<FolderSearch className="size-5" />} title={t.setup.noRepo} body={t.setup.noRepoLead} action={t.setup.goHome} href="/" />
      </Shell>
    );
  }

  const selectedPart = analysis.parts.find((part) => part.id === setup.partId);
  const customReady = setup.partId === CUSTOM_PART && setup.custom.trim().length > 0;
  const ready = !!selectedPart || customReady;

  async function start() {
    if (!analysis || !ready || pending) return;
    setPending(true);
    setError(null);
    try {
      const part = selectedPart
        ? { title: selectedPart.title, summary: selectedPart.summary, files: selectedPart.files }
        : { description: setup.custom.trim() };
      const result = await api.start({ repo: analysis.repo, part, difficulty: setup.difficulty, count: setup.count, locale });
      beginSession({ locale, repo: analysis.repo, part: result.part, difficulty: setup.difficulty, interview: startInterview(result.plan) });
      router.push("/interview");
    } catch (caught) {
      setError(errorCodeOf(caught));
      setPending(false);
    }
  }

  return (
    <Shell>
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 pb-32 pt-4 sm:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)] lg:gap-14 lg:pb-20">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ProjectOverview analysis={analysis} />
        </div>

        {pending ? (
          <div className="lg:pt-10">
            <PlanningPanel count={setup.count} />
          </div>
        ) : (
          <div className="flex flex-col gap-10 lg:pt-10">
            <Step index={1} title={t.setup.partTitle} lead={t.setup.partLead}>
              <PartPicker
                parts={analysis.parts}
                value={setup.partId}
                onChange={(partId) => updateSetup({ partId })}
                custom={setup.custom}
                onCustomChange={(custom) => updateSetup({ custom })}
              />
            </Step>

            <Step index={2} title={t.setup.difficultyTitle}>
              <Segmented
                label={t.setup.difficultyTitle}
                value={setup.difficulty}
                onChange={(difficulty) => updateSetup({ difficulty })}
                options={DIFFICULTIES.map((difficulty) => ({
                  value: difficulty,
                  label: <DifficultyTag difficulty={difficulty} className="text-[14.5px] text-inherit" />,
                }))}
              />
              <p className="-mt-1 px-1 text-[14px] leading-[1.7] text-ink-2">{t.difficulty[setup.difficulty].desc}</p>
            </Step>

            <Step index={3} title={t.setup.countTitle}>
              <Segmented
                label={t.setup.countTitle}
                value={String(setup.count)}
                onChange={(count) => updateSetup({ count: Number(count) })}
                options={COUNTS.map((count) => ({ value: count, label: <span className="tabular">{count}</span> }))}
                className="max-w-sm"
              />
              <p className="-mt-1 px-1 text-[14px] leading-[1.7] text-ink-2">{t.setup.countNote}</p>
            </Step>

            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/90 px-5 py-4 backdrop-blur-md sm:px-8 lg:sticky lg:bottom-6 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:max-w-none lg:flex-row lg:items-center lg:justify-between lg:rounded-3xl lg:border lg:border-line lg:bg-surface lg:p-5 lg:pl-6 lg:shadow-card">
                <div className="hidden flex-col gap-0.5 text-[13.5px] text-ink-2 sm:flex">
                  <span>{t.setup.language}</span>
                  <span className="tabular text-ink-3">{f(t.common.minutes, { min: setup.count * 2, max: setup.count * 4 })}</span>
                </div>
                {error && (
                  <p role="alert" className="text-[14px] text-miss lg:hidden">
                    {t.errors[error]}
                  </p>
                )}
                <Button onClick={() => void start()} disabled={!ready || pending} className="h-12 rounded-xl px-6 text-[15px] font-medium hover:bg-brand-strong">
                  {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  {pending ? t.setup.starting : t.setup.start}
                  {!pending && <ArrowRight className="size-4" />}
                </Button>
              </div>
              {error && (
                <p role="alert" className="mt-3 hidden text-[14px] text-miss lg:block">
                  {t.errors[error]}
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      {children}
    </div>
  );
}
