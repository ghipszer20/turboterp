import { describe, expect, it } from "vitest";
import { earnedCredits, planSummaryLines } from "./plan-summary";

describe("planSummaryLines", () => {
  it("lists credits and requirement progress per program", () => {
    const lines = planSummaryLines({
      creditsEarned: 45,
      creditsPlanned: 120,
      programs: [{ name: "Computer Science, B.S.", satisfied: 7, total: 10 }],
    });
    expect(lines).toEqual(["Credits earned: 45", "Credits planned: 120", "Computer Science, B.S.: 7 of 10 requirements met, 3 left"]);
  });
  it("adds the in-progress count when some met rows still count a planned course", () => {
    const lines = planSummaryLines({ creditsEarned: 0, creditsPlanned: 0, programs: [{ name: "CS", satisfied: 5, total: 10, inProgress: 2 }] });
    expect(lines[2]).toBe("CS: 5 of 10 requirements met, 2 in progress, 3 left");
  });
  it("caps lines at 200 characters and 40 lines", () => {
    const programs = Array.from({ length: 60 }, () => ({ name: "x".repeat(300), satisfied: 0, total: 1 }));
    const lines = planSummaryLines({ creditsEarned: 0, creditsPlanned: 0, programs });
    expect(lines.length).toBeLessThanOrEqual(40);
    expect(lines.every((l) => l.length <= 200)).toBe(true);
  });
});

describe("earnedCredits", () => {
  it("counts completed courses that earn credit, not F/W or planned ones", () => {
    const terms = [
      { courses: [
        { id: "A", status: "completed" as const, grade: "A" },
        { id: "F", status: "completed" as const, grade: "F" },
        { id: "W", status: "completed" as const, grade: " w " },
        { id: "AP", status: "completed" as const },
        { id: "P", status: "planned" as const, grade: "B" },
        { id: "N" },
      ] },
    ];
    expect(earnedCredits(terms, () => 3)).toBe(6);
  });
});
