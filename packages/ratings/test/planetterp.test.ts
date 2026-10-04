// Parsers tested against trimmed real PlanetTerp responses (test/fixtures, fetched 2026-09-25).
// Fetchers are tested with a stubbed global fetch; no test touches the network.

import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SourceError } from "@turboterp/campus-data/http";
import {
  fetchCourse,
  fetchGrades,
  fetchGradesRaw,
  fetchProfessor,
  parseCourse,
  parseGrades,
  parseProfessor,
  summarizeGrades,
  type GradeRow,
} from "../src/planetterp.ts";

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));

describe("parseProfessor", () => {
  it("reads name, slug, rating and type", () => {
    expect(parseProfessor(fixture("prof-khurana.json"))).toMatchObject({
      name: "Archana Khurana",
      slug: "khurana",
      type: "professor",
      averageRating: 4.633,
    });
    expect(parseProfessor(fixture("prof-kruskal.json"))).toMatchObject({ slug: "kruskal", averageRating: 2.6126 });
  });

  it("lists each course once, in first-seen order (PlanetTerp repeats them)", () => {
    expect(parseProfessor(fixture("prof-kruskal.json"))!.courses).toEqual([
      "CMSC250",
      "CMSC250H",
      "CMSC451",
      "CMSC351",
      "CMSC452",
      "CMSC454",
      "CMSC398V",
    ]);
  });

  it("returns null for PlanetTerp's not-found error object", () => {
    expect(parseProfessor(fixture("prof-missing.json"))).toBeNull();
  });

  it("fails loudly when the shape changes", () => {
    expect(() => parseProfessor({ name: "X" })).toThrow(SourceError);
  });
});

describe("parseCourse", () => {
  const stat400 = () => parseCourse(fixture("course-stat400.json"));

  it("reads course basics and average GPA", () => {
    const course = stat400();
    expect(course).toMatchObject({
      id: "STAT400",
      department: "STAT",
      courseNumber: "400",
      title: "Applied Probability and Statistics I",
      credits: 3,
      isRecent: true,
      geneds: [],
    });
    expect(course!.averageGpa).toBeCloseTo(2.8917, 4);
    expect(course!.description).toMatch(/^<b>Prerequisite:<\/b>/);
  });

  it("lists each professor once (PlanetTerp repeats them)", () => {
    const course = stat400();
    expect(course!.professors).toHaveLength(27);
    expect(course!.professors.filter((p) => p === "Jonathan Fernandes")).toHaveLength(1);
    expect(course!.professors).toContain("Archana Khurana");
  });

  it("returns null for a not-found error object", () => {
    expect(parseCourse({ error: "course not found" })).toBeNull();
  });

  it("fails loudly when the shape changes", () => {
    expect(() => parseCourse({ name: "STAT400" })).toThrow(SourceError);
  });
});

describe("parseGrades", () => {
  it("reads rows with course, professor, semester, section and counts", () => {
    expect(parseGrades(fixture("grades-stat400-khurana.json"))).toEqual([
      {
        course: "STAT400",
        professor: "Archana Khurana",
        semester: "201608",
        section: "0401",
        counts: {
          "A+": 4, A: 3, "A-": 1,
          "B+": 0, B: 5, "B-": 6,
          "C+": 0, C: 1, "C-": 0,
          "D+": 1, D: 1, "D-": 0,
          F: 3, W: 0, Other: 0,
        },
      },
    ]);
  });

  it("returns [] for a not-found error object", () => {
    expect(parseGrades({ error: "course not found" })).toEqual([]);
  });

  it("keeps rows whose professor PlanetTerp leaves null (real MATH140 data has them)", () => {
    const rows = parseGrades(fixture("grades-math140-w.json"));
    expect(rows).toHaveLength(4);
    expect(rows[3]).toMatchObject({ course: "MATH140", professor: null, semester: "201201" });
  });

  it("fails loudly when the shape changes", () => {
    expect(() => parseGrades([{ course: "STAT400" }])).toThrow(SourceError);
  });
});

