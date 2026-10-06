// planCourses leaves graduate-only credit (grad-courses.ts) out of the degree-audit's course list
// entirely, so it never counts toward a program requirement or a credit total (dual degree, BS/MS
// double-count, degrees.ts). A "bs-ms"-tagged or untagged (default "undergrad credit") course
// counts as usual.

import { describe, expect, it } from "vitest";
import type { PlanCatalog } from "../src/catalog.ts";
import type { Plan } from "../src/check.ts";
import { planCourses } from "../src/notices.ts";

const EMPTY_CATALOG: PlanCatalog = new Map();

function plan(courses: Plan["terms"][number]["courses"]): Plan {
  return { terms: [{ name: "Fall 2026", courses }] };
}

describe("planCourses and grad credit tags", () => {
  it("leaves a graduate-only tagged course out of the audit's course list", () => {
    const courses = planCourses(plan([{ id: "CMSC616", credits: 3, gradTag: "graduate-only" }]), EMPTY_CATALOG);
    expect(courses).toEqual([]);
  });

  it("counts a bs-ms tagged course normally", () => {
    const courses = planCourses(plan([{ id: "CMSC616", credits: 3, gradTag: "bs-ms" }]), EMPTY_CATALOG);
    expect(courses).toEqual([{ id: "CMSC616", credits: 3, status: "planned", genEd: [] }]);
  });

  it("counts an untagged grad course normally (default: undergrad credit)", () => {
    const courses = planCourses(plan([{ id: "CMSC616", credits: 3 }]), EMPTY_CATALOG);
    expect(courses).toEqual([{ id: "CMSC616", credits: 3, status: "planned", genEd: [] }]);
  });

  it("mixes graduate-only with other courses, excluding only the tagged one", () => {
    const courses = planCourses(
      plan([
        { id: "CMSC616", credits: 3, gradTag: "graduate-only" },
        { id: "CMSC131", credits: 4 },
      ]),
      EMPTY_CATALOG,
    );
    expect(courses.map((c) => c.id)).toEqual(["CMSC131"]);
  });
});

describe("planCourses and exam credit", () => {
  const withPrior = (priorCredit: NonNullable<Plan["priorCredit"]>): Plan => ({ priorCredit, terms: [] });

  it("flags AP and IB prior credit as exam credit", () => {
    const courses = planCourses(
      withPrior([
        { id: "MATH140", credits: 4, source: "AP Calculus BC (5)" },
        { id: "DSHU:IB History HL", credits: 3, source: "IB History HL (6)" },
      ]),
      EMPTY_CATALOG,
    );
    expect(courses.map((c) => c.exam)).toEqual([true, true]);
  });

  it("doesn't flag dual enrollment, other prior credit or planned courses", () => {
    const courses = planCourses(
      {
        priorCredit: [
          { id: "MATH141", credits: 4, source: "PGCC MATH 141" },
          { id: "ENGL101", credits: 3 },
          { id: "HIST100", credits: 3, source: "Apple Valley High (AP-style)" },
        ],
        terms: [{ name: "Fall 2026", courses: [{ id: "CMSC131", credits: 4 }] }],
      },
      EMPTY_CATALOG,
    );
    for (const c of courses) expect("exam" in c).toBe(false);
  });
});
