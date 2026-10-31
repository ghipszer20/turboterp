import { describe, expect, it } from "vitest";
import type { DepartmentSections } from "@turboterp/course-data/schedule-files";
import type { Section } from "@turboterp/course-data/schedules";
import { sectionTiming, sortRows, summarizeDepartment, toggleCourse, type CourseRow } from "../src/schedule/results";

const sec = (courseId: string, id: string, instructors: string[], start: number | null, open = 5): Section =>
  ({
    courseId,
    id,
    instructors,
    seats: { total: 30, open, waitlist: 0, holdfile: 0 },
    delivery: "face-to-face",
    meetings: [{ days: ["M", "W"], start, end: start === null ? null : start + 75, building: null, room: null, type: "Lecture" }],
  }) as unknown as Section;

const dept: DepartmentSections = {
  term: "202701",
  dept: "CMSC",
  generatedAt: "t",
  courses: [
    { id: "CMSC131", title: "Object-Oriented Programming I", credits: { min: 4, max: 4 }, restriction: null },
    { id: "CMSC132", title: "Object-Oriented Programming II", credits: { min: 4, max: 4 }, restriction: null },
  ],
  sections: [sec("CMSC131", "0101", ["Good Prof"], 690, 3), sec("CMSC131", "0102", ["Other"], 480, 4), sec("CMSC132", "0101", [], null)],
  ratings: { "Good Prof": 4.5 },
  reviews: [],
};

describe("course summaries", () => {
  it("takes the best rating, sums open seats and overlays the seats file", () => {
    const s = summarizeDepartment(dept, undefined, { generatedAt: "t", seats: { "CMSC131-0101": [10, 0, 0, 30] } });
    expect(s.get("CMSC131")).toMatchObject({ rating: 4.5, open: 14, gpa: undefined });
    expect(s.get("CMSC132")).toMatchObject({ rating: undefined, timing: undefined });
  });

  it("scores midday classes above early ones and untimed ones are undefined", () => {
    expect(sectionTiming(sec("A", "1", [], 690))).toBeGreaterThan(sectionTiming(sec("A", "1", [], 480))!);
    expect(sectionTiming(sec("A", "1", [], null))).toBeUndefined();
  });

  it("uses grade data for GPA when loaded", () => {
    const grades = { CMSC131: { byProfessor: { "Good Prof": { students: 50, averageGpa: 3.4 } } } } as never;
    expect(summarizeDepartment(dept, grades, null).get("CMSC131")?.gpa).toBe(3.4);
  });
});

describe("sorting", () => {
  const sums = summarizeDepartment(dept, undefined, null);
  const rows: CourseRow[] = dept.courses.map((c) => ({ course: { ...c, sections: 2 }, summary: sums.get(c.id) }));
  const ids = (r: CourseRow[]) => r.map((x) => x.course.id);

  it("default ranks by the weighted score, and an exact typed code still leads", () => {
    expect(ids(sortRows([...rows].reverse(), "default"))).toEqual(["CMSC131", "CMSC132"]);
    expect(ids(sortRows(rows, "default", "cmsc132"))).toEqual(["CMSC132", "CMSC131"]);
  });
  it("rating puts unrated courses last", () => {
    expect(ids(sortRows([...rows].reverse(), "rating"))).toEqual(["CMSC131", "CMSC132"]);
  });
  it("rows without a summary sort last and never throw", () => {
    const r = [{ course: rows[1]!.course, summary: undefined }, rows[0]!];
    expect(ids(sortRows(r, "rating"))).toEqual(["CMSC131", "CMSC132"]);
  });
});

describe("toggleCourse", () => {
  it("adds at the end and removes", () => {
    expect(toggleCourse(["A"], "B")).toEqual(["A", "B"]);
    expect(toggleCourse(["A", "B"], "A")).toEqual(["B"]);
  });
});
