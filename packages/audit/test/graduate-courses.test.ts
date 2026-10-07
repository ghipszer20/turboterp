// Grad courses as an undergrad (owner, 2026-10-07; docs/project/rulings.md): with permission, a
// graduate course (600–897, not 799) counts toward an undergrad requirement whose number range
// reaches the top of the 400 level ("400-level", "300–400 level", "upper level"). Narrower bands
// ("300-level", 400–469) don't take grad courses, and a filter can opt out when its program's
// source reserves grad courses for graduate students.

import { describe, expect, it } from "vitest";
import { auditProgram, isGraduateCourseNumber, matchesFilter, type Program, type StudentCourse } from "../src/audit.ts";

const course = (id: string) => ({ id });
const took = (...ids: string[]): StudentCourse[] => ids.map((id) => ({ id, credits: 3, status: "completed" }));

describe("isGraduateCourseNumber", () => {
  it("is 600–897, except 799", () => {
    expect([499, 500, 599, 600, 610, 798, 799, 800, 897, 898, 899].filter(isGraduateCourseNumber)).toEqual([
      600, 610, 798, 800, 897,
    ]);
  });
});

describe("matchesFilter with graduate courses", () => {
  const level400 = { departments: ["MATH", "AMSC", "STAT"], minNumber: 400, maxNumber: 499 };

  it("counts a 600-level course toward a 400-level range", () => {
    expect(matchesFilter(level400, course("STAT600"))).toBe(true);
    expect(matchesFilter(level400, course("STAT610"))).toBe(true);
    expect(matchesFilter(level400, course("MATH660H"))).toBe(true);
  });

  it("counts a grad course toward an upper-level (300–499) range", () => {
    expect(matchesFilter({ departments: ["ENGL"], minNumber: 300, maxNumber: 499 }, course("ENGL611"))).toBe(true);
  });

  it("doesn't count 500-level courses, thesis research (799) or 898/899", () => {
    for (const id of ["STAT500", "STAT599", "STAT799", "STAT898", "STAT899"]) {
      expect(`${id}: ${matchesFilter(level400, course(id))}`).toBe(`${id}: false`);
    }
  });

  it("doesn't count a grad course toward a narrower band", () => {
    expect(matchesFilter({ departments: ["MATH"], minNumber: 300, maxNumber: 399 }, course("MATH600"))).toBe(false);
    expect(matchesFilter({ departments: ["MATH"], minNumber: 460, maxNumber: 469 }, course("MATH660"))).toBe(false);
  });

  it("still applies the department and exclude list", () => {
    expect(matchesFilter(level400, course("CMSC600"))).toBe(false);
    expect(matchesFilter({ ...level400, exclude: ["STAT600"] }, course("STAT600"))).toBe(false);
  });

  it("doesn't count a grad course when the filter opts out", () => {
    expect(matchesFilter({ ...level400, noGraduateCourses: true }, course("STAT600"))).toBe(false);
    expect(matchesFilter({ ...level400, noGraduateCourses: true }, course("STAT410"))).toBe(true);
  });
});

describe("concentration with graduate courses", () => {
  const program: Program = {
    id: "cs",
    name: "CS",
    requirements: [
      { kind: "concentration", id: "conc", name: "Upper-level concentration", credits: 12, minNumber: 300, maxNumber: 499, excludeDepartments: ["CMSC"] },
    ],
  };

  it("counts grad courses in the one department", async () => {
    const r = await auditProgram(program, took("MATH401", "MATH403", "MATH630", "MATH631"));
    expect(r.requirements[0]).toMatchObject({ status: "satisfied" });
  });
});

describe("explicit graduate ranges", () => {
  it("still match grad courses (e.g. Math honors' 600-level substitutes)", () => {
    expect(matchesFilter({ departments: ["MATH"], minNumber: 600, maxNumber: 999 }, course("MATH630"))).toBe(true);
  });
});
