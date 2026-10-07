import { describe, expect, it } from "vitest";
import { buildCatalog } from "../src/catalog.ts";
import { SPRING_2027 } from "./helpers.ts";

const catalog = buildCatalog(SPRING_2027);

describe("buildCatalog", () => {
  it("keeps each course's credits and parses its prerequisite and corequisite once", () => {
    const cmsc131 = catalog.get("CMSC131")!;
    expect(cmsc131.credits).toEqual({ min: 4, max: 4 });
    expect(cmsc131.prerequisite).toBeNull();
    expect(cmsc131.corequisite).toEqual({ kind: "course", course: "MATH140" });
    expect(catalog.get("MATH141")!.prerequisite).toEqual({ kind: "course", course: "MATH140", minGrade: "C-" });
  });

  it("treats an empty prerequisite line as no prerequisite", () => {
    expect(catalog.get("CMSC250")!.prerequisite).toBeNull();
  });

  it("reads 'Repeatable to N credits' as repeatable with a credit limit", () => {
    expect(catalog.get("ENGL388T")!.repeat).toEqual({ kind: "repeatable", maxCredits: 12 });
  });

  it("reads 'may repeat … for a maximum of N credits' as repeatable with a credit limit", () => {
    expect(catalog.get("ECON418A")!.repeat).toEqual({ kind: "repeatable", maxCredits: 6 });
  });

  it("reads 'The course is repeatable' as repeatable with no stated limit", () => {
    expect(catalog.get("MATH003")!.repeat).toEqual({ kind: "repeatable" });
  });

  it("doesn't mistake other uses of 'repeated' (\"repeated games\") for a repeat rule", () => {
    expect(catalog.get("GVPT390")!.repeat).toEqual({ kind: "unknown" });
    expect(catalog.get("CMSC351")!.repeat).toEqual({ kind: "unknown" });
  });

  it("merges several terms' course lists, keeping the first record of a course", () => {
    const fall = [{ ...SPRING_2027.find((c) => c.id === "CMSC131")!, id: "CMSC474", title: "Fall-only course" }];
    const merged = buildCatalog(SPRING_2027, fall);
    expect(merged.get("CMSC474")!.title).toBe("Fall-only course");
    expect(buildCatalog(SPRING_2027, [{ ...fall[0]!, id: "CMSC131" }]).get("CMSC131")!.title).not.toBe("Fall-only course");
  });
});

describe("buildCatalog: lab pairs from older snapshots", () => {
  it("reads the lab pair from genEdText when the snapshot predates the labPair field", () => {
    const base = SPRING_2027.find((x) => x.genEd.length > 0)!;
    const old = { ...base, id: "CHEM131", genEd: ["DSNL", "DSNS"], genEdText: "DSNL (if taken with CHEM132), DSNS" };
    delete (old as { labPair?: unknown }).labPair;
    expect(buildCatalog([old]).get("CHEM131")!.labPair).toEqual({ code: "DSNL", with: "CHEM132" });
  });
});
