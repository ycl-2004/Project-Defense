import { describe, expect, it } from "vitest";
import { clampQuestionCount, followUpDifficulty, layerPlan } from "@/lib/interview/layers";

describe("layerPlan", () => {
  it("covers every layer once with five questions", () => {
    expect(layerPlan(5)).toEqual(["explain", "code", "decision", "failure", "apply"]);
  });

  it("adds depth in the middle layers and keeps the climbing order", () => {
    expect(layerPlan(6)).toEqual(["explain", "code", "code", "decision", "failure", "apply"]);
    expect(layerPlan(8)).toEqual(["explain", "code", "code", "decision", "decision", "failure", "failure", "apply"]);
  });

  it("clamps the count to 5-8", () => {
    expect(layerPlan(2)).toHaveLength(5);
    expect(layerPlan(20)).toHaveLength(8);
    expect(clampQuestionCount(Number.NaN)).toBe(6);
  });
});

it("raises follow-up difficulty by at most one step", () => {
  expect(followUpDifficulty("easy", true)).toBe("hard");
  expect(followUpDifficulty("hard", true)).toBe("tricky");
  expect(followUpDifficulty("tricky", true)).toBe("tricky");
  expect(followUpDifficulty("hard", false)).toBe("hard");
});
