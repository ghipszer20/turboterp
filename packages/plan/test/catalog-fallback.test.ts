// Courses only in the UMD Academic Catalog (not on any cached Schedule of Classes) join the plan catalog.

import { describe, expect, it } from "vitest";
import { addedByFallback, buildCatalog, withCatalogFallback } from "../src/catalog.ts";
import { checkPlan } from "../src/check.ts";
import { SPRING_2027 } from "./helpers.ts";

const base = SPRING_2027.find((c) => c.id === "CMSC131")!;
const only = {
  ...base,
  id: "CMSC999",
  title: "Catalog only",
  credits: { min: 3, max: 3 },
  genEd: ["DSSP"],
  texts: { ...base.texts, creditOnlyGrantedFor: null, other: { Formerly: "CMSC998." } },
};

describe("withCatalogFallback", () => {
  it("adds catalog-only courses as notScheduled with title, credits, Gen Eds and twins", () => {
    const c = withCatalogFallback(buildCatalog(SPRING_2027), [only]).get("CMSC999")!;
    expect(c.title).toBe("Catalog only");
    expect(c.credits).toEqual({ min: 3, max: 3 });
    expect(c.genEd).toEqual(["DSSP"]);
    expect(c.twins).toEqual({ renumbered: ["CMSC998"] });
    expect(c.notScheduled).toBe(true);
    expect(c.offered).toBeUndefined();
  });

  it("never overwrites or alters a snapshot course", () => {
    const snap = buildCatalog(SPRING_2027);
    const merged = withCatalogFallback(snap, [{ ...only, id: "CMSC131", title: "Different" }]);
    expect(merged.get("CMSC131")).toBe(snap.get("CMSC131"));
    expect(merged.get("CMSC131")!.notScheduled).toBeUndefined();
  });

  it("addedByFallback lists only the courses not already in the catalog", () => {
    const added = addedByFallback(buildCatalog(SPRING_2027), [only, { ...only, id: "CMSC131" }]);
    expect(added.map((c) => c.id)).toEqual(["CMSC999"]);
  });

  it("does not raise a term-offering warning for a catalog-only course", () => {
    const merged = withCatalogFallback(buildCatalog(SPRING_2027), [only]);
    for (const name of ["Fall 2026", "Winter 2027", "Summer 2027"]) {
      const issues = checkPlan({ terms: [{ name, courses: [{ id: "CMSC999" }] }] }, merged);
      expect(issues.filter((i) => i.kind === "term-offering")).toEqual([]);
    }
  });
});
