import { describe, expect, it } from "vitest";
import type { Analysis } from "@turboterp/app-core/analysis";
import { buildAuditView, milestoneBuckets, toneOf } from "../src/advisor/audit-view-model";

const program = { id: "cmsc-major", name: "Computer Science Major", verified: true, catalogYear: "2026-27", source: "UMD Undergraduate Catalog" };
const req = (id: string, name: string) => ({ id, name, kind: "courses" });
const res = (id: string, status: string, assigned: string[], extra = {}) => ({ id, name: id, status, assigned, ...extra });

function analysis(over: Partial<Record<string, unknown>> = {}): Analysis {
  return {
    notices: [],
    degrees: null,
    gateway: null,
    tracks: [],
    scienceGpa: { gpa: null, credits: 0, byCategory: {} },
    autoChoices: {},
    auditRuns: 1,
    ms: 5,
    audits: [
      {
        program,
        requirements: [
          { requirement: req("r1", "Intro"), result: res("r1", "satisfied", ["CMSC131"]), display: "satisfied", gap: null },
          {
            requirement: req("r2", "Upper level"),
            result: res("r2", "missing", [], { belowMinimum: [{ course: "MATH140", grade: "D", minGrade: "C-" }], gpa: { value: 1.9, min: 2, atRisk: true } }),
            display: "missing",
            gap: { need: "3 more courses", suggestions: ["CMSC411"], note: "Pick any two." },
          },
          { requirement: { id: "s1", kind: "openSlot", name: "Approved elective", credits: 3, note: "Ask advisor" }, result: res("s1", "missing", []), display: "missing", gap: null },
        ],
        gpa: res("gpa", "partial", [], { name: "Program GPA" }),
        total: 4,
        satisfied: 1,
        inProgress: 0,
      },
    ],
    ...over,
  } as unknown as Analysis;
}

const plan = { programs: ["cmsc-major"], terms: [{ name: "Fall 2026" }, { name: "Spring 2027" }] } as never;

describe("buildAuditView", () => {
  const vm = buildAuditView(analysis(), plan);
  const p = vm.programs[0]!;

  it("summarizes each program and cites its catalog year and rule source", () => {
    expect(p.name).toBe("Computer Science Major");
    expect(p.summary).toBe("1 of 4 requirements met");
    expect(p.citation).toBe("Catalog 2026–27 · UMD Undergraduate Catalog");
    expect(p.unverified).toBe(false);
  });

  it("turns each requirement into plain-language rows", () => {
    const [r1, r2] = p.rows;
    expect(r1).toMatchObject({ kind: "req", name: "Intro", tone: "open", counted: ["CMSC131"], gap: null });
    expect(r2).toMatchObject({ kind: "req", tone: "closed", gap: { text: "Still needed: 3 more courses", suggestions: ["CMSC411"], note: "Pick any two." } });
    expect((r2 as { notes: string[] }).notes).toEqual([
      "MATH140 (D) doesn't count: this requirement needs C- or better.",
      "GPA in these courses: 1.90 (needs 2.0 or higher). Below the minimum so far: the courses you still have planned need to raise it.",
    ]);
  });

  it("shows an open slot as 'Confirm with your advisor' with its key, and Confirmed once ticked", () => {
    const slot = p.rows[2]!;
    expect(slot).toMatchObject({ kind: "slot", key: "cmsc-major/s1", name: "Approved elective", credits: 3, confirmed: false, statusLabel: "Confirm with your advisor" });
    const done = buildAuditView(analysis(), plan).programs[0]!;
    expect(done.rows[2]).toMatchObject({ statusLabel: "Confirm with your advisor" });
    const ticked = buildAuditView(
      analysis({
        audits: [{ ...(analysis().audits[0] as object), requirements: [{ requirement: { id: "s1", kind: "openSlot", name: "x" }, result: res("s1", "satisfied", []), display: "satisfied", gap: null }] }],
      }),
      plan,
    ).programs[0]!;
    expect(ticked.rows[0]).toMatchObject({ kind: "slot", confirmed: true, statusLabel: "Confirmed" });
  });

  it("adds the program GPA row last", () => {
    expect(p.rows.at(-1)).toMatchObject({ kind: "req", name: "Program GPA", tone: "soon" });
  });
});

describe("toneOf and milestoneBuckets", () => {
  it("maps statuses to the app's colors", () => {
    expect([toneOf("satisfied"), toneOf("in-progress"), toneOf("partial"), toneOf("missing")]).toEqual(["open", "soon", "soon", "closed"]);
  });
  it("groups milestones onto the plan's terms, then after the plan", () => {
    const m = (id: string, term: string | null, year: number, afterLast = false) => ({ milestone: { id }, term, year, afterLast }) as never;
    const buckets = milestoneBuckets([m("a", "Spring 2027", 2027), m("b", null, 2029, true), m("c", "Fall 2026", 2026)], ["Fall 2026", "Spring 2027"]);
    expect(buckets.map((b) => b.label)).toEqual(["Fall 2026", "Spring 2027", "After your last planned term"]);
  });
});
