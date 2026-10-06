import { describe, expect, it } from "vitest";
import { planSummaryLines } from "./plan-summary";

describe("planSummaryLines", () => {
  it("lists credits and requirement progress per program", () => {
    const lines = planSummaryLines({
      creditsEarned: 45,
      creditsPlanned: 120,
      programs: [{ name: "Computer Science, B.S.", satisfied: 7, total: 10 }],
    });
    expect(lines).toEqual(["Credits earned: 45", "Credits planned: 120", "Computer Science, B.S.: 7 of 10 requirements met, 3 left"]);
  });
  it("caps lines at 200 characters and 40 lines", () => {
    const programs = Array.from({ length: 60 }, () => ({ name: "x".repeat(300), satisfied: 0, total: 1 }));
    const lines = planSummaryLines({ creditsEarned: 0, creditsPlanned: 0, programs });
    expect(lines.length).toBeLessThanOrEqual(40);
    expect(lines.every((l) => l.length <= 200)).toBe(true);
  });
});
