import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseCatalogCourses } from "../src/catalog-courses.ts";

const page = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

describe("parseCatalogCourses", () => {
  const courses = parseCatalogCourses(page("catalog-bsci.html"));
  const byId = new Map(courses.map((c) => [c.id, c]));

  it("reads id, title and credits from each course block", () => {
    expect(byId.get("BSCI171")).toMatchObject({ department: "BSCI", title: "Principles of Molecular & Cellular Biology Laboratory", credits: { min: 1, max: 1 } });
    expect(byId.get("BSCI171")!.texts.corequisite).toBe("BSCI170.");
  });

  it("reads the labeled lines into texts", () => {
    const bsci125 = byId.get("BSCI125")!;
    expect(bsci125.texts.corequisite).toBe("BSCI124.");
    expect(bsci125.texts.restriction).toMatch(/^For non-science majors only/);
    expect(bsci125.texts.other["Additional Information"]).toMatch(/only when taken concurrently with BSCI124/);
    expect(bsci125.description).toMatch(/^An introduction to the biology of plants/);
  });

  it("reads a credit range", () => {
    expect(courses.some((c) => c.credits.min < c.credits.max)).toBe(true);
  });

  it("parses a graduate catalog page the same way", () => {
    expect(parseCatalogCourses(page("catalog-grad.html")).length).toBeGreaterThan(5);
  });
});
