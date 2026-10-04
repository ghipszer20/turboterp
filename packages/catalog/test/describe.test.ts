// describeRequirement: a requirement in the plain language the owner reads in the review tool.

import { describe, expect, it } from "vitest";
import type { Program, Requirement } from "@turboterp/audit";
import { cmscMajor } from "@turboterp/audit/programs/cmsc-major-2026-27.ts";
import { genEd, university } from "@turboterp/audit/programs/gen-ed-2026-27.ts";
import { mathMajorTraditional } from "@turboterp/audit/programs/math-major-2026-27.ts";
import { mathMajorApplied } from "@turboterp/audit/programs/math-major-applied-2026-27.ts";
import { describeFilter, describeRequirement } from "../src/describe.ts";

const text = (r: Requirement) => describeRequirement(r).text;

describe("describeRequirement", () => {
  it("names a single required course", () => {
    expect(text({ kind: "course", id: "cmsc351", name: "Algorithms", options: ["CMSC351"] })).toBe("CMSC351");
  });

  it("lists a course's alternatives as 'One of'", () => {
    expect(text({ kind: "course", id: "cmsc131", name: "OOP I", options: ["CMSC131", "CMSC133"] })).toBe("One of: CMSC131, CMSC133");
  });

  it("says how many courses to choose from a list", () => {
    const r: Requirement = { kind: "choose", id: "x", name: "x", count: 2, from: { courses: ["CMSC411", "CMSC412", "CMSC414"] } };
    expect(text(r)).toBe("Choose 2 of: CMSC411, CMSC412, CMSC414");
  });

  it("adds each alternatives group as 'at most one of'", () => {
    const r: Requirement = {
      kind: "choose",
      id: "x",
      name: "x",
      count: 2,
      from: { courses: ["CMSC426", "CMSC460", "CMSC466", "MATH401", "MATH402"] },
      alternatives: [
        ["CMSC460", "CMSC466"],
        ["MATH401", "MATH402"],
      ],
    };
    expect(text(r)).toBe("Choose 2 of: CMSC426, CMSC460, CMSC466, MATH401, MATH402, at most one of CMSC460 / CMSC466, at most one of MATH401 / MATH402");
  });

  it("reads a choice of one as 'One of'", () => {
    expect(text({ kind: "choose", id: "x", name: "x", count: 1, from: { courses: ["BSCI170", "BSCI171"] } })).toBe("One of: BSCI170, BSCI171");
  });

  it("says how many credits to take from a list", () => {
    expect(text({ kind: "choose", id: "x", name: "x", credits: 12, from: { courses: ["ARTT300", "ARTT301"] } })).toBe("12 credits from: ARTT300, ARTT301");
  });

  it("describes a choice over a filter by count and by credits", () => {
    expect(text({ kind: "choose", id: "x", name: "x", count: 1, from: { departments: ["STAT"], minNumber: 400, maxNumber: 499 } })).toBe(
      "1 course from STAT 400–499",
    );
    expect(text({ kind: "choose", id: "x", name: "x", count: 3, from: { departments: ["STAT"], minNumber: 400, maxNumber: 499 } })).toBe(
      "3 courses from STAT 400–499",
    );
    expect(
      text({ kind: "choose", id: "x", name: "x", credits: 6, from: { departments: ["CMSC"], minNumber: 300, maxNumber: 499, exclude: ["CMSC330", "CMSC351"] } }),
    ).toBe("6 credits from CMSC 300–499, except CMSC330, CMSC351");
  });

  it("reads a Gen Ed choice as courses 'with' the code", () => {
    expect(text({ kind: "choose", id: "x", name: "x", count: 2, from: { genEd: ["DSHS"] } })).toBe("2 courses with Gen Ed DSHS");
    expect(text({ kind: "choose", id: "x", name: "x", count: 1, from: { genEd: ["FSAW"] } })).toBe("1 course with Gen Ed FSAW");
  });

  it("lists a distribution's areas as details", () => {
    const r: Requirement = {
      kind: "distribution",
      id: "areas",
      name: "x",
      count: 5,
      minAreas: 3,
      maxPerArea: 3,
      areas: [
        { name: "Area 1: Systems", courses: ["CMSC411", "CMSC412"] },
        { name: "Area 5: Numerical Analysis", courses: ["CMSC460", "CMSC466"] },
      ],
    };
    expect(describeRequirement(r)).toEqual({
      text: "5 courses from at least 3 areas, at most 3 per area",
      details: ["Area 1: Systems: CMSC411, CMSC412", "Area 5: Numerical Analysis: CMSC460, CMSC466"],
      notes: [],
    });
  });

  it("doesn't mention a per-area cap that is the whole count", () => {
    const r: Requirement = { kind: "distribution", id: "a", name: "x", count: 2, minAreas: 2, maxPerArea: 2, areas: [{ name: "A", courses: ["X"] }] };
    expect(text(r)).toBe("2 courses from at least 2 areas");
  });

  it("describes a concentration", () => {
    const r: Requirement = { kind: "concentration", id: "c", name: "x", credits: 12, minNumber: 300, maxNumber: 499, excludeDepartments: ["CMSC"] };
    expect(text(r)).toBe("12 credits of 300–499 courses, all from one department (not CMSC)");
  });

  it("reads a single set as 'All of', with filter members", () => {
    const r: Requirement = {
      kind: "sets",
      id: "s",
      name: "x",
      options: [["AOSC200", "AOSC201", { count: 2, from: { departments: ["AOSC"], minNumber: 400, maxNumber: 499 } }]],
    };
    expect(describeRequirement(r)).toEqual({ text: "All of: AOSC200, AOSC201, 2 courses from AOSC 400–499", details: [], notes: [] });
  });

  it("lists several sets as details, one or N of them", () => {
    const options = [
      ["MATH410", "MATH411"],
      ["MATH403", "MATH404"],
    ];
    expect(describeRequirement({ kind: "sets", id: "s", name: "x", options })).toEqual({
      text: "One of these sets:",
      details: ["MATH410 + MATH411", "MATH403 + MATH404"],
      notes: [],
    });
    expect(text({ kind: "sets", id: "s", name: "x", options, count: 2 })).toBe("2 of these sets:");
  });

  it("notes a minimum grade and an overlay", () => {
    const r: Requirement = { kind: "course", id: "engl101", name: "x", options: ["ENGL101"], minGrade: "C-", overlay: true };
    expect(describeRequirement(r).notes).toEqual(["C- or better", "Overlay: its courses also count toward other requirements"]);
  });

  it.each<[string, Program]>([
    ["CS", cmscMajor],
    ["Math Traditional", mathMajorTraditional],
    ["Math Applied", mathMajorApplied],
    ["Gen Ed", genEd],
    ["University", university],
  ])("describes every requirement of the hand-encoded %s program", (_, program) => {
    for (const r of program.requirements) {
      const d = describeRequirement(r);
      expect(d.text, r.id).toMatch(/\S/);
      expect([d.text, ...d.details].join(" "), r.id).not.toMatch(/undefined|NaN|\[object/);
    }
  });
});

describe("describeFilter", () => {
  it("joins several departments and open-ended number bounds", () => {
    expect(describeFilter({ departments: ["MATH", "AMSC", "STAT"], minNumber: 240 })).toBe("MATH/AMSC/STAT 240+");
    expect(describeFilter({ departments: ["ENGL"], maxNumber: 199 })).toBe("ENGL up to 199");
  });

  it("describes Gen Ed, any-course and department-free filters", () => {
    expect(describeFilter({ genEd: ["DSHU", "DSHS"] })).toBe("courses with Gen Ed DSHU or DSHS");
    expect(describeFilter({ anyCourse: true })).toBe("any course");
    expect(describeFilter({ minNumber: 300, maxNumber: 499 })).toBe("any department 300–499");
  });

  it("combines listed courses with a pattern", () => {
    expect(describeFilter({ courses: ["MATH246"], departments: ["MATH"], minNumber: 400, maxNumber: 499 })).toBe("MATH246 or MATH 400–499");
  });
});
