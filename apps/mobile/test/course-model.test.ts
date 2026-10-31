import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { distributionFromCounts, type CourseGrades, type ReviewSummary } from "@turboterp/ratings";
import { deptOf, gradeChartView, instructorViews, ratingLabel, restrictionLine, reviewsSummaryView, sectionViews, splitCourseCodes } from "../src/course/model";

const section = (id: string, instructors: string[], open: number, total = 30): Section => ({
  id,
  courseId: "CMSC131",
  instructors,
  seats: { total, open, waitlist: 0, holdfile: 0 },
  delivery: "face-to-face",
  notes: null,
  meetings: [{ days: ["M", "W"], start: 600, end: 675, building: "IRB", room: "0324", type: "Lecture" }],
});

const counts = (a: number, b: number) => ({ "A+": 0, A: a, "A-": 0, "B+": 0, B: b, "B-": 0, "C+": 0, C: 0, "C-": 0, "D+": 0, D: 0, "D-": 0, F: 0, W: 0, Other: 0 });

describe("course codes", () => {
  it("splits text around course codes", () => {
    expect(splitCourseCodes("Minimum grade of C- in CMSC131 and MATH140; or CMSC132.")).toEqual([
      { text: "Minimum grade of C- in ", code: null },
      { text: "CMSC131", code: "CMSC131" },
      { text: " and ", code: null },
      { text: "MATH140", code: "MATH140" },
      { text: "; or ", code: null },
      { text: "CMSC132", code: "CMSC132" },
      { text: ".", code: null },
    ]);
    expect(splitCourseCodes("No codes here")).toEqual([{ text: "No codes here", code: null }]);
    expect(splitCourseCodes("")).toEqual([]);
  });
  it("finds the department", () => expect(deptOf("CMSC131H")).toBe("CMSC"));
});

describe("sections", () => {
  it("applies the seats overlay, labels seats and sorts by id", () => {
    const rows = sectionViews([section("0201", [], 0), section("0101", ["Ann Lee"], 20)], { "Ann Lee": 4.2 }, {
      generatedAt: "t",
      seats: { "CMSC131-0101": [3, 0, 0, 30] },
    });
    expect(rows.map((r) => r.id)).toEqual(["0101", "0201"]);
    expect(rows[0]).toMatchObject({ seats: "3 of 30 open", lowSeats: true, full: false, rating: 4.2, instructorLabel: "Ann Lee" });
    expect(rows[1]).toMatchObject({ seats: "Full (30)", full: true, instructorLabel: "TBA", rating: undefined });
    expect(rows[0]!.meetings[0]!.place).toBe("IRB 0324");
  });
});

describe("grades and instructors", () => {
  const dist = distributionFromCounts(counts(30, 10), ["202508", "202601"]);
  const grades: CourseGrades = { course: "CMSC131", overall: dist, byProfessor: { "Ann Lee": dist }, terms: dist.terms };
  it("builds the grade chart", () => {
    const v = gradeChartView(dist)!;
    expect(v.students).toBe("40 students");
    expect(v.bars[0]).toMatchObject({ label: "A", percent: 75, height: 1 });
    expect(gradeChartView(null)).toBeNull();
    expect(gradeChartView(distributionFromCounts(counts(0, 0), []))).toBeNull();
  });
  it("lists each instructor once with rating, reviews and grades", () => {
    const rows = instructorViews([section("1", ["Ann Lee", "Bo Wu"], 1), section("2", ["Ann Lee"], 1)], { "Ann Lee": 3.9 }, new Set(["Ann Lee"]), grades);
    expect(rows.map((r) => r.name)).toEqual(["Ann Lee", "Bo Wu"]);
    expect(rows[0]).toMatchObject({ rating: 3.9, hasReviews: true });
    expect(rows[0]!.grade?.gpa).toBe("3.75");
    expect(rows[1]).toMatchObject({ rating: undefined, hasReviews: false, grade: null });
  });
  it("labels ratings", () => {
    expect(ratingLabel(4.25)).toBe("4.3★");
    expect(ratingLabel(undefined)).toBe("N/A");
  });
});

describe("reviews and restrictions", () => {
  const s: ReviewSummary = {
    name: "Ann Lee",
    slug: "lee",
    averageRating: 4,
    count: 1,
    breakdown: [0, 1, 0, 0, 0],
    courses: ["CMSC131"],
    excerpts: [{ course: "CMSC131", rating: 4, year: 2025, text: "Clear." }],
  };
  it("maps the summary", () => {
    const v = reviewsSummaryView(s);
    expect(v).toMatchObject({ empty: false, rating: 4, countLabel: "1 review", url: "https://planetterp.com/professor/lee" });
    expect(v.rows[1]).toEqual({ stars: 4, count: 1, percent: 100 });
    expect(reviewsSummaryView({ ...s, count: 0, averageRating: null, breakdown: [0, 0, 0, 0, 0], excerpts: [] })).toMatchObject({ empty: true, rating: undefined });
  });
  it("returns no restriction line for plain text", () => expect(restrictionLine(null)).toBeNull());
});
