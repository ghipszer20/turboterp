import { describe, expect, it } from "vitest";
import { courseDifficulty, termDifficulty, type DifficultyCourse, type DifficultyHistory } from "../src/difficulty.ts";

const course = (id: string, averageGpa: number | null, credits = 3, rates = { wRate: 0.03, fRate: 0.02 }): DifficultyCourse => ({
  id,
  credits,
  stats: averageGpa === null ? null : { averageGpa, ...rates },
});
const mid = (n: number, avg = 3.0) => Array.from({ length: n }, (_, i) => course(`ENGL${100 + i}`, avg));

describe("courseDifficulty", () => {
  it("is low for easy averages and high for hard ones, clamped to 0-10", () => {
    expect(courseDifficulty(course("ART100", 3.8))).toBeLessThan(2);
    expect(courseDifficulty(course("CMSC451", 2.3))).toBeGreaterThan(7);
    expect(courseDifficulty(course("X100", 4.5, 3, { wRate: 0, fRate: 0 }))).toBeGreaterThanOrEqual(0);
    expect(courseDifficulty(course("X100", 0.5, 3, { wRate: 0.5, fRate: 0.4 }))).toBe(10);
  });
  it("is raised by W and F rates", () => {
    const calm = courseDifficulty(course("A200", 3.0, 3, { wRate: 0, fRate: 0 }));
    const rough = courseDifficulty(course("A200", 3.0, 3, { wRate: 0.15, fRate: 0.1 }));
    expect(rough).toBeGreaterThan(calm);
  });
  it("uses a neutral value by course level when there is no data", () => {
    const [a, b, c, d] = ["A100", "A200", "A300", "A400"].map((id) => courseDifficulty(course(id, null)));
    expect(a! < b! && b! < c! && c! < d!).toBe(true);
  });
});

