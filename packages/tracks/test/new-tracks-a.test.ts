// Batch A of the new tracks (docs/project/new-tracks-research.md): a realistic plan satisfies every
// requirement of each track, and dropping one category's courses shows exactly that requirement
// missing. Same shape as new-tracks.test.ts.

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

describe("pre-slp plans", () => {
  const track = trackOf("pre-slp");
  const ALL_COURSES = [course("BSCI170", 3), course("BSCI180", 1), course("CHEM131", 3), course("PSYC100", 3), course("STAT100", 3)];

  it("satisfies every requirement with a realistic course list", async () => {
    const statuses = await statusesFor(track, ALL_COURSES);
    expect(Object.keys(statuses).sort()).toEqual(["biology", "chemistry-or-physics", "social-behavioral", "statistics"]);
    expect(Object.values(statuses).every((s) => s === "satisfied")).toBe(true);
  });

  it.each([
    ["biology", ["BSCI170", "BSCI180"]],
    ["chemistry-or-physics", ["CHEM131"]],
    ["social-behavioral", ["PSYC100"]],
    ["statistics", ["STAT100"]],
  ])("shows only %s missing when its courses are dropped", async (category, ids) => {
    const statuses = await statusesFor(track, ALL_COURSES.filter((c) => !ids.includes(c.id)));
    expect(statuses[category]).toBe("missing");
    for (const [id, status] of Object.entries(statuses)) if (id !== category) expect(status, id).toBe("satisfied");
  });

  it("accepts physics instead of chemistry, and sociology instead of psychology", async () => {
    const swapped = [course("BSCI170", 3), course("BSCI180", 1), course("PHYS121", 4), course("SOCY100", 3), course("STAT400", 3)];
    const statuses = await statusesFor(track, swapped);
    expect(Object.values(statuses).every((s) => s === "satisfied")).toBe(true);
  });

  it("suggests the communication-sciences background without requiring it", () => {
    const suggested = track.suggestedCourses!.flatMap((s) => s.courses);
    expect(suggested).toEqual(expect.arrayContaining(["HESP202", "HESP313", "LING200"]));
  });
});

describe("pre-art-therapy plans", () => {
  const track = trackOf("pre-art-therapy");
  const STUDIO = ["ARTT100", "ARTT110", "ARTT200", "ARTT210", "ARTT255", "ARTT320"];
  const ALL_COURSES = [...STUDIO.map((id) => course(id, 3)), course("PSYC100", 3), course("PSYC353", 3), course("PSYC355", 3)];

  it("satisfies every requirement with a realistic course list", async () => {
    const statuses = await statusesFor(track, ALL_COURSES);
    expect(Object.keys(statuses).sort()).toEqual(["abnormal-psych", "developmental-psych", "psychology", "studio-art"]);
    expect(Object.values(statuses).every((s) => s === "satisfied")).toBe(true);
  });

  it("does not show studio art satisfied when it falls under 18 credits", async () => {
    const statuses = await statusesFor(track, ALL_COURSES.filter((c) => c.id !== "ARTT320"));
    expect(statuses["studio-art"]).not.toBe("satisfied");
    for (const [id, status] of Object.entries(statuses)) if (id !== "studio-art") expect(status, id).toBe("satisfied");
  });

  it.each([
    ["abnormal-psych", "PSYC353"],
    ["developmental-psych", "PSYC355"],
    ["psychology", "PSYC100"],
  ])("shows only %s missing when its course is dropped", async (category, dropped) => {
    const statuses = await statusesFor(track, ALL_COURSES.filter((c) => c.id !== dropped));
    expect(statuses[category]).toBe("missing");
    for (const [id, status] of Object.entries(statuses)) if (id !== category) expect(status, id).toBe("satisfied");
  });

  it("flags the program-norm credit numbers as unverified search-summary figures", () => {
    expect(track.reviewNotes.join(" ")).toContain("(S)");
  });
});
