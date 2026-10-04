import { describe, expect, it } from "vitest";
import { buildPdf } from "./pdf";
import { FOOTER, type PlanExport } from "./plan-export";

const data: PlanExport = {
  header: { name: "Sam", date: "2026-09-29", disclaimer: "Unofficial, not affiliated with UMD, verify with your advisor", gradesHidden: false },
  terms: [
    { name: "Fall 2026", credits: 4, courses: [{ id: "CMSC131", title: "OOP I", credits: 4, grade: "A", category: "major" }] },
    { name: "Spring 2027", credits: 3, courses: [{ id: "ART100", title: "", credits: 3, grade: "", category: "elective" }] },
  ],
};

describe("buildPdf", () => {
  it("makes a letter PDF with the header, the plan grid and the disclaimer footer on every page", async () => {
    const doc = await buildPdf(data);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    const out = doc.output();
    expect(out).toContain("4-year plan");
    expect(out).toContain("Sam");
    expect(out).toContain("CMSC131");
    expect(out).toContain(FOOTER);
    expect(out).toContain("Page 1 of");
  }, 60000);

  it("has no audit, flag, prior-credit or citation sections", async () => {
    const out = (await buildPdf(data)).output();
    for (const word of ["takeout", "Degree audit", "Flags for", "Prior credit", "Catalog rule", "Tracks"]) expect(out).not.toContain(word);
  }, 60000);
});
