"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { usePrefs } from "@/components/providers";
import type { LayerScore } from "@/lib/interview/scoring";
import { cn } from "@/lib/utils";

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
          <PolarGrid stroke="var(--line)" gridType="polygon" />
          <PolarAngleAxis dataKey="name" tick={{ fill: "var(--ink-2)", fontSize: 12.5, fontWeight: 500 }} />
          <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={false} axisLine={false} />
          <Radar
            dataKey="score"
            stroke="var(--brand)"
            strokeWidth={2}
            fill="var(--brand)"
            fillOpacity={0.14}
            dot={{ r: 4, fill: "var(--brand)", stroke: "var(--surface)", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "var(--brand)", stroke: "var(--surface)", strokeWidth: 2 }}
            // No entrance animation: a resize (or printing) would replay it and capture the first frame.
            isAnimationActive={false}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              const item = active ? (payload?.[0]?.payload as (typeof data)[number] | undefined) : undefined;
              if (!item) return null;
              return (
                <div className="rounded-xl border border-line bg-surface px-3 py-2 text-[13px] shadow-card">
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

export function LayerScoreList({ scores, className }: { scores: LayerScore[]; className?: string }) {
  const { t } = usePrefs();
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {scores.map((item) => (
        <li key={item.layer} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
          <span className="text-[14px] font-medium text-ink">{t.layer[item.layer].name}</span>
          <span className="tabular text-right text-[14px] text-ink-2">
            {item.score === null ? t.report.notAsked : `${item.score} / 5`}
          </span>
          <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-sunken">
            <span
              className="block h-full rounded-full bg-brand transition-[width] duration-700 ease-out"
              style={{ width: `${((item.score ?? 0) / 5) * 100}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}