describe("termDifficulty", () => {
  it("falls back to course averages and credit load without a transcript", () => {
    const r = termDifficulty(mid(5), []);
    expect(r.personalized).toBe(false);
    expect(r.score).toBeGreaterThanOrEqual(1);
    expect(r.score).toBeLessThanOrEqual(10);
    expect(Number.isInteger(r.score)).toBe(true);
    expect(r.sentence.endsWith(".")).toBe(true);
    expect(r.sentence).not.toMatch(/[\n•*-] /);
  });
  it("scores a heavy load higher than a light one, and says so", () => {
    const light = termDifficulty(mid(3), []);
    const heavy = termDifficulty(mid(7), []);
    expect(heavy.score).toBeGreaterThan(light.score);
    expect(heavy.sentence).toMatch(/21-credit|heavy/i);
  });
  it("names the hardest courses", () => {
    const r = termDifficulty([course("CMSC451", 2.4), course("CMSC420", 2.5), course("ART100", 3.8)], []);
    expect(r.sentence).toContain("CMSC451");
    expect(r.sentence).toContain("CMSC420");
    expect(r.sentence).toMatch(/harder|hardest|toughest/i);
  });
  it("handles courses with no data", () => {
    const r = termDifficulty([course("CMSC412", null), course("MATH141", null)], []);
    expect(r.score).toBeGreaterThanOrEqual(1);
    expect(r.sentence.length).toBeGreaterThan(0);
  });
  it("lowers the score for a strong record in the subject and mentions it", () => {
    const term = [course("STAT410", 2.6), course("CMSC420", 2.6), course("ENGL101", 3.5)];
    const strong: DifficultyHistory[] = [
      { id: "STAT400", grade: "A", courseAverageGpa: 2.9 },
      { id: "STAT401", grade: "A-", courseAverageGpa: 2.8 },
      { id: "STAT402", grade: "A", courseAverageGpa: 2.9 },
    ];
    const base = termDifficulty(term, []);
    const p = termDifficulty(term, strong);
    expect(p.personalized).toBe(true);
    expect(p.score).toBeLessThanOrEqual(base.score);
    expect(p.sentence).toMatch(/strong STAT record makes STAT410 easier for you/);
  });
  it("raises the score for a weak record", () => {
    const term = [course("CMSC420", 2.8, 4), course("CMSC451", 2.8, 4), course("MATH241", 2.8, 4), course("STAT400", 2.8, 4)];
    const weak: DifficultyHistory[] = [
      { id: "CMSC131", grade: "C", courseAverageGpa: 3.2 },
      { id: "CMSC132", grade: "C-", courseAverageGpa: 3.0 },
      { id: "MATH140", grade: "C", courseAverageGpa: 2.9 },
    ];
    expect(termDifficulty(term, weak).score).toBeGreaterThan(termDifficulty(term, []).score);
  });
  it("ignores history entries with a non-letter grade", () => {
    expect(termDifficulty(mid(3), [{ id: "MATH140", grade: "P", courseAverageGpa: 3 }]).personalized).toBe(false);
  });
  it("scores upper-level courses with ordinary real averages as low, not hard", () => {
    // Real PlanetTerp stats: CMSC420 3.197 (5.3% W+F), CMSC421 3.292 (5.0%), ENGL101 3.4. Only 9 credits.
    const term = [
      course("CMSC420", 3.197, 3, { wRate: 0.038, fRate: 0.015 }),
      course("CMSC421", 3.292, 3, { wRate: 0.036, fRate: 0.014 }),
      course("ENGL101", 3.4),
    ];
    const r = termDifficulty(term, []);
    expect(r.score).toBeGreaterThanOrEqual(2);
    expect(r.score).toBeLessThanOrEqual(4);
    expect(r.sentence).not.toMatch(/harder|hardest|toughest/i);
  });
  it("does not max out a typical 15-credit term with two hard courses", () => {
    const term = [
      course("CMSC351", 2.67, 3, { wRate: 0.05, fRate: 0.027 }),
      course("STAT410", 2.8, 3, { wRate: 0.04, fRate: 0.02 }),
      course("ENGL201", 3.3),
      course("HIST200", 3.3),
      course("PSYC100", 3.3),
    ];
    expect(termDifficulty(term, []).score).toBeLessThanOrEqual(8);
  });
  it("does not name a repeat of a completed course or an easy course in the personal clause", () => {
    const term = [course("MATH140", 2.0), course("ENGL101", 3.6)];
    const hist: DifficultyHistory[] = [
      { id: "MATH140", grade: "A", courseAverageGpa: 2.8 },
      { id: "ENGL100", grade: "A", courseAverageGpa: 3.0 },
    ];
    expect(termDifficulty(term, hist).sentence).not.toMatch(/MATH140 easier|ENGL101 easier/);
  });
  describe("workload calibration (real PlanetTerp stats)", () => {
    const r = (id: string, gpa: number, w: number, f: number, cr: number) => course(id, gpa, cr, { wRate: w, fRate: f });
    const MATH141 = r("MATH141", 2.55, 0.084, 0.075, 4);
    const CMSC131 = r("CMSC131", 2.75, 0.098, 0.089, 4);
    const ENGL101 = r("ENGL101", 3.34, 0.036, 0.031, 3);
    const COMM107 = r("COMM107", 3.55, 0.028, 0.012, 3);
    const CMSC216 = r("CMSC216", 2.73, 0.067, 0.051, 4);
    const CMSC250 = r("CMSC250", 2.82, 0.043, 0.033, 4);
    const MATH241 = r("MATH241", 2.87, 0.059, 0.046, 4);
    const CMSC420 = r("CMSC420", 3.2, 0.039, 0.015, 3);
    const CMSC421 = r("CMSC421", 3.29, 0.037, 0.014, 3);
    const freshman = [MATH141, CMSC131, ENGL101, COMM107];

    it("scores two hard courses alone well below 8 and calls the load light", () => {
      const t = termDifficulty([MATH141, CMSC131], []);
      expect(t.score).toBeLessThanOrEqual(4);
      expect(t.sentence).toMatch(/8-credit load is light/);
    });
    it("scores the full freshman term about 5", () => {
      const t = termDifficulty(freshman, []);
      expect(t.score).toBeGreaterThanOrEqual(4);
      expect(t.score).toBeLessThanOrEqual(6);
    });
    it("scores a 20-credit hard term at 8 or more", () => {
      expect(termDifficulty([CMSC216, CMSC250, MATH241, MATH141, CMSC131], []).score).toBeGreaterThanOrEqual(8);
    });
    it("scores 12 credits of easy courses at 3 or less", () => {
      const easy = Array.from({ length: 4 }, (_, i) => r(`ART${100 + i}`, 3.8, 0.01, 0.005, 3));
      expect(termDifficulty(easy, []).score).toBeLessThanOrEqual(3);
    });
    it("scores a light upper-level term below the freshman term", () => {
      expect(termDifficulty([CMSC420, CMSC421, ENGL101], []).score).toBeLessThan(termDifficulty(freshman, []).score);
    });
  });
  it("clamps to 1-10", () => {
    const brutal = Array.from({ length: 8 }, (_, i) => course(`CMSC4${i}0`, 1.5, 4, { wRate: 0.4, fRate: 0.3 }));
    expect(termDifficulty(brutal, []).score).toBe(10);
    expect(termDifficulty([course("ART100", 4.0, 1, { wRate: 0, fRate: 0 })], []).score).toBe(1);
  });
});
