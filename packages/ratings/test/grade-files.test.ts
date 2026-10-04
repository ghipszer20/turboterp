// The compact per-department grade file (see GRADES.md) and reading the
// courses offered from a Schedule of Classes snapshot.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SourceError } from "@turboterp/campus-data/http";
import { GRADE_COLUMNS, parseGrades } from "../src/planetterp.ts";
import { summarizeCourseGrades } from "../src/course-grades.ts";
import { coursesOffered, decodeDepartment, encodeDepartment } from "../src/grade-files.ts";

const rows = (name: string) =>
  parseGrades(JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8")));

const cmsc351 = summarizeCourseGrades("CMSC351", rows("grades-cmsc351.json"), ["Clyde Kruskal", "Ting Jiang"]);
const cmsc999 = summarizeCourseGrades("CMSC999", rows("grades-missing.json"));
const meta = { department: "CMSC", term: "202701", generatedAt: "2026-09-25T20:00:00.000Z" };

describe("encodeDepartment", () => {
  it("writes counts as arrays in the order of its columns list", () => {
    const file = encodeDepartment(meta, [cmsc351]);
    expect(file.columns).toEqual([...GRADE_COLUMNS]);
    expect(file.courses.CMSC351!.p["Evan Golub"]).toEqual({
      c: [9, 11, 2, 2, 18, 5, 2, 17, 3, 0, 1, 1, 11, 5, 0],
      t: ["201601"],
    });
  });

  it("records the department, term and generation time", () => {
    expect(encodeDepartment(meta, [])).toMatchObject({ v: 1, dept: "CMSC", term: "202701", generatedAt: meta.generatedAt });
  });

  it("leaves out courses without data (a missing course means no data)", () => {
    expect(Object.keys(encodeDepartment(meta, [cmsc351, cmsc999]).courses)).toEqual(["CMSC351"]);
  });
});

describe("decodeDepartment", () => {
  it("expands a file back into full distributions (round trip through JSON)", () => {
    const file = JSON.parse(JSON.stringify(encodeDepartment(meta, [cmsc351])));
    const { names: _names, ...expected } = cmsc351;
    const decoded = decodeDepartment(file);
    expect(decoded.CMSC351!.byProfessor["Evan Golub"]!.averageGpa).toBeCloseTo(206.9 / 82, 6);
    expect(decoded).toEqual({ CMSC351: expected });
  });

  it("fails loudly on an unknown version or column order", () => {
    const file = encodeDepartment(meta, [cmsc351]);
    expect(() => decodeDepartment({ ...file, v: 2 })).toThrow(SourceError);
    expect(() => decodeDepartment({ ...file, columns: [...GRADE_COLUMNS].reverse() })).toThrow(SourceError);
  });
});

describe("coursesOffered", () => {
  const snapshot = {
    term: "202701",
    courses: [
      { id: "CMSC351", department: "CMSC", title: "Algorithms" },
      { id: "AIME100", department: "AIME", title: "No sections listed" },
    ],
    sections: [
      { id: "0101", courseId: "CMSC351", instructors: ["Clyde Kruskal"] },
      { id: "0201", courseId: "CMSC351", instructors: ["Ting Jiang", "Clyde Kruskal"] },
      { id: "0301", courseId: "CMSC351", instructors: ["Instructor: TBA"] },
    ],
  };

  it("lists each course with its department and its instructors, once each", () => {
    expect(coursesOffered(snapshot)).toEqual([
      { id: "CMSC351", department: "CMSC", instructors: ["Clyde Kruskal", "Ting Jiang", "Instructor: TBA"] },
      { id: "AIME100", department: "AIME", instructors: [] },
    ]);
  });

  it("fails loudly when the snapshot has no course list", () => {
    expect(() => coursesOffered({ term: "202701" })).toThrow(SourceError);
  });
});
