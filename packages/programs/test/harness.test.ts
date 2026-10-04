import type { Program } from "@turboterp/audit";
import { describe, expect, it } from "vitest";
import { planCourses, validateSamplePlan, type SamplePlan } from "../src/harness.ts";

const program: Program = {
  id: "toy",
  name: "Toy Major",
  requirements: [
    { kind: "course", id: "intro", name: "Intro", options: ["TOYS101"] },
    { kind: "choose", id: "upper", name: "Two 400-level TOYS", count: 2, from: { departments: ["TOYS"], minNumber: 400, maxNumber: 499 } },
  ],
};

const plan = (courses: string[]): SamplePlan => ({
  programId: "toy",
  source: "https://example.edu/toy-plan",
  fetched: "2026-09-27",
  official: true,
  credits: { TOYS101: 4 },
  terms: [{ term: "Fall 1", courses }],
});

describe("planCourses", () => {
  it("turns every term's courses into planned courses, 3 credits unless listed", () => {
    expect(planCourses(plan(["TOYS101", "TOYS401"]))).toEqual([
      { id: "TOYS101", credits: 4, status: "planned" },
      { id: "TOYS401", credits: 3, status: "planned" },
    ]);
  });
});

describe("validateSamplePlan", () => {
  it("passes a complete plan and breaks each requirement it can by dropping or replacing its courses", async () => {
    const v = await validateSamplePlan(program, plan(["TOYS101", "TOYS401", "TOYS402", "ENGL101"]));
    expect(v.unsatisfied).toEqual([]);
    expect(v.mutants.map((m) => `${m.kind} ${m.requirement} -${m.removed.join(",")} ${m.broke}`)).toEqual([
      "drop intro -TOYS101 true",
      "replace intro -TOYS101 true",
      "drop upper -TOYS401,TOYS402 true",
      "replace upper -TOYS401,TOYS402 true",
    ]);
    expect(v.mutants.every((m) => !m.fillerCounted)).toBe(true);
  });

  it("keeps removing courses while spares still satisfy the requirement", async () => {
    const v = await validateSamplePlan(program, plan(["TOYS101", "TOYS401", "TOYS402", "TOYS403", "TOYS404"]));
    const drop = v.mutants.find((m) => m.kind === "drop" && m.requirement === "upper")!;
    expect(drop.broke).toBe(true);
    expect(drop.removed).toHaveLength(4);
  });

  it("reports the requirements an incomplete sample plan leaves unsatisfied", async () => {
    const v = await validateSamplePlan(program, plan(["TOYS401", "TOYS402"]));
    expect(v.unsatisfied).toEqual(["intro"]);
  });

  it("flags a requirement that stays satisfied with its courses gone", async () => {
    const vacuous: Program = { ...program, requirements: [{ kind: "choose", id: "none", name: "Zero courses", count: 0, from: { departments: ["TOYS"] } }] };
    const v = await validateSamplePlan(vacuous, plan(["TOYS101"]));
    expect(v.mutants.every((m) => m.broke === false)).toBe(true);
  });

  it("treats every open slot as confirmed and makes no mutants for it", async () => {
    const withSlot: Program = {
      ...program,
      requirements: [...program.requirements, { kind: "openSlot", id: "approved", name: "Approved courses", credits: 12 }],
    };
    const v = await validateSamplePlan(withSlot, plan(["TOYS101", "TOYS401", "TOYS402"]));
    expect(v.unsatisfied).toEqual([]);
    expect(v.mutants.some((m) => m.requirement === "approved")).toBe(false);
    expect(v.mutants.every((m) => m.broke)).toBe(true);
  });
});

describe("spread mutant (distribution requirements)", () => {
  const dist: Program = {
    id: "dist",
    name: "Dist",
    requirements: [
      {
        kind: "distribution",
        id: "spread",
        name: "Three courses from at least two areas, at most two per area",
        count: 3,
        minAreas: 2,
        maxPerArea: 2,
        areas: [
          { name: "A", courses: ["AAAA101", "AAAA102", "AAAA103"] },
          { name: "B", from: { departments: ["BBBB"] } },
        ],
      },
    ],
  };
  const distPlan: SamplePlan = { programId: "dist", source: "https://example.edu/p", fetched: "2026-09-28", official: true, terms: [{ term: "Fall 1", courses: ["AAAA101", "AAAA102", "BBBB101"] }] };

  it("piles the plan's courses into fewer areas than required, and the requirement breaks", async () => {
    const v = await validateSamplePlan(dist, distPlan);
    expect(v.unsatisfied).toEqual([]);
    const spread = v.mutants.find((m) => m.kind === "spread")!;
    expect(spread).toMatchObject({ requirement: "spread", removed: ["BBBB101"], broke: true, fillerCounted: false });
  });

  it("makes no spread mutant for other requirement kinds", async () => {
    const v = await validateSamplePlan(program, plan(["TOYS101", "TOYS401", "TOYS402"]));
    expect(v.mutants.some((m) => m.kind === "spread")).toBe(false);
  });
});
