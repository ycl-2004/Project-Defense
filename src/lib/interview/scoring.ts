import { LAYERS, type Layer, type PlannedQuestion, type Rating, type Report } from "@/lib/domain";

/**
 * How a per-question rating maps onto the 1-5 radar scale. The model only rates questions;
 * the radar is derived here so the same answers always draw the same chart.
 */
export const RATING_SCORE: Record<Rating, number> = {
  clear: 5,
  partial: 3,
  misconception: 2,
  unanswered: 1,
};

export type LayerScore = { layer: Layer; score: number | null; questions: number };

/** Average rating score per layer, rounded to halves; `null` when the layer was not asked. */
export function layerScores(plan: PlannedQuestion[], report: Pick<Report, "questions">): LayerScore[] {
  const ratingById = new Map(report.questions.map((question) => [question.id, question.rating]));
  return LAYERS.map((layer) => {
    const scores = plan
      .filter((question) => question.layer === layer)
      .map((question) => RATING_SCORE[ratingById.get(question.id) ?? "unanswered"]);
    if (scores.length === 0) return { layer, score: null, questions: 0 };
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return { layer, score: Math.round(average * 2) / 2, questions: scores.length };
  });
}

export function ratingCounts(report: Pick<Report, "questions">): Record<Rating, number> {
  const counts: Record<Rating, number> = { clear: 0, partial: 0, misconception: 0, unanswered: 0 };
  for (const question of report.questions) counts[question.rating] += 1;
  return counts;
}
