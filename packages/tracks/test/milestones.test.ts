// trackMilestoneTimings: each milestone's timing relative to the plan, structured (not just a
// message string), so a UI can lay milestones out on the plan's own timeline term by term.
// milestoneIssues (check.ts) builds its message text from this same function, so the two can't
// disagree.

import { describe, expect, it } from "vitest";
import type { Plan } from "@turboterp/plan";
import { trackMilestoneTimings } from "../src/check.ts";
import type { Track } from "../src/types.ts";

const track: Track = {
  id: "test-track",
  name: "Test Track",
  schools: "test schools",
  entry: { kind: "after-degree" },
  categories: [],
  milestones: [
    { id: "mcat", kind: "exam", name: "MCAT", detail: "Take the MCAT.", due: { year: -1, month: 6, day: 30 } },
    { id: "clinical", kind: "experience", name: "Clinical experience", detail: "Get clinical experience.", due: { year: -2, month: 10 } },
    { id: "pick-a-major", kind: "advising", name: "Pick a major", detail: "There's no required major." },
  ],
  disclaimer: "Confirm with HPAO.",
  sources: ["https://example.test"],
  verified: false,
  reviewNotes: [],
};

describe("trackMilestoneTimings", () => {
  it("matches a milestone's date to the plan term it falls in", () => {
    const plan: Plan = { terms: [{ name: "Fall 2026", courses: [] }] };
    const timings = trackMilestoneTimings(plan, track, 2028);
    const clinical = timings.find((t) => t.milestone.id === "clinical")!;
    expect(clinical.year).toBe(2026);
    expect(clinical.monthName).toBe("October");
    expect(clinical.term).toBe("Fall 2026");
    expect(clinical.afterLast).toBe(false);
  });

  it("flags a milestone due after the plan's last term", () => {
    const plan: Plan = { terms: [{ name: "Fall 2026", courses: [] }] };
    const timings = trackMilestoneTimings(plan, track, 2028);
    const mcat = timings.find((t) => t.milestone.id === "mcat")!;
    expect(mcat.term).toBeNull();
    expect(mcat.afterLast).toBe(true);
  });

  it("leaves out a milestone with no start or due date", () => {
    const plan: Plan = { terms: [{ name: "Fall 2026", courses: [] }] };
    const timings = trackMilestoneTimings(plan, track, 2028);
    expect(timings.some((t) => t.milestone.id === "pick-a-major")).toBe(false);
  });

  it("infers the entry year from the plan when not given", () => {
    const plan: Plan = { terms: [{ name: "Fall 2029", courses: [] }] };
    const timings = trackMilestoneTimings(plan, track);
    const mcat = timings.find((t) => t.milestone.id === "mcat")!;
    expect(mcat.year).toBe(2029); // entryYear inferred 2030 (Fall 2029 + 1), due year -1 => 2029
  });

  it("returns nothing when the entry year can't be inferred", () => {
    const plan: Plan = { terms: [{ name: "Term A", courses: [] }] };
    expect(trackMilestoneTimings(plan, track)).toEqual([]);
  });

  it("returns nothing for an empty plan", () => {
    expect(trackMilestoneTimings({ terms: [] }, track, 2028)).toEqual([]);
  });
});
