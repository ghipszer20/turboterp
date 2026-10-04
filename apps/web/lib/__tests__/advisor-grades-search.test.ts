import { distributionFromCounts } from "@turboterp/ratings";
import { describe, expect, it } from "vitest";
import { gradeBars, gradeSummary, termSpan } from "../advisor/grades";
import { searchCourses } from "../advisor/search";

const counts = { "A+": 5, A: 30, "A-": 15, "B+": 10, B: 10, "B-": 5, "C+": 5, C: 5, "C-": 0, "D+": 0, D: 2, "D-": 0, F: 3, W: 10, Other: 0 };
const dist = distributionFromCounts(counts, ["202108", "202201", "202608"]);

describe("gradeBars", () => {
  it("groups A–F and W, with shares of all students and the tallest bar at full height", () => {
    const bars = gradeBars(dist);
    expect(bars.map((b) => b.label)).toEqual(["A", "B", "C", "D", "F", "W"]);
    expect(bars[0]).toEqual({ label: "A", count: 50, share: 0.5, height: 1 });
    expect(bars[1]).toEqual({ label: "B", count: 25, share: 0.25, height: 0.5 });
    expect(bars[5]).toEqual({ label: "W", count: 10, share: 0.1, height: 0.2 });
  });

  it("adds an Other bar only when there are other marks", () => {
    const withOther = distributionFromCounts({ ...counts, Other: 4 }, []);
    expect(gradeBars(withOther).map((b) => b.label)).toContain("Other");
  });
});

describe("gradeSummary", () => {
  it("gives the average GPA and the students", () => {
    expect(gradeSummary(dist)).toEqual({ gpa: dist.averageGpa!.toFixed(2), students: "100 students" });
  });
});

describe("termSpan", () => {
  it("names the first and last term covered", () => {
    expect(termSpan(["202108", "202201", "202608"])).toBe("Fall 2021 – Fall 2026");
    expect(termSpan(["202601"])).toBe("Spring 2026");
    expect(termSpan([])).toBe("");
  });
});

const COURSES = [
  { id: "CMSC131", title: "Object-Oriented Programming I" },
  { id: "CMSC132", title: "Object-Oriented Programming II" },
  { id: "CMSC351", title: "Algorithms" },
  { id: "MATH141", title: "Calculus II" },
  { id: "MATH140", title: "Calculus I" },
  { id: "ENGL101", title: "Academic Writing" },
  { id: "STAT400", title: "Applied Probability and Statistics I" },
];

describe("searchCourses", () => {
  it("matches course ids with or without the space, any case", () => {
    expect(searchCourses(COURSES, "cmsc 13").map((c) => c.id)).toEqual(["CMSC131", "CMSC132"]);
    expect(searchCourses(COURSES, "CMSC351").map((c) => c.id)).toEqual(["CMSC351"]);
  });

  it("puts an exact id first, then id prefixes, then title words", () => {
    expect(searchCourses([...COURSES, { id: "MATH999", title: "Calculus fun" }], "calculus").map((c) => c.id)).toEqual([
      "MATH140",
      "MATH141",
      "MATH999",
    ]);
  });

  it("matches every word of a multi-word title query", () => {
    expect(searchCourses(COURSES, "oriented II").map((c) => c.id)).toEqual(["CMSC132"]);
  });

  it("returns nothing for an empty query and caps the list", () => {
    expect(searchCourses(COURSES, "  ")).toEqual([]);
    expect(searchCourses(COURSES, "a", 2)).toHaveLength(2);
  });
});
