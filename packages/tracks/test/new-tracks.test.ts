// A realistic plan (one non-overlapping course per category) satisfies every requirement of each
// of the three new tracks, and dropping one category's courses shows exactly that requirement as
// missing while every other requirement still satisfies. Course choices avoid the audit's
// double-counting rule (see packages/audit): each category below is given a course no other
// category in the same track also accepts.

import type { Plan, PlanCourse } from "@turboterp/plan";
import { describe, expect, it } from "vitest";
import { checkTrack } from "../src/check.ts";
import { TRACKS } from "../src/list.ts";
import type { Track } from "../src/types.ts";

const course = (id: string, credits: number): PlanCourse => ({ id, status: "completed", grade: "A", credits });

function trackOf(id: string): Track {
  return TRACKS.find((t) => t.id === id)!;
}

async function statusesFor(track: Track, courses: PlanCourse[]) {
  const plan: Plan = { terms: [{ name: "Fall 2026", courses }] };
  const result = await checkTrack(plan, track, { entryYear: 2028 });
  return Object.fromEntries(result.audit.requirements.map((r) => [r.id, r.status]));
}

describe("pre-anesthesiologist-assistant plans", () => {
  const track = trackOf("pre-anesthesiologist-assistant");
  const ALL_COURSES = [
    course("CHEM131", 3),
    course("CHEM132", 1),
    course("CHEM271", 2),
    course("CHEM272", 2),
    course("CHEM231", 3),
    course("CHEM232", 1),
    course("CHEM241", 3),
    course("CHEM242", 1),
    course("BCHM461", 3),
    course("BSCI160", 3),
    course("BSCI170", 3),
    course("BSCI180", 1),
    course("BSCI222", 4),
    course("MATH140", 4),
    course("STAT100", 3),
    course("PHYS131", 4),
    course("PHYS132", 4),
    course("ENGL101", 3),
    course("ENGL392", 3),
  ];

  it("satisfies every requirement with a realistic course list", async () => {
    const statuses = await statusesFor(track, ALL_COURSES);
    expect(Object.values(statuses).every((s) => s === "satisfied")).toBe(true);
    expect(Object.keys(statuses).length).toBeGreaterThan(0);
  });

  it("shows only calculus missing when its courses are dropped", async () => {
    const broken = ALL_COURSES.filter((c) => c.id !== "MATH140");
    const statuses = await statusesFor(track, broken);
    expect(statuses["calculus"]).toBe("missing");
    for (const [id, status] of Object.entries(statuses)) if (id !== "calculus") expect(status, id).toBe("satisfied");
  });
});

describe("pre-dental-hygiene plans", () => {
  const track = trackOf("pre-dental-hygiene");
  const ALL_COURSES = [
    course("BSCI170", 3),
    course("BSCI180", 1),
    course("CHEM131", 3),
    course("CHEM132", 1),
    course("BSCI201", 4),
    course("BSCI202", 4),
    course("MATH113", 3),
    course("STAT100", 3),
    course("PSYC100", 3),
    course("ENGL101", 3),
  ];

  it("satisfies every requirement with a realistic course list", async () => {
    const statuses = await statusesFor(track, ALL_COURSES);
    expect(Object.values(statuses).every((s) => s === "satisfied")).toBe(true);
    expect(Object.keys(statuses).length).toBeGreaterThan(0);
  });

  it("shows only college algebra missing when its course is dropped", async () => {
    const broken = ALL_COURSES.filter((c) => c.id !== "MATH113");
    const statuses = await statusesFor(track, broken);
    expect(statuses["math"]).toBe("missing");
    for (const [id, status] of Object.entries(statuses)) if (id !== "math") expect(status, id).toBe("satisfied");
  });
});

describe("pre-genetic-counseling plans", () => {
  const track = trackOf("pre-genetic-counseling");
  const ALL_COURSES = [
    course("STAT100", 3),
    course("CHEM131", 3),
    course("CHEM132", 1),
    course("CHEM231", 3),
    course("CHEM232", 1),
    course("BCHM461", 3),
    course("BSCI410", 3),
    course("PSYC100", 3),
  ];

  it("satisfies every requirement with a realistic course list", async () => {
    const statuses = await statusesFor(track, ALL_COURSES);
    expect(Object.values(statuses).every((s) => s === "satisfied")).toBe(true);
    expect(Object.keys(statuses).length).toBeGreaterThan(0);
  });

  it("shows only advanced genetics missing when its course is dropped", async () => {
    const broken = ALL_COURSES.filter((c) => c.id !== "BSCI410");
    const statuses = await statusesFor(track, broken);
    expect(statuses["advanced-genetics"]).toBe("missing");
    for (const [id, status] of Object.entries(statuses)) if (id !== "advanced-genetics") expect(status, id).toBe("satisfied");
  });
});
