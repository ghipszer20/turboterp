import { describe, expect, it } from "vitest";
import { buildPlanExport, CATEGORY_COLORS, DISCLAIMER, exportFileName } from "./plan-export";

const audit = (id: string, name: string, layer: string | undefined, assigned: string[][]) => ({
  program: { id, name, ...(layer ? { layer } : {}) },
  requirements: assigned.map((a, i) => ({ requirement: { id: `r${i}`, name: `R${i}` }, result: { id: `r${i}`, name: `R${i}`, status: "satisfied", assigned: a }, gap: null })),
});

const plan = {
  terms: [
    { name: "Fall 2026", courses: [{ id: "CMSC131", grade: "A" }, { id: "MATH140" }, { id: "ENGL101" }, { id: "ART100", credits: 2 }] },
    { name: "Spring 2027", courses: [{ id: "CMSC132", grade: "B+" }] },
  ],
};
const analysis = {
  audits: [
    audit("cmsc-major", "Computer Science", undefined, [["CMSC131", "CMSC132"]]),
    audit("math-minor", "Math Minor", undefined, [["MATH140", "CMSC131"]]),
    audit("gen-ed", "General Education", "gen-ed", [["ENGL101"]]),
  ],
};
const catalog = new Map([
  ["CMSC131", { title: "OOP I", credits: { min: 4 } }],
  ["MATH140", { title: "Calc I", credits: { min: 4 } }],
]);
const build = (hideGrades = false, name?: string) =>
  buildPlanExport({ plan, analysis, catalog, programKinds: { "cmsc-major": "major", "math-minor": "minor" }, today: new Date(2026, 8, 29), hideGrades, name } as never);

describe("buildPlanExport", () => {
  it("fills a small header and nothing else beyond the grid", () => {
    const e = build(false, "Sam");
    expect(e.header).toEqual({ name: "Sam", date: "2026-09-29", disclaimer: DISCLAIMER, gradesHidden: false });
    expect(Object.keys(e).sort()).toEqual(["catalogYear", "creditsPlanned", "header", "priorCreditCredits", "programsLabel", "terms"]);
    expect(DISCLAIMER).toMatch(/unofficial/i);
  });
  it("categorizes each course by the program it was assigned to (major beats minor beats Gen Ed)", () => {
    const [t1, t2] = build().terms;
    const cat = (id: string) => t1!.courses.find((c) => c.id === id)!.category;
    expect(cat("CMSC131")).toBe("major");
    expect(cat("MATH140")).toBe("minor");
    expect(cat("ENGL101")).toBe("gen-ed");
    expect(cat("ART100")).toBe("elective");
    expect(t2!.courses[0]!.category).toBe("major");
    expect(Object.keys(CATEGORY_COLORS).sort()).toEqual(["elective", "gen-ed", "major", "minor", "other"]);
  });
  it("carries credits (override, then catalog), titles and grades; hideGrades blanks grades", () => {
    const c = build().terms[0]!.courses;
    expect(c.find((x) => x.id === "ART100")!.credits).toBe(2);
    expect(c.find((x) => x.id === "CMSC131")).toMatchObject({ credits: 4, title: "OOP I", grade: "A" });
    expect(build(true).terms.flatMap((t) => t.courses).every((x) => x.grade === "")).toBe(true);
  });
});

describe("buildPlanExport PDF fields", () => {
  it("carries programs, catalog year, credits planned, prior credit and per-term key dates", () => {
    const e = buildPlanExport({
      plan, analysis, catalog, today: new Date(2026, 8, 29),
      programsLabel: "Computer Science", catalogYear: "2026-27", priorCreditCredits: 8, keyDates: { "Fall 2026": "Add/drop Sep 8" },
    } as never);
    expect(e).toMatchObject({ programsLabel: "Computer Science", catalogYear: "2026\u201327", priorCreditCredits: 8, creditsPlanned: 4 + 4 + 2 });
    expect(e.terms[0]!.keyDates).toBe("Add/drop Sep 8");
    expect("keyDates" in e.terms[1]!).toBe(false);
  });
});

describe("exportFileName", () => {
  it("names the download by kind and date, never 'takeout'", () => {
    expect(exportFileName("xlsx", "2026-09-29")).toBe("turboterp-4-year-plan-2026-09-29.xlsx");
    expect(exportFileName("pdf", "2026-09-29")).toBe("turboterp-4-year-plan-2026-09-29.pdf");
  });
});
