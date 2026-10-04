import { distributionFromCounts, type CourseGrades } from "@turboterp/ratings";
import { describe, expect, it } from "vitest";
import { planDifficulty, statsFromDistribution } from "../advisor/difficulty";
import type { AdvisorPlan } from "../advisor/plan-state";

const zero = { "A+": 0, A: 0, "A-": 0, "B+": 0, B: 0, "B-": 0, "C+": 0, C: 0, "C-": 0, "D+": 0, D: 0, "D-": 0, F: 0, W: 0, Other: 0 };
const overall = (counts: Partial<typeof zero>) => distributionFromCounts({ ...zero, ...counts }, []);
const grades = (counts: Partial<typeof zero>): CourseGrades => ({ overall: overall(counts) }) as CourseGrades;

describe("statsFromDistribution", () => {
  it("takes the average GPA and the W and F shares of all students", () => {
    const s = statsFromDistribution(overall({ A: 60, B: 20, F: 10, W: 10 }));
    expect(s?.averageGpa).toBeCloseTo((60 * 4 + 20 * 3) / 90, 5);
    expect(s?.wRate).toBeCloseTo(0.1, 5);
    expect(s?.fRate).toBeCloseTo(0.1, 5);
  });
  it("is null with no students or no data", () => {
    expect(statsFromDistribution(overall({}))).toBeNull();
    expect(statsFromDistribution(null)).toBeNull();
  });
});

const plan = (terms: AdvisorPlan["terms"]) => ({ terms }) as AdvisorPlan;
const loader = (id: string) =>
  Promise.resolve(id.startsWith("MATH") ? grades({ B: 50, C: 50 }) : id.startsWith("CMSC") ? grades({ B: 50, C: 50, W: 20 }) : null);
const creditsOf = (_id: string, own?: number) => own ?? 3;

describe("planDifficulty", () => {
  const terms: AdvisorPlan["terms"] = [
    { name: "Fall 2025", courses: [{ id: "MATH140", status: "completed", grade: "A" }, { id: "MATH141", status: "completed", grade: "A" }] },
    { name: "Spring 2026", courses: [{ id: "CMSC351" }, { id: "MATH241" }, { id: "ENGL101" }] },
  ];
  it("skips fully completed terms and scores the rest", async () => {
    const r = await planDifficulty(plan(terms), creditsOf, loader);
    expect(r.has("Fall 2025")).toBe(false);
    const t = r.get("Spring 2026")!;
    expect(t.score).toBeGreaterThanOrEqual(1);
    expect(t.personalized).toBe(true);
  });
  it("says so and asks for a transcript when there is no graded history", async () => {
    const r = await planDifficulty(plan([terms[1]!]), creditsOf, loader);
    const t = r.get("Spring 2026")!;
    expect(t.personalized).toBe(false);
    expect(t.sentence).toMatch(/Import your transcript for a personal estimate\.$/);
  });
  it("ignores completed courses without a letter grade or PlanetTerp data", async () => {
    const p = plan([
      { name: "Fall 2025", courses: [{ id: "MATH140", status: "completed", grade: "P" }, { id: "ART100", status: "completed", grade: "A" }] },
      terms[1]!,
    ]);
    expect((await planDifficulty(p, creditsOf, loader)).get("Spring 2026")!.personalized).toBe(false);
  });
});
