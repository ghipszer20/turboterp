// Batch C pre-professional tracks (CPA in Maryland, actuarial VEE, pre-medical physics): a
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

describe("cpa-maryland plans", () => {
  const track = trackOf("cpa-maryland");
  const ACCOUNTING = ["BMGT220", "BMGT221", "BMGT310", "BMGT311", "BMGT321", "BMGT323", "BMGT326", "BMGT422", "BMGT411", "BMGT417"];
  const ALL = [
    ...ACCOUNTING.map((id) => course(id, 3)),
    course("BMGT380", 3),
    course("STAT100", 3),
    course("STAT400", 3),
    course("ECON200", 3),
    course("ECON201", 3),
    course("BMGT340", 3),
    course("BMGT110", 3),
    course("ELECTIVES", 99),
  ];

  it("has no science GPA and no minimum grade", () => {
    expect(track.usesScienceGpa).not.toBe(true);
    expect(track.minGrade).toBeUndefined();
  });

  it("satisfies every requirement with 30 accounting, 18 business, business law, ethics and 150 total credits", async () => {
    const statuses = await statusesFor(track, ALL);
    expect(Object.keys(statuses).sort()).toEqual(["accounting-credits", "business-credits", "business-law", "ethics", "total-credits"]);
    for (const [id, status] of Object.entries(statuses)) expect(status, id).toBe("satisfied");
  });

  it("fails only accounting when 27 accounting credits are left", async () => {
    const statuses = await statusesFor(track, without(ALL, ["BMGT417"]));
    expect(statuses["accounting-credits"]).not.toBe("satisfied");
    expect(statuses["business-credits"]).toBe("satisfied");
    expect(statuses["ethics"]).toBe("satisfied");
  });

  it("fails ethics without BMGT411", async () => {
    const statuses = await statusesFor(track, without(ALL, ["BMGT411"]));
    expect(statuses["ethics"]).not.toBe("satisfied");
  });

  it("fails business credits at 15", async () => {
    const statuses = await statusesFor(track, without(ALL, ["BMGT110"]));
    expect(statuses["business-credits"]).not.toBe("satisfied");
  });

  it("fails the total below 150 credits", async () => {
    const statuses = await statusesFor(track, without(ALL, ["ELECTIVES"]));
    expect(statuses["total-credits"]).not.toBe("satisfied");
  });

  it("has a CPA exam milestone and review notes about the summarized figures", () => {
    expect(track.milestones.some((m) => m.kind === "exam")).toBe(true);
    expect(track.reviewNotes.join(" ")).toMatch(/\(S\)/);
  });
});

describe("actuarial-vee plans", () => {
  const track = trackOf("actuarial-vee");
  const ALL = ["ECON200", "ECON201", "BMGT220", "BMGT340", "STAT400", "STAT401"].map((id) => course(id, 3));

  it("has no science GPA", () => {
    expect(track.usesScienceGpa).not.toBe(true);
  });

  it("satisfies the three VEE topics", async () => {
    const statuses = await statusesFor(track, ALL);
    expect(Object.keys(statuses).sort()).toEqual(["accounting-finance", "economics", "mathematical-statistics"]);
    for (const [id, status] of Object.entries(statuses)) expect(status, id).toBe("satisfied");
  });

  it("accepts STAT410 in place of STAT401", async () => {
    const statuses = await statusesFor(track, [...without(ALL, ["STAT401"]), course("STAT410", 3)]);
    expect(statuses["mathematical-statistics"]).toBe("satisfied");
  });

  it("fails only economics without ECON201", async () => {
    const statuses = await statusesFor(track, without(ALL, ["ECON201"]));
    expect(statuses["economics"]).not.toBe("satisfied");
    expect(statuses["accounting-finance"]).toBe("satisfied");
  });

  it("asks the student to confirm courses in the SOA VEE directory", () => {
    expect(track.reviewNotes.join(" ")).toMatch(/confirm in the SOA VEE directory/i);
    expect(track.milestones.filter((m) => m.kind === "exam").length).toBeGreaterThanOrEqual(2);
  });
});

describe("pre-medical-physics plans", () => {
  const track = trackOf("pre-medical-physics");
  const ALL = ["PHYS161", "PHYS260", "PHYS261", "PHYS270", "PHYS271", "PHYS401", "PHYS404", "PHYS411"].map((id) => course(id, 3));

  it("keeps the default science GPA", () => {
    expect(track.usesScienceGpa).toBe(true);
  });

  it("satisfies the intro sequence and three upper-level physics courses", async () => {
    const statuses = await statusesFor(track, ALL);
    expect(Object.keys(statuses).sort()).toEqual(["intro-physics", "upper-physics"]);
    for (const [id, status] of Object.entries(statuses)) expect(status, id).toBe("satisfied");
  });

  it("accepts the physics majors' PHYS171/272/273 as the intro sequence", async () => {
    const plan = [course("PHYS171", 3), course("PHYS272", 3), course("PHYS273", 3), ...ALL.slice(5)];
    expect((await statusesFor(track, plan))["intro-physics"]).toBe("satisfied");
  });

  it("doesn't count PHYS172 (Succeeding in Physics, 1 credit) as part of a sequence", async () => {
    const plan = [course("PHYS171", 3), course("PHYS172", 1), ...ALL.slice(5)];
    expect((await statusesFor(track, plan))["intro-physics"]).not.toBe("satisfied");
  });

  it("needs the whole engineering sequence, including PHYS270/271", async () => {
    const plan = without(ALL, ["PHYS270", "PHYS271"]);
    expect((await statusesFor(track, plan))["intro-physics"]).not.toBe("satisfied");
  });

  it("fails upper-level physics with only two courses", async () => {
    const statuses = await statusesFor(track, without(ALL, ["PHYS411"]));
    expect(statuses["upper-physics"]).not.toBe("satisfied");
    expect(statuses["intro-physics"]).toBe("satisfied");
  });
});
