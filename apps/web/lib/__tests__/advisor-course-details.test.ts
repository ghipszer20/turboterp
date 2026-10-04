import { readFileSync } from "node:fs";
import type { Course } from "@turboterp/course-data";
import { describe, expect, it } from "vitest";
import { courseDetailFiles, decodeCourseDetails } from "../advisor/course-details";

const COURSES = (
  JSON.parse(
    readFileSync(new URL("../../../../packages/plan/test/fixtures/courses-202701.json", import.meta.url), "utf8"),
  ) as { courses: Course[] }
).courses;

describe("course detail files", () => {
  const files = courseDetailFiles(COURSES, "202701");

  it("writes one file per department", () => {
    expect(Object.keys(files)).toContain("CMSC");
    expect(Object.keys(files)).toContain("MATH");
    expect(Object.keys(files.CMSC!.courses).every((id) => id.startsWith("CMSC"))).toBe(true);
  });

  it("keeps the description and the texts as the Schedule of Classes prints them", () => {
    const math141 = decodeCourseDetails(JSON.parse(JSON.stringify(files.MATH))).MATH141!;
    const source = COURSES.find((c) => c.id === "MATH141")!;
    expect(math141.description).toBe(source.description);
    expect(math141.prerequisite).toBe(source.texts.prerequisite);
    expect(math141.corequisite).toBeNull();
  });

  it("rejects an unknown file", () => {
    expect(() => decodeCourseDetails({ v: 7 })).toThrow(/version/);
  });
});
