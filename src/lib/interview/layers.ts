import { LIMITS } from "@/lib/config";
import { DIFFICULTIES, LAYERS, type Difficulty, type Layer } from "@/lib/domain";

/** Extra questions beyond five go to the layers where follow-through matters most. */
const EXTRA_SLOTS: Layer[] = ["code", "decision", "failure"];

/**
 * The layer of each main question, in interview order.
 * Five questions cover each layer once; six to eight add depth in the middle layers.
 */
export function layerPlan(count: number): Layer[] {
  const clamped = clampQuestionCount(count);
  const layers: Layer[] = [...LAYERS, ...EXTRA_SLOTS.slice(0, clamped - LAYERS.length)];
  return layers.sort((a, b) => LAYERS.indexOf(a) - LAYERS.indexOf(b));
}

export function clampQuestionCount(count: number): number {
  if (!Number.isFinite(count)) return LIMITS.defaultQuestions;
  return Math.min(LIMITS.maxQuestions, Math.max(LIMITS.minQuestions, Math.round(count)));
}

/** A follow-up may stay at the same difficulty or go one step harder, never easier, never past "tricky". */
export function followUpDifficulty(current: Difficulty, harder: boolean): Difficulty {
  if (!harder) return current;
  const index = DIFFICULTIES.indexOf(current);
  return DIFFICULTIES[Math.min(index + 1, DIFFICULTIES.length - 1)];
}
