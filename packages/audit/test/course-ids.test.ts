// programCourseIds: every literal course id a Program's requirements mention, used by
// @turboterp/programs to build a lazy-safe per-major course set for the double-major notice
// pre-filter (apps/web/lib/advisor/programs.ts) without loading every Program up front.

import { describe, expect, it } from "vitest";
import { programCourseIds, type Program } from "../src/audit.ts";

describe("programCourseIds", () => {
  it("collects a 'course' requirement's options", () => {
    const program: Program = {
      id: "p",
      name: "Test",
      requirements: [{ kind: "course", id: "calc2", name: "Calculus II", options: ["MATH141", "MATH140"] }],
    };
    expect(programCourseIds(program)).toEqual(["MATH141", "MATH140"]);
  });

  it("collects a 'choose' requirement's filter courses and alternatives, but not its department/number filter", () => {
    const program: Program = {
      id: "p",
      name: "Test",
      requirements: [
        {
          kind: "choose",
          id: "elective",
          name: "Elective",
          count: 2,
          from: { courses: ["CMSC420"], departments: ["CMSC"], minNumber: 400, maxNumber: 499 },
          alternatives: [["CMSC426", "CMSC460"]],
        },
      ],
    };
    expect(programCourseIds(program)).toEqual(["CMSC420", "CMSC426", "CMSC460"]);
  });

  it("collects a 'distribution' requirement's area courses", () => {
    const program: Program = {
      id: "p",
      name: "Test",
      requirements: [
        {
          kind: "distribution",
          id: "dist",
          name: "Distribution",
          count: 2,
          minAreas: 2,
          maxPerArea: 1,
          areas: [
            { name: "Area 1", courses: ["CMSC411", "CMSC412"] },
            { name: "Area 2", courses: ["CMSC420"] },
          ],
        },
      ],
    };
    expect(programCourseIds(program)).toEqual(["CMSC411", "CMSC412", "CMSC420"]);
  });

  it("collects a 'sets' requirement's literal members and filter courses, dropping bare filters", () => {
    const program: Program = {
      id: "p",
      name: "Test",
      requirements: [
        {
          kind: "sets",
          id: "depth",
          name: "Depth sequence",
          options: [
            ["MATH410", "MATH411"],
            ["MATH403", { count: 2, from: { courses: ["MATH404"], departments: ["MATH"], minNumber: 400, maxNumber: 499 } }],
          ],
        },
      ],
    };
    expect(programCourseIds(program)).toEqual(["MATH410", "MATH411", "MATH403", "MATH404"]);
  });

  it("ignores a 'concentration' requirement (no literal course list, only department/number range)", () => {
    const program: Program = {
      id: "p",
      name: "Test",
      requirements: [
        { kind: "concentration", id: "conc", name: "Concentration", credits: 12, minNumber: 300, maxNumber: 499 },
      ],
    };
    expect(programCourseIds(program)).toEqual([]);
  });

  it("dedupes across requirements", () => {
    const program: Program = {
      id: "p",
      name: "Test",
      requirements: [
        { kind: "course", id: "a", name: "A", options: ["MATH140"] },
        { kind: "course", id: "b", name: "B", options: ["MATH140", "MATH141"] },
      ],
    };
    expect(programCourseIds(program)).toEqual(["MATH140", "MATH141"]);
  });
});
