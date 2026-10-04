import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { decodeLayout } from "../gallery";
import { runGeneration } from "../generate";

const { sections } = JSON.parse(
  readFileSync(new URL("../../../../../packages/course-data/test/fixtures/soc-202701-sample.json", import.meta.url), "utf8"),
) as { sections: Section[] };
const byKey = new Map(sections.map((s) => [`${s.courseId}/${s.id}`, s]));
const TRIO = ["CMSC351", "STAT400", "ENGL394"];

describe("runGeneration (what the Web Worker does)", () => {
  it("returns every distinct layout, best first", () => {
    const out = runGeneration({ courseIds: TRIO, sections, filters: { days: {} }, sort: "best", ratings: {} });
    expect(out.layouts.count).toBeGreaterThan(100);
    expect(out.explanation).toBeNull();
    const first = decodeLayout(out.layouts, 0, byKey);
    expect(first.map((g) => g[0]!.courseId)).toEqual(TRIO);
  });

  it("uses one time scale for every card, covering the classes that pass the filters", () => {
    const out = runGeneration({ courseIds: TRIO, sections, filters: { days: {} }, sort: "best", ratings: {} });
    expect(out.scale.start % 60).toBe(0);
    expect(out.scale.hours[0]).toBe(out.scale.start);
  });

  it("explains an empty result (e.g. Fridays off for CMSC351 + STAT400 + ENGL394)", () => {
    const out = runGeneration({ courseIds: TRIO, sections, filters: { days: { F: "off" } }, sort: "best", ratings: {} });
    expect(out.layouts.count).toBe(0);
    expect(out.explanation?.blockers[0]?.filters).toContainEqual({ kind: "dayOff", day: "F" });
  });

  it("returns nothing (and no explanation) with no courses", () => {
    const out = runGeneration({ courseIds: [], sections, filters: { days: {} }, sort: "best", ratings: {} });
    expect(out.layouts.count).toBe(0);
    expect(out.explanation).toBeNull();
  });
});

describe("runGeneration with the Recommended sort", () => {
  it("ranks with the GPA data it is given, and keeps the same layouts as best-first", () => {
    const best = runGeneration({ courseIds: TRIO, sections, filters: { days: {} }, sort: "best", ratings: {} });
    const gpas: Record<string, number> = {};
    for (const s of sections) if (TRIO.includes(s.courseId)) for (const n of s.instructors) gpas[`${s.courseId}|${n}`] = n.length % 2 ? 3.9 : 2.1;
    const rec = runGeneration({ courseIds: TRIO, sections, filters: { days: {} }, sort: "recommended", ratings: {}, gpas });
    expect(rec.layouts.count).toBe(best.layouts.count);
    const score = (i: number) =>
      decodeLayout(rec.layouts, i, byKey).reduce((sum, g) => sum + Math.max(...g.map((s) => Math.max(0, ...s.instructors.map((n) => gpas[`${s.courseId}|${n}`] ?? 0)))), 0);
    expect(score(0)).toBeGreaterThanOrEqual(score(rec.layouts.count - 1));
  });
});
