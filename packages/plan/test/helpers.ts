import { readFileSync } from "node:fs";
import type { Course } from "@turboterp/course-data";

/** Real Spring 2027 Schedule of Classes records, trimmed to what the plan tests use. */
export const SPRING_2027: Course[] = (
  JSON.parse(readFileSync(new URL("./fixtures/courses-202701.json", import.meta.url), "utf8")) as { courses: Course[] }
).courses;
