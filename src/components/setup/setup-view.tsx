"use client";

import { ArrowRight, FolderSearch, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePrefs } from "@/components/providers";
import { EmptyState, PageSkeleton } from "@/components/shared/empty-state";
import { Segmented } from "@/components/shared/segmented";
import { SiteHeader } from "@/components/shared/site-header";
import { DifficultyTag } from "@/components/shared/tags";
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
    <section className="relative flex flex-col gap-4 pl-11">
      <div className="flex items-start gap-3">
        <span className="tabular absolute left-0 top-[3px] z-10 grid size-6 place-items-center border border-pen bg-paper font-serif text-[13px] text-pen">{index}</span>
        <div>
          <h2 className="font-serif text-[20px] font-semibold leading-[1.4] text-ink">{title}</h2>
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
        <EmptyState icon={<FolderSearch className="size-5" strokeWidth={1.5} />} title={t.setup.noRepo} body={t.setup.noRepoLead} action={t.setup.goHome} href="/" />
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
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 pb-36 pt-4 sm:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)] lg:gap-14 lg:pb-10">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ProjectOverview analysis={analysis} />
          <FilesToRead files={selectedPart?.files} custom={setup.partId === CUSTOM_PART} />
        </div>

        {pending ? (
          <div className="lg:pt-10">
            <PlanningPanel count={setup.count} />
          </div>
        ) : (
          <div className="relative flex flex-col gap-10 lg:pt-10">
            <span aria-hidden className="absolute bottom-24 left-[11.5px] top-4 w-px bg-pen lg:top-14" />
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
              <p className="text-[14px] leading-[1.7] text-ink-2">{t.difficulty[setup.difficulty].desc}</p>
            </Step>

            <Step index={3} title={t.setup.countTitle}>
              <Segmented
                label={t.setup.countTitle}
                value={String(setup.count)}
                onChange={(count) => updateSetup({ count: Number(count) })}
                options={COUNTS.map((count) => ({ value: count, label: <span className="tabular">{count}</span> }))}
                className="max-w-sm"
              />
              <p className="text-[14px] leading-[1.7] text-ink-2">{t.setup.countNote}</p>
            </Step>

            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-rule-strong bg-paper px-5 py-3 sm:px-8 lg:sticky lg:inset-x-auto lg:bottom-0 lg:-mx-0 lg:px-0">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 lg:max-w-none">
                <div className="flex min-w-0 flex-col gap-0.5 text-[13px] leading-[1.5] text-ink-2">
                  <span>{t.setup.language}</span>
                  <span className="tabular text-ink-3">{f(t.common.minutes, { min: setup.count * 2, max: setup.count * 4 })}</span>
                </div>
                <button
                  type="button"
                  onClick={() => void start()}
                  disabled={!ready || pending}
                  className="inline-flex h-11 shrink-0 items-center gap-2 bg-ink px-6 text-[15px] font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-35"
                >
                  {pending ? <LoaderCircle className="size-4 animate-spin" strokeWidth={1.5} /> : null}
                  {pending ? t.setup.starting : t.setup.start}
                  {!pending && <ArrowRight className="size-4" strokeWidth={1.5} />}
                </button>
              </div>
              {error && (
                <p role="alert" className="mx-auto mt-2 max-w-6xl text-[14px] text-pen lg:max-w-none">
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

/** The Part's files, the pages this session will read, under the title page. */
function FilesToRead({ files, custom }: { files?: string[]; custom: boolean }) {
  const { t, f } = usePrefs();
  if (!files?.length && !custom) return null;
  return (
    <section className="mt-6 hidden lg:block">
      <h2 className="border-b border-rule pb-2 text-[13px] font-medium text-ink-2">
        {custom ? t.setup.filesCustom : f(t.setup.filesToRead, { count: files!.length })}
      </h2>
      {files && !custom && (
        <ol className="max-h-[40vh] overflow-y-auto overscroll-contain">
          {files.map((path, index) => (
            <li key={path} className="grid grid-cols-[2rem_minmax(0,1fr)] border-b border-rule py-1.5 text-[12.5px]">
              <span className="tabular text-ink-3">{index + 1}</span>
              <span className="truncate font-mono text-ink" title={path}>
                {path}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
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
