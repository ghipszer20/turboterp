import { describe, expect, it } from "vitest";
import type { PriorInputs } from "@turboterp/app-core/plan-state";
import { removePriorEntry } from "@turboterp/app-core/prior-credit";
import { addAp, addDual, addIb, buildCreditCaps, countedWhere, dualValid, earnText, setChoice, termOfCourses } from "../src/advisor/credit-view-model";

const empty: PriorInputs = { ap: [], ib: [], dual: [], choices: {} };

describe("prior credit edits", () => {
  it("adds and removes an AP exam in one step", () => {
    const p = addAp(empty, "k1", "Calculus BC", 5);
    expect(p.ap).toEqual([{ key: "k1", exam: "Calculus BC", score: 5 }]);
    expect(removePriorEntry(p, "ap", "k1").ap).toEqual([]);
  });
  it("adds an IB exam with its level", () => {
    expect(addIb(empty, "k", "Psychology", "HL", 6).ib[0]).toEqual({ key: "k", exam: "Psychology", level: "HL", score: 6 });
  });
  it("trims dual enrollment and upper-cases the UMD course", () => {
    const d = { institution: " Montgomery College ", course: " MATH181 ", credits: 4, elective: false, umd: " math141 " };
    expect(dualValid(d)).toBe(true);
    expect(addDual(empty, "k", d).dual[0]).toMatchObject({ institution: "Montgomery College", course: "MATH181", umd: "MATH141" });
  });
  it("needs a UMD equivalent unless the credit is elective", () => {
    const d = { institution: "X", course: "Y", credits: 3, elective: false, umd: "" };
    expect(dualValid(d)).toBe(false);
    expect(dualValid({ ...d, elective: true })).toBe(true);
    expect(dualValid({ ...d, institution: " ", elective: true })).toBe(false);
  });
  it("sets a pick and returns to automatic with an empty id", () => {
    const p = setChoice(empty, "AP US History (4)", "HIST201");
    expect(p.choices).toEqual({ "AP US History (4)": "HIST201" });
    expect(setChoice(p, "AP US History (4)", "").choices).toEqual({});
  });
  it("describes an award", () => {
    expect(earnText({ kind: "generic", label: "Elective", credits: 3, genEd: [] })).toBe("Elective · 3 cr");
    expect(earnText({ kind: "choice", credits: 3, options: [{ id: "HIST200", genEd: [] }, { id: "HIST201", genEd: [] }], picked: null })).toBe("3 cr: HIST200 or HIST201");
  });
});

describe("where courses sit", () => {
  it("maps each course to its first term and labels counted courses", () => {
    const where = termOfCourses([
      { name: "Fall 2026", courses: [{ id: "MATH140" }] },
      { name: "Spring 2027", courses: [{ id: "MATH140" }, { id: "CHEM135" }] },
    ]);
    expect(countedWhere(["MATH140", "CHEM135", "BIOL105"], where)).toBe("MATH140 (Fall 2026), CHEM135 (Spring 2027), BIOL105");
  });
});

describe("buildCreditCaps", () => {
  const terms = [
    { name: "Fall 2026", courses: [{ id: "A" }, { id: "B" }, { id: "C" }] },
    { name: "Spring 2027", courses: [{ id: "A" }, { id: "Z" }] },
    { name: "Winter 2027", courses: [] },
  ];
  const creditsOf = (c: { id: string }) => (c.id === "Z" ? null : 6);
  it("uses the college's own limit and flags an over-cap term", () => {
    const v = buildCreditCaps({ college: "CMNS", terms, creditsOf });
    expect(v.collegeLabel).toContain("Computer");
    expect(v.rules.find((r) => r.season === "Fall")!.max).toBe(17);
    expect(v.terms[0]).toMatchObject({ name: "Fall 2026", credits: 18, max: 17, status: "over" });
    expect(v.terms[0]!.text).toContain("needs your dean's approval");
  });
  it("marks unknown credits as a lower bound and handles winter", () => {
    const v = buildCreditCaps({ college: undefined, terms, creditsOf });
    expect(v.usesDefault).toBe(true);
    expect(v.terms[1]).toMatchObject({ credits: 6, approx: true, status: "ok" });
    expect(v.terms[1]!.text).toBe("6+ of 20 credits.");
    expect(v.terms[2]).toMatchObject({ max: 4, status: "ok" });
  });
});
