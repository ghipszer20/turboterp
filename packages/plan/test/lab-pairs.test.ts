// A lab-science lecture counts as DSNL only when its lab is taken in the same term (Testudo:
// "DSNL (if taken with CHEM132)"); the pair then brings lecture + lab credits.

import { describe, expect, it } from "vitest";
import type { CatalogCourse, PlanCatalog } from "../src/catalog.ts";
import { decodeCatalogFile, encodeCatalogFile } from "../src/catalog-file.ts";
import type { Plan } from "../src/check.ts";
import { planCourses } from "../src/notices.ts";

const c = (id: string, credits: number, extra: Partial<CatalogCourse> = {}): CatalogCourse => ({
  id,
  title: id,
  credits: { min: credits, max: credits },
  genEd: [],
  prerequisite: null,
  corequisite: null,
  repeat: { kind: "unknown" },
  ...extra,
});
const catalog: PlanCatalog = new Map(
  [
    c("CHEM131", 3, { genEd: ["DSNL", "DSNS"], labPair: { code: "DSNL", with: "CHEM132" } }),
    c("CHEM132", 1),
    c("PHYS260", 3, { genEd: ["DSNL"], labPair: { code: "DSNL", with: "PHYS261" } }),
    c("PHYS261", 1),
  ].map((x) => [x.id, x]),
);
const plan = (...terms: string[][]): Plan => ({
  terms: terms.map((ids, i) => ({ name: `Term ${i + 1}`, courses: ids.map((id) => ({ id })) })),
});
const byId = (p: Plan, id: string) => planCourses(p, catalog).find((x) => x.id === id);

describe("lab-science pairs in planCourses", () => {
  it("keeps DSNL, with lecture + lab credits, when the lab is in the same term", () => {
    const lecture = byId(plan(["CHEM131", "CHEM132"]), "CHEM131");
    expect(lecture?.genEd).toEqual(["DSNL", "DSNS"]);
    expect(lecture?.genEdCredits).toBe(4);
    expect(byId(plan(["CHEM131", "CHEM132"]), "CHEM132")?.genEd).toEqual([]);
  });

  it("drops only DSNL when the lecture is alone", () => {
    const lecture = byId(plan(["CHEM131"]), "CHEM131");
    expect(lecture?.genEd).toEqual(["DSNS"]);
    expect(lecture?.genEdCredits).toBeUndefined();
  });

  it("drops DSNL when the lab is in a different term", () => {
    expect(byId(plan(["CHEM131"], ["CHEM132"]), "CHEM131")?.genEd).toEqual(["DSNS"]);
  });

  it("gives a lecture with no other Gen Ed code none when alone", () => {
    expect(byId(plan(["PHYS260"]), "PHYS260")?.genEd).toEqual([]);
  });
});

describe("lab pair in the catalog file", () => {
  it("round-trips through the short key nl", () => {
    const file = encodeCatalogFile(catalog, { term: "202701", generatedAt: "x" });
    expect(file.courses.find((x) => x.i === "CHEM131")?.nl).toBe("CHEM132");
    expect(file.courses.find((x) => x.i === "CHEM132")?.nl).toBeUndefined();
    expect(decodeCatalogFile(file).catalog.get("CHEM131")?.labPair).toEqual({ code: "DSNL", with: "CHEM132" });
  });
});

describe("lab-science pairs: review fixes", () => {
  it("doesn't pair a lab withdrawn from or failed in that term", () => {
    const p: Plan = { terms: [{ name: "Fall", courses: [{ id: "CHEM131", status: "completed", grade: "A" }, { id: "CHEM132", status: "completed", grade: "W" }] }] };
    const lecture = planCourses(p, catalog).find((x) => x.id === "CHEM131");
    expect(lecture?.genEd).toEqual(["DSNS"]);
    expect(lecture?.genEdCredits).toBeUndefined();
  });
});
