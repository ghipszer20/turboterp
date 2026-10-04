// checkTrack: the audit plus plain-language issues (SOURCES.md / MAPPING_NOTES describe the
// underlying rules). A small hand-built track stands in for a real one so each rule can be
// tested in isolation from the real HPAO data.

import { describe, expect, it } from "vitest";
import type { Plan } from "@turboterp/plan";
import { checkTrack } from "../src/check.ts";
import type { Track } from "../src/types.ts";

const track: Track = {
  id: "test-track",
  name: "Test Track",
  schools: "test schools",
  minGrade: "C",
  minGradeNote: "Test schools require a C in every prerequisite.",
  entry: { kind: "after-degree" },
  categories: [
    {
      requirement: { kind: "course", id: "gen-chem", name: "General chemistry", options: ["CHEM131"] },
      source: "General chemistry",
      examContent: "mcat",
    },
    {
      requirement: { kind: "course", id: "calculus", name: "Calculus", options: ["MATH140"] },
      source: "Calculus",
      examCredit: "accepted",
    },
    { id: "medical-terminology", name: "Medical terminology", source: "Medical terminology" },
  ],
  milestones: [
    {
      id: "mcat",
      kind: "exam",
      name: "MCAT",
      detail: "Take the MCAT after finishing its content courses.",
      due: { year: -1, month: 6, day: 30 },
    },
    {
      id: "clinical",
      kind: "experience",
      name: "Clinical experience",
      detail: "At least 10 months of clinical experience.",
      due: { year: -2, month: 10 },
    },
  ],
  disclaimer: "Confirm with HPAO and each target school.",
  sources: ["https://example.test/track"],
  verified: false,
  reviewNotes: ["Test data, not a real track."],
};

const lawTrack: Track = {
  ...track,
  id: "test-law",
  categories: [],
  gpaProtection: true,
  milestones: [],
};

