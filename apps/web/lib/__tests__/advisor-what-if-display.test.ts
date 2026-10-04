// Pure display helpers for the What-if tab (owner rulings, docs/project/feature-modules.md):
// "show how existing credits apply to the new major (count / become electives / unused)", "the
// catalog year for the new major", and "the internal-transfer requirements (gateway courses and
// GPA)". These are tested here, apart from WhatIfView.tsx, because the repo has no component-
// render test setup (every other Advisor view is covered the same way, at the lib level).

import type { CourseWhatIf } from "@turboterp/plan/what-if";
import { describe, expect, it } from "vitest";
import { addedProgramNotes, completedCreditTotals, gatewayAttemptLimitNote, gatewayRuleText } from "../advisor/what-if-display";

describe("gatewayRuleText", () => {
  it("states the Fall-2024-or-later rule's grade and GPA minimums", () => {
    expect(gatewayRuleText({ name: "fall-2024-or-later", minGrade: "B-", minGpa: 3.0 })).toBe(
      "Matriculated Fall 2024 or later: every gateway course B- or better, cumulative GPA 3.0 or higher.",
    );
  });

  it("states the pre-Fall-2024 rule's grade and GPA minimums", () => {
    expect(gatewayRuleText({ name: "spring-2024-or-earlier", minGrade: "C-", minGpa: 2.7 })).toBe(
      "Matriculated before Fall 2024: every gateway course C- or better, cumulative GPA 2.7 or higher.",
    );
  });
});

describe("gatewayAttemptLimitNote", () => {
  it("is null when the repeat limit isn't violated", () => {
    expect(gatewayAttemptLimitNote({ attemptLimitViolated: false })).toBeNull();
  });

  it("cites the CS LEP repeat-limit policy when the limit is violated", () => {
    const note = gatewayAttemptLimitNote({ attemptLimitViolated: true });
    expect(note).toMatch(/one gateway course/i);
    expect(note).toMatch(/repeated once/i);
    expect(note).toMatch(/undergrad\.cs\.umd\.edu/);
  });
});

describe("addedProgramNotes", () => {
  it("names a newly proposed major with its catalog year", () => {
    const notes = addedProgramNotes([], ["cmsc-major"]);
    expect(notes).toEqual([{ id: "cmsc-major", name: "Computer Science Major", catalogYear: "2026-27", verified: false }]);
  });

  it("lists nothing for a program dropped, not added", () => {
    expect(addedProgramNotes(["cmsc-major"], [])).toEqual([]);
  });

  it("lists nothing when the proposed set matches the current one", () => {
    expect(addedProgramNotes(["cmsc-major"], ["cmsc-major"])).toEqual([]);
  });

  it("lists the new track only, when switching tracks of the same major", () => {
    const notes = addedProgramNotes(["math-major-applied"], ["math-major-traditional"]);
    expect(notes.map((n) => n.id)).toEqual(["math-major-traditional"]);
  });
});

const course = (over: Partial<CourseWhatIf>): CourseWhatIf => ({
  id: "CMSC131",
  status: "completed",
  credits: 4,
  currentStatus: "counts",
  proposedStatus: "counts",
  currentPrograms: [],
  proposedPrograms: [],
  earnsCredit: true,
  ...over,
});

describe("completedCreditTotals", () => {
  it("sums completed credits by their proposed status", () => {
    const totals = completedCreditTotals([
      course({ proposedStatus: "counts", credits: 4 }),
      course({ proposedStatus: "counts", credits: 3 }),
      course({ proposedStatus: "elective", credits: 3 }),
      course({ proposedStatus: "unused", credits: 4 }),
    ]);
    expect(totals).toEqual({ counts: 7, elective: 3, unused: 4 });
  });

  it("ignores not-yet-taken (planned) courses -- only existing credits count", () => {
    const totals = completedCreditTotals([course({ status: "planned", proposedStatus: "counts", credits: 10 })]);
    expect(totals).toEqual({ counts: 0, elective: 0, unused: 0 });
  });

  it("is all zero with no courses", () => {
    expect(completedCreditTotals([])).toEqual({ counts: 0, elective: 0, unused: 0 });
  });

  it("doesn't let a failed or withdrawn attempt's credits appear in any total, whatever bucket it landed in", () => {
    // A completed course that earns no credit (F/W) shouldn't count as "credits you've already
    // earned", no matter which of the three statuses it happens to carry.
    const totals = completedCreditTotals([
      course({ proposedStatus: "counts", credits: 4, earnsCredit: false }),
      course({ proposedStatus: "elective", credits: 3, earnsCredit: false }),
      course({ proposedStatus: "unused", credits: 3, earnsCredit: false }),
      course({ proposedStatus: "counts", credits: 4, earnsCredit: true }),
    ]);
    expect(totals).toEqual({ counts: 4, elective: 0, unused: 0 });
  });
});
