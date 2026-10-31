"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { usePrefs } from "@/components/providers";
import type { LayerScore } from "@/lib/interview/scoring";
import { cn } from "@/lib/utils";

/** Square vertex dot: the world has no round marks. */
function SquareDot({ cx, cy }: { cx?: number; cy?: number }) {
  if (cx === undefined || cy === undefined) return <g />;
  return <rect x={cx - 3.5} y={cy - 3.5} width={7} height={7} fill="var(--pen)" stroke="var(--surface)" strokeWidth={1} />;
}

/**
 * One series on five axes (1-5). The radar is the picture; LayerScoreList beside it is the
 * exact read and the accessible equivalent, so no value lives only in the chart.
 */
export function LayerRadar({ scores, className }: { scores: LayerScore[]; className?: string }) {
  const { t } = usePrefs();
  const data = scores.map((item) => ({ name: t.layer[item.layer].short, full: t.layer[item.layer].name, score: item.score ?? 0, asked: item.score !== null }));

  return (
    <div className={cn("aspect-square w-full max-w-[320px]", className)} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <PolarGrid stroke="var(--rule-strong)" strokeWidth={1} gridType="polygon" />
          <PolarAngleAxis dataKey="name" tick={{ fill: "var(--ink-2)", fontSize: 12.5 }} />
          <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={false} axisLine={false} />
          <Radar
            dataKey="score"
            stroke="var(--pen)"
            strokeWidth={1.5}
            fill="var(--pen)"
            fillOpacity={0.08}
            dot={SquareDot}
            activeDot={SquareDot}
            // No entrance animation: a resize (or printing) would replay it and capture the first frame.
            isAnimationActive={false}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              const item = active ? (payload?.[0]?.payload as (typeof data)[number] | undefined) : undefined;
              if (!item) return null;
              return (
                <div className="border border-rule-strong bg-surface px-3 py-2 text-[13px]">
                  <div className="font-medium text-ink">{item.full}</div>
                  <div className="tabular text-ink-2">{item.asked ? `${item.score} / 5` : t.report.notAsked}</div>
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Five square detents, one per point; a half point fills half of its square. */
function Detents({ score }: { score: number | null }) {
  return (
    <span className="flex gap-[3px]" aria-hidden>
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.min(1, Math.max(0, (score ?? 0) - index));
        return (
          <span key={index} className="relative size-[11px] border border-ink">
            {fill > 0 && <span className="absolute inset-y-0 left-0 bg-ink" style={{ width: `${Math.round(fill * 2) * 50}%` }} />}
          </span>
        );
      })}
    </span>
  );
}

export function LayerScoreList({ scores, className }: { scores: LayerScore[]; className?: string }) {
  const { t } = usePrefs();
  return (
    <ul className={cn("flex flex-col", className)}>
      {scores.map((item) => (
        <li key={item.layer} className="grid grid-cols-[minmax(0,1fr)_auto_4.5rem] items-center gap-x-3 border-b border-rule py-2.5 first:border-t">
          <span className="text-[14px] text-ink">{t.layer[item.layer].name}</span>
          <Detents score={item.score} />
          <span className="tabular text-right text-[14px] text-ink-2">{item.score === null ? t.report.notAsked : `${item.score} / 5`}</span>
        </li>
      ))}
    </ul>
  );
}