describe("checkTrack", () => {
  it("audits the plan against the track's requirements", async () => {
    const plan: Plan = { terms: [{ name: "Fall 2026", courses: [{ id: "CHEM131", status: "completed", grade: "A", credits: 3 }] }] };
    const result = await checkTrack(plan, track, { entryYear: 2028 });
    const chem = result.audit.requirements.find((r) => r.id === "gen-chem")!;
    expect(chem.status).toBe("satisfied");
    const calc = result.audit.requirements.find((r) => r.id === "calculus")!;
    expect(calc.status).toBe("missing");
  });

  it("flags AP/IB credit used for a prerequisite that doesn't accept it, but not one that does", async () => {
    const plan: Plan = {
      terms: [],
      priorCredit: [
        { id: "CHEM131", credits: 3, source: "AP Chemistry (5)" },
        { id: "MATH140", credits: 4, source: "AP Calculus AB (5)" },
      ],
    };
    const result = await checkTrack(plan, track, { entryYear: 2028 });
    const messages = result.issues.filter((i) => i.kind === "exam-credit").map((i) => i.message);
    expect(messages.some((m) => m.includes("CHEM131"))).toBe(true);
    expect(messages.some((m) => m.includes("MATH140"))).toBe(false);
  });

  it("doesn't flag dual-enrollment or transfer credit as AP/IB", async () => {
    const plan: Plan = { terms: [], priorCredit: [{ id: "CHEM131", credits: 3, source: "Montgomery College CHEM131" }] };
    const result = await checkTrack(plan, track, { entryYear: 2028 });
    expect(result.issues.some((i) => i.kind === "exam-credit")).toBe(false);
  });

  it("flags a pass/fail grade used for a prerequisite, and still counts it in the audit", async () => {
    const plan: Plan = { terms: [{ name: "Fall 2026", courses: [{ id: "CHEM131", status: "completed", grade: "P", credits: 3 }] }] };
    const result = await checkTrack(plan, track, { entryYear: 2028 });
    const chem = result.audit.requirements.find((r) => r.id === "gen-chem")!;
    expect(chem.status).toBe("satisfied");
    expect(result.issues.some((i) => i.kind === "pass-fail-credit" && i.message.includes("CHEM131"))).toBe(true);
  });

  it("flags a completed prerequisite graded below the track's minimum, and it doesn't satisfy the audit", async () => {
    const plan: Plan = { terms: [{ name: "Fall 2026", courses: [{ id: "CHEM131", status: "completed", grade: "C-", credits: 3 }] }] };
    const result = await checkTrack(plan, track, { entryYear: 2028 });
    const chem = result.audit.requirements.find((r) => r.id === "gen-chem")!;
    expect(chem.status).toBe("missing");
    const issue = result.issues.find((i) => i.kind === "low-grade");
    expect(issue?.message).toContain("CHEM131");
    expect(issue?.message).toContain("C-");
  });

  it("doesn't flag a planned (ungraded) course as a low grade", async () => {
    const plan: Plan = { terms: [{ name: "Fall 2026", courses: [{ id: "CHEM131", status: "planned", credits: 3 }] }] };
    const result = await checkTrack(plan, track, { entryYear: 2028 });
    expect(result.issues.some((i) => i.kind === "low-grade")).toBe(false);
  });

  it("flags an exam-content course planned at or after the exam's term", async () => {
    const plan: Plan = {
      terms: [
        { name: "Fall 2027", courses: [] },
        { name: "Spring 2028", courses: [{ id: "CHEM131", status: "planned", credits: 3 }] },
      ],
    };
    const result = await checkTrack(plan, track, { entryYear: 2028, examTerms: { mcat: "Spring 2028" } });
    const issue = result.issues.find((i) => i.kind === "exam-timing");
    expect(issue?.message).toContain("CHEM131");
    expect(issue?.message).toContain("MCAT");
  });

  it("doesn't flag an exam-content course planned before the exam's term", async () => {
    const plan: Plan = {
      terms: [
        { name: "Fall 2027", courses: [{ id: "CHEM131", status: "planned", credits: 3 }] },
        { name: "Spring 2028", courses: [] },
      ],
    };
    const result = await checkTrack(plan, track, { entryYear: 2028, examTerms: { mcat: "Spring 2028" } });
    expect(result.issues.some((i) => i.kind === "exam-timing")).toBe(false);
  });

  it("emits no exam-timing issue when the exam's term isn't in the plan", async () => {
    const plan: Plan = { terms: [{ name: "Fall 2027", courses: [{ id: "CHEM131", status: "planned", credits: 3 }] }] };
    const result = await checkTrack(plan, track, { entryYear: 2030, examTerms: { mcat: "Spring 2030" } });
    expect(result.issues.some((i) => i.kind === "exam-timing")).toBe(false);
  });

  it("reminds about milestones relative to the plan's terms", async () => {
    const plan: Plan = { terms: [{ name: "Fall 2026", courses: [] }] };
    const result = await checkTrack(plan, track, { entryYear: 2028 });
    const clinical = result.issues.find((i) => i.kind === "milestone" && i.message.includes("Clinical experience"));
    expect(clinical).toBeDefined();
    expect(clinical!.message).toContain("Fall 2026"); // due { year: -2, month: 10 } => Oct 2026, matches the plan's only term
    const mcat = result.issues.find((i) => i.kind === "milestone" && i.message.includes("MCAT"));
    expect(mcat!.message).toContain("after your last planned term"); // due { year: -1, month: 6 } => Summer 2027, after Fall 2026
  });

  it("infers the entry year from the plan when not given (after-degree: the year after a fall final term)", async () => {
    const plan: Plan = { terms: [{ name: "Fall 2029", courses: [{ id: "CHEM131", status: "completed", grade: "A", credits: 3 }] }] };
    const result = await checkTrack(plan, track, {});
    // entryYear inferred as 2030 (Fall 2029 + 1); the MCAT (due year -1) should read 2029.
    const mcat = result.issues.find((i) => i.kind === "milestone" && i.message.includes("MCAT"));
    expect(mcat!.message).toContain("2029");
  });

  it("skips milestone reminders when the entry year can't be inferred", async () => {
    const plan: Plan = { terms: [{ name: "Term A", courses: [] }] };
    const result = await checkTrack(plan, track, {});
    expect(result.issues.some((i) => i.kind === "milestone")).toBe(false);
  });

  it("audits a track with no course categories (pre-law) without error", async () => {
    const plan: Plan = { terms: [{ name: "Fall 2026", courses: [] }] };
    const result = await checkTrack(plan, lawTrack, { entryYear: 2029 });
    expect(result.audit.requirements).toEqual([]);
  });

  it("warns about GPA protection when a term's expected grades would lower the GPA", async () => {
    const plan: Plan = {
      terms: [
        { name: "Fall 2026", courses: [{ id: "HIST200", status: "completed", grade: "A", credits: 3 }] },
        { name: "Spring 2027", courses: [{ id: "PHIL170", status: "planned", credits: 3 }, { id: "GVPT170", status: "planned", credits: 3 }] },
      ],
    };
    const result = await checkTrack(plan, lawTrack, {
      entryYear: 2029,
      expectedGrades: { "Spring 2027": { PHIL170: "C-", GVPT170: "C" } },
    });
    const issue = result.issues.find((i) => i.kind === "gpa-protection");
    expect(issue?.message).toContain("Spring 2027");
  });

  it("doesn't warn about GPA protection when expected grades hold GPA steady or raise it", async () => {
    const plan: Plan = {
      terms: [
        { name: "Fall 2026", courses: [{ id: "HIST200", status: "completed", grade: "B", credits: 3 }] },
        { name: "Spring 2027", courses: [{ id: "PHIL170", status: "planned", credits: 3 }] },
      ],
    };
    const result = await checkTrack(plan, lawTrack, { entryYear: 2029, expectedGrades: { "Spring 2027": { PHIL170: "A" } } });
    expect(result.issues.some((i) => i.kind === "gpa-protection")).toBe(false);
  });

  it("doesn't apply GPA protection to a track that doesn't opt in", async () => {
    const plan: Plan = {
      terms: [
        { name: "Fall 2026", courses: [{ id: "CHEM131", status: "completed", grade: "A", credits: 3 }] },
        { name: "Spring 2027", courses: [{ id: "MATH140", status: "planned", credits: 4 }] },
      ],
    };
    const result = await checkTrack(plan, track, { entryYear: 2029, expectedGrades: { "Spring 2027": { MATH140: "F" } } });
    expect(result.issues.some((i) => i.kind === "gpa-protection")).toBe(false);
  });
});
