// The compact files the schedule builder downloads: a small course index for search, and one
// section file per department (with its instructors' ratings). Format in ../SCHEDULE_FILES.md.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildScheduleFiles,
  decodeCourseIndex,
  decodeDepartmentSections,
  SCHEDULE_FILE_VERSION,
} from "../src/schedule-files.ts";
import type { Section } from "../src/soc.ts";

const sample = JSON.parse(readFileSync(new URL("./fixtures/soc-202701-sample.json", import.meta.url), "utf8")) as {
  term: string;
  sections: Section[];
};

const course = (id: string, title: string, credits = 3) => ({
  id,
  department: id.slice(0, 4),
  title,
  credits: { min: credits, max: credits },
  genEd: [],
  genEdText: "",
  permissionRequired: false,
  texts: { prerequisite: null, corequisite: null, restriction: null, creditOnlyGrantedFor: null, other: {} },
  description: "long text the builder doesn't need",
});

const snapshot = {
  term: "202701",
  fetchedAt: "2026-09-24T00:00:00.000Z",
  departments: [{ code: "CMSC", name: "Computer Science" }, { code: "STAT", name: "Statistics" }],
  courses: [
    course("CMSC351", "Algorithms"),
    course("STAT400", "Applied Probability and Statistics I"),
    course("CMSC999", "No sections this term"),
  ],
  sections: sample.sections.filter((s) => s.courseId === "CMSC351" || s.courseId === "STAT400"),
};
const meta = { generatedAt: "2026-09-25T20:00:00.000Z" };
const ratings = { "Clyde Kruskal": 2.6, "Archana Khurana": 4.6, "Someone Elsewhere": 5 };

describe("buildScheduleFiles", () => {
  const files = buildScheduleFiles(snapshot, { ratings, ...meta });

  it("writes an index plus one section file per department with sections", () => {
    expect(Object.keys(files.departments).sort()).toEqual(["CMSC", "STAT"]);
    expect(files.index).toMatchObject({ v: SCHEDULE_FILE_VERSION, term: "202701", generatedAt: meta.generatedAt });
  });

  it("indexes only courses that have sections, with title and credits", () => {
    const index = decodeCourseIndex(JSON.parse(JSON.stringify(files.index)));
    expect(index.courses.map((c) => c.id)).toEqual(["CMSC351", "STAT400"]);
    expect(index.courses[1]).toEqual({
      id: "STAT400",
      title: "Applied Probability and Statistics I",
      credits: { min: 3, max: 3 },
      sections: snapshot.sections.filter((s) => s.courseId === "STAT400").length,
    });
  });

  it("round-trips every section exactly through JSON", () => {
    const dept = decodeDepartmentSections(JSON.parse(JSON.stringify(files.departments.STAT)));
    expect(dept.sections).toEqual(snapshot.sections.filter((s) => s.courseId === "STAT400"));
    expect(dept.courses.map((c) => c.id)).toEqual(["STAT400"]);
  });

  it("keeps only the ratings of the department's own instructors", () => {
    const dept = decodeDepartmentSections(JSON.parse(JSON.stringify(files.departments.STAT)));
    expect(dept.ratings).toEqual({ "Archana Khurana": 4.6 });
  });

  it("lists the department's instructors that have a review file", () => {
    const withReviews = buildScheduleFiles(snapshot, { ratings, reviews: ["Archana Khurana", "Someone Elsewhere"], ...meta });
    const dept = decodeDepartmentSections(JSON.parse(JSON.stringify(withReviews.departments.STAT)));
    expect(dept.reviews).toEqual(["Archana Khurana"]);
    expect(decodeDepartmentSections(JSON.parse(JSON.stringify(files.departments.STAT))).reviews).toEqual([]);
  });

  it("is much smaller than the snapshot it came from", () => {
    const compact = JSON.stringify(files.departments.STAT).length;
    const original = JSON.stringify(snapshot.sections.filter((s) => s.courseId === "STAT400")).length;
    expect(compact).toBeLessThan(original * 0.6);
  });

  it('drops "Instructor: TBA" placeholders so TBA reads as no instructor', () => {
    const tba: Section = { ...snapshot.sections[0]!, courseId: "CMSC999", id: "0101", instructors: ["Instructor: TBA"] };
    const withTba = buildScheduleFiles({ ...snapshot, sections: [tba] }, meta);
    expect(decodeDepartmentSections(withTba.departments.CMSC).sections[0]!.instructors).toEqual([]);
  });

  it("keeps untimed (online or TBA) meetings with null times", () => {
    const online: Section = {
      ...snapshot.sections[0]!,
      meetings: [{ days: [], start: null, end: null, building: null, room: null, type: "Lecture" }],
    };
    const out = buildScheduleFiles({ ...snapshot, sections: [online] }, meta);
    expect(decodeDepartmentSections(out.departments.CMSC).sections[0]!.meetings).toEqual(online.meetings);
  });
});

describe("decoders", () => {
  it("reject a file from another format version", () => {
    expect(() => decodeCourseIndex({ v: 999 })).toThrow(/version/);
    expect(() => decodeDepartmentSections({ v: 999 })).toThrow(/version/);
  });
});
