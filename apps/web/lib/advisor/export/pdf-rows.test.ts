import { describe, expect, it } from "vitest";
import { pdfRows } from "./pdf-rows";
import type { PlanExport } from "./plan-export";

const c = (id: string, credits: number, category: PlanExport["terms"][number]["courses"][number]["category"], grade = "", title = "T") => ({ id, title, credits, grade, category });
const data = {
  header: { name: "", date: "2026-09-29", disclaimer: "d", gradesHidden: false },
  programsLabel: "CS", catalogYear: "2026–27", creditsPlanned: 0, priorCreditCredits: 0,
  terms: [
    { name: "Fall 2026", credits: 7, courses: [c("CMSC131", 4, "major", "A"), c("ENGL101", 3, "gen-ed")] },
    { name: "Spring 2027", credits: 3, courses: [c("MATH140", 3, "minor", "B", "x".repeat(60))] },
    { name: "Summer 2027", credits: 3, courses: [c("ART100", 3, "other")], keyDates: "k" },
    { name: "Fall 2027", credits: 3, courses: [c("ART200", 3, "elective")] },
  ],
} as PlanExport;

describe("pdfRows", () => {
  it("groups terms into academic years, summer into its year, with totals and year credits", () => {
    const { years } = pdfRows(data);
    expect(years.map((y) => [y.label, y.academicYear, y.credits])).toEqual([["Year 1", "2026–27", 13], ["Year 2", "2027–28", 3]]);
    expect(years[0]!.terms.map((t) => [t.name, t.total])).toEqual([["Fall 2026", 7], ["Spring 2027", 3], ["Summer 2027", 3]]);
  });
  it("cuts a 60-char title to 46 chars plus an ellipsis", () => {
    const row = pdfRows(data).years[0]!.terms[1]!.rows[0]!;
    expect(row.title).toBe("x".repeat(46) + "…");
  });
  it("blanks grades when hidden or absent", () => {
    expect(pdfRows({ ...data, header: { ...data.header, gradesHidden: true } }).years[0]!.terms[0]!.rows.map((r) => r.grade)).toEqual(["", ""]);
    expect(pdfRows(data).years[0]!.terms[0]!.rows.map((r) => r.grade)).toEqual(["A", ""]);
  });
  it("maps minor and other to one purple category and lists only present categories in fixed order", () => {
    const { years, legend } = pdfRows(data);
    expect(years[0]!.terms[1]!.rows[0]!.category).toBe("other");
    expect(legend).toEqual(["major", "gen-ed", "elective", "other"]);
    expect(pdfRows({ ...data, terms: [data.terms[3]!] }).legend).toEqual(["elective"]);
  });
});