describe("summarizeGrades", () => {
  it("summarizes the real STAT400 / Khurana row", () => {
    // Points: A+ 4*4 + A 3*4 + A- 1*3.7 + B 5*3 + B- 6*2.7 + C 1*2 + D+ 1*1.3 + D 1*1 + F 3*0 = 67.2
    // Graded students: 25 → 67.2 / 25 = 2.688
    const s = summarizeGrades(parseGrades(fixture("grades-stat400-khurana.json")));
    expect(s.averageGpa).toBeCloseTo(2.688, 6);
    expect(s.total).toBe(25);
    expect(s.distribution).toEqual({ A: 8, B: 11, C: 1, D: 2, F: 3, W: 0, Other: 0 });
  });

  it("sums rows, counts W and Other in the total but not in the GPA", () => {
    const zero = {
      "A+": 0, A: 0, "A-": 0, "B+": 0, B: 0, "B-": 0, "C+": 0, C: 0, "C-": 0,
      "D+": 0, D: 0, "D-": 0, F: 0, W: 0, Other: 0,
    };
    const rows: GradeRow[] = [
      { course: "X", professor: "P", semester: "202401", section: "0101", counts: { ...zero, A: 2, "B+": 1, W: 3 } },
      { course: "X", professor: "P", semester: "202408", section: "0101", counts: { ...zero, "C-": 1, Other: 2 } },
    ];
    // Graded: A 2*4 + B+ 1*3.3 + C- 1*1.7 = 13.0 over 4 students → 3.25
    const s = summarizeGrades(rows);
    expect(s.averageGpa).toBeCloseTo(3.25, 6);
    expect(s.total).toBe(9);
    expect(s.distribution).toEqual({ A: 2, B: 1, C: 1, D: 0, F: 0, W: 3, Other: 2 });
  });

  it("gives a null GPA when nobody received a letter grade", () => {
    expect(summarizeGrades([])).toEqual({
      averageGpa: null,
      total: 0,
      distribution: { A: 0, B: 0, C: 0, D: 0, F: 0, W: 0, Other: 0 },
    });
  });
});

describe("fetchers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const stub = (body: unknown, status = 200) => {
    const calls: string[] = [];
    vi.stubGlobal("fetch", async (url: string) => {
      calls.push(String(url));
      return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
    });
    return calls;
  };

  it("fetchProfessor requests the professor by full name and parses it", async () => {
    const calls = stub(fixture("prof-khurana.json"));
    expect(await fetchProfessor("Archana Khurana")).toMatchObject({ slug: "khurana" });
    expect(calls).toEqual(["https://planetterp.com/api/v1/professor?name=Archana%20Khurana"]);
  });

  it("fetchProfessor returns null when PlanetTerp answers 400 not found", async () => {
    stub(fixture("prof-missing.json"), 400);
    expect(await fetchProfessor("Nobody Nonexistent")).toBeNull();
  });

  it("fetchProfessor returns null on 404 too", async () => {
    stub({ error: "professor not found" }, 404);
    expect(await fetchProfessor("Nobody Nonexistent")).toBeNull();
  });

  it("fetchProfessor still fails loudly on server errors", async () => {
    stub({}, 500);
    await expect(fetchProfessor("Archana Khurana")).rejects.toThrow(SourceError);
  });

  it("fetchCourse requests the course and returns null when not found", async () => {
    const calls = stub(fixture("course-stat400.json"));
    expect(await fetchCourse("STAT400")).toMatchObject({ id: "STAT400" });
    expect(calls).toEqual(["https://planetterp.com/api/v1/course?name=STAT400"]);
    stub({ error: "course not found" }, 400);
    expect(await fetchCourse("ZZZZ999")).toBeNull();
  });

  it("fetchGrades filters by professor when given, and returns [] when not found", async () => {
    const calls = stub(fixture("grades-stat400-khurana.json"));
    expect(await fetchGrades("STAT400", "Archana Khurana")).toHaveLength(1);
    expect(calls).toEqual(["https://planetterp.com/api/v1/grades?course=STAT400&professor=Archana%20Khurana"]);
    const calls2 = stub([]);
    await fetchGrades("STAT400");
    expect(calls2).toEqual(["https://planetterp.com/api/v1/grades?course=STAT400"]);
    stub({ error: "course not found" }, 400);
    expect(await fetchGrades("ZZZZ999")).toEqual([]);
  });

  it("fetchGradesRaw returns the unparsed body, for caching", async () => {
    const calls = stub(fixture("grades-cmsc351.json"));
    expect(await fetchGradesRaw("CMSC351")).toEqual(fixture("grades-cmsc351.json"));
    expect(calls).toEqual(["https://planetterp.com/api/v1/grades?course=CMSC351"]);
  });

  it("fetchGradesRaw turns a 400 not-found into PlanetTerp's error object, which parses to no rows", async () => {
    stub({ error: "course not found" }, 400);
    const raw = await fetchGradesRaw("AIME100");
    expect(raw).toEqual({ error: "course not found" });
    expect(parseGrades(raw)).toEqual([]);
  });

  it("fetchGradesRaw still fails loudly on server errors (so they are not cached)", async () => {
    stub({}, 503);
    await expect(fetchGradesRaw("CMSC351")).rejects.toThrow(SourceError);
  });
});
