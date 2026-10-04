// Batch B pre-professional tracks (chiropractic, naturopathic, medical laboratory science): a
// realistic plan satisfies every requirement, and shortening one category fails exactly it.

import type { Plan, PlanCourse } from "@turboterp/plan";
import { describe, expect, it } from "vitest";
import { checkTrack } from "../src/check.ts";
import { TRACKS } from "../src/list.ts";
import type { Track } from "../src/types.ts";

const course = (id: string, credits: number): PlanCourse => ({ id, status: "completed", grade: "A", credits });
const trackOf = (id: string): Track => TRACKS.find((t) => t.id === id)!;

async function statusesFor(track: Track, courses: PlanCourse[]) {
  const plan: Plan = { terms: [{ name: "Fall 2026", courses }] };
  const result = await checkTrack(plan, track, { entryYear: 2028 });
  return Object.fromEntries(result.audit.requirements.map((r) => [r.id, r.status]));
}

const without = (courses: PlanCourse[], ids: string[]) => courses.filter((c) => !ids.includes(c.id));

describe("pre-chiropractic plans", () => {
  const track = trackOf("pre-chiropractic");
  // 24 credits of life and physical science.
  const ALL = [
    course("BSCI170", 3),
    course("BSCI171", 1),
    course("BSCI201", 4),
    course("BSCI202", 4),
    course("CHEM131", 3),
    course("CHEM132", 1),
    course("PHYS131", 4),
    course("PHYS132", 4),
  ];

  it("satisfies every requirement with 24 science credits", async () => {
    const statuses = await statusesFor(track, ALL);
    expect(Object.keys(statuses)).toEqual(["life-physical-science"]);
    expect(statuses["life-physical-science"]).toBe("satisfied");
  });

  it("does not satisfy the science category at 20 credits", async () => {
    const statuses = await statusesFor(track, without(ALL, ["PHYS132"]));
    expect(statuses["life-physical-science"]).not.toBe("satisfied");
  });

  it("encodes no GPA figure, since the sources conflict", () => {
    expect(track.milestones.some((m) => m.kind === "gpa")).toBe(false);
    expect(track.reviewNotes.join(" ")).toMatch(/conflict/i);
  });
});

describe("pre-naturopathic plans", () => {
  const track = trackOf("pre-naturopathic");
  const ALL = [
    course("BSCI170", 3),
    course("BSCI171", 1),
    course("BSCI180", 1),
    course("BSCI223", 4),
    course("CHEM131", 3),
    course("CHEM132", 1),
    course("CHEM231", 3),
    course("CHEM232", 1),
    course("CHEM241", 3),
    course("CHEM242", 1),
    course("BCHM461", 3),
  ];

  it("satisfies every requirement with 24 science credits", async () => {
    const statuses = await statusesFor(track, ALL);
    expect(Object.keys(statuses)).toEqual(["life-physical-science"]);
    expect(statuses["life-physical-science"]).toBe("satisfied");
  });

  it("does not satisfy the science category at 20 credits", async () => {
    const statuses = await statusesFor(track, without(ALL, ["BSCI223"]));
    expect(statuses["life-physical-science"]).not.toBe("satisfied");
  });

  it("requires a C or higher", () => {
    expect(track.minGrade).toBe("C");
  });
});

describe("pre-mls plans", () => {
  const track = trackOf("pre-mls");
  const ALL = [
    course("BSCI160", 3),
    course("BSCI161", 1),
    course("BSCI170", 3),
    course("BSCI171", 1),
    course("BSCI201", 4),
    course("BSCI202", 4),
    course("BSCI223", 4),
    course("CHEM131", 3),
    course("CHEM132", 1),
    course("CHEM271", 2),
    course("CHEM272", 2),
    course("CHEM231", 3),
    course("CHEM232", 1),
    course("CHEM241", 3),
    course("CHEM242", 1),
  ];

  it("satisfies every requirement with 16 biology and 16 chemistry credits", async () => {
    const statuses = await statusesFor(track, ALL);
    expect(Object.keys(statuses).sort()).toEqual(["biology-credits", "chemistry-credits", "microbiology", "organic-or-biochem"]);
    expect(Object.values(statuses).every((s) => s === "satisfied")).toBe(true);
  });

  it("shows only microbiology missing without a microbiology course", async () => {
    const statuses = await statusesFor(track, without(ALL, ["BSCI223"]));
    expect(statuses["microbiology"]).toBe("missing");
    for (const [id, s] of Object.entries(statuses)) if (id !== "microbiology") expect(s, id).toBe("satisfied");
  });

  it("does not satisfy chemistry credits below 16", async () => {
    const statuses = await statusesFor(track, without(ALL, ["CHEM271", "CHEM272"]));
    expect(statuses["chemistry-credits"]).not.toBe("satisfied");
    expect(statuses["organic-or-biochem"]).toBe("satisfied");
  });

  it("does not satisfy organic chemistry or biochemistry without either", async () => {
    const statuses = await statusesFor(track, without(ALL, ["CHEM231", "CHEM232"]));
    expect(statuses["organic-or-biochem"]).not.toBe("satisfied");
  });
});
