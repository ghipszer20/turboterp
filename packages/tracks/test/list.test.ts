// examMilestone: the exam a track's categories point to via examContent, when there's exactly
// one. Used by the UI to ask "when's your MCAT?" without hard-coding milestone ids per track.

import { describe, expect, it } from "vitest";
import { examMilestone, TRACKS } from "../src/list.ts";
import type { Track } from "../src/types.ts";

const withExam: Track = {
  id: "test-with-exam",
  name: "Test With Exam",
  schools: "test schools",
  entry: { kind: "after-degree" },
  categories: [
    { requirement: { kind: "course", id: "gen-chem", name: "General chemistry", options: ["CHEM131"] }, source: "Gen chem", examContent: "mcat" },
    { requirement: { kind: "course", id: "calc", name: "Calculus", options: ["MATH140"] }, source: "Calculus" },
  ],
  milestones: [
    { id: "mcat", kind: "exam", name: "MCAT", detail: "Take the MCAT." },
    { id: "clinical", kind: "experience", name: "Clinical experience", detail: "Get clinical experience." },
  ],
  disclaimer: "Confirm with HPAO.",
  sources: ["https://example.test"],
  verified: false,
  reviewNotes: [],
};

const noExam: Track = { ...withExam, id: "test-no-exam", categories: [{ ...withExam.categories[1]! }] };

const twoExams: Track = {
  ...withExam,
  id: "test-two-exams",
  categories: [...withExam.categories, { requirement: { kind: "course", id: "physics", name: "Physics", options: ["PHYS131"] }, source: "Physics", examContent: "dat" }],
  milestones: [...withExam.milestones, { id: "dat", kind: "exam", name: "DAT", detail: "Take the DAT." }],
};

const noCategories: Track = { ...withExam, id: "test-no-categories", categories: [] };

describe("examMilestone", () => {
  it("returns the milestone a track's categories reference via examContent", () => {
    expect(examMilestone(withExam)?.id).toBe("mcat");
  });

  it("returns undefined when no category has examContent", () => {
    expect(examMilestone(noExam)).toBeUndefined();
  });

  it("returns undefined when categories reference more than one exam", () => {
    expect(examMilestone(twoExams)).toBeUndefined();
  });

  it("returns undefined when the track has no categories (pre-law)", () => {
    expect(examMilestone(noCategories)).toBeUndefined();
  });

  it("returns undefined when the referenced milestone id isn't in the track's own milestones", () => {
    const track: Track = { ...withExam, milestones: [withExam.milestones[1]!] };
    expect(examMilestone(track)).toBeUndefined();
  });
});

describe("TRACKS", () => {
  it("lists all twenty-two encoded tracks, each unverified", () => {
    expect(TRACKS).toHaveLength(22);
    expect(TRACKS.every((t) => t.verified === false)).toBe(true);
  });
});
