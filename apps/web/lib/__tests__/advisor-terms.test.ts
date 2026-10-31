import { describe, expect, it } from "vitest";
import {
  academicYears,
  compareTerms,
  defaultTerms,
  matriculationTermId,
  parseTerm,
  sortTerms,
  startTermOptions,
  termFromMatriculationId,
} from "@turboterp/app-core/terms";

describe("defaultTerms", () => {
  it("gives eight fall and spring terms from a fall start", () => {
    expect(defaultTerms("Fall 2026")).toEqual([
      "Fall 2026",
      "Spring 2027",
      "Fall 2027",
      "Spring 2028",
      "Fall 2028",
      "Spring 2029",
      "Fall 2029",
      "Spring 2030",
    ]);
  });

  it("starts with spring for a spring start", () => {
    expect(defaultTerms("Spring 2027").slice(0, 3)).toEqual(["Spring 2027", "Fall 2027", "Spring 2028"]);
    expect(defaultTerms("Spring 2027")).toHaveLength(8);
  });
});

describe("term order", () => {
  it("puts winter between fall and the next spring, and summer after spring", () => {
    expect(sortTerms(["Summer 2027", "Spring 2027", "Fall 2026", "Winter 2027", "Fall 2027"])).toEqual([
      "Fall 2026",
      "Winter 2027",
      "Spring 2027",
      "Summer 2027",
      "Fall 2027",
    ]);
    expect(compareTerms("Fall 2026", "Winter 2027")).toBeLessThan(0);
  });

  it("parses term names", () => {
    expect(parseTerm("Winter 2027")).toEqual({ season: "Winter", year: 2027 });
    expect(parseTerm("Autumn 2027")).toBeNull();
  });
});

describe("academicYears", () => {
  it("groups fall with the winter, spring and summer after it", () => {
    const years = academicYears(["Fall 2026", "Winter 2027", "Spring 2027", "Fall 2027", "Spring 2028", "Summer 2028"]);
    expect(years).toEqual([
      { label: "2026–27", terms: ["Fall 2026", "Winter 2027", "Spring 2027"] },
      { label: "2027–28", terms: ["Fall 2027", "Spring 2028", "Summer 2028"] },
    ]);
  });

  it("puts a spring start in the academic year it belongs to", () => {
    expect(academicYears(["Spring 2027", "Fall 2027"])).toEqual([
      { label: "2026–27", terms: ["Spring 2027"] },
      { label: "2027–28", terms: ["Fall 2027"] },
    ]);
  });
});

describe("matriculationTermId", () => {
  it("gives the Testudo id of a fall or spring start", () => {
    expect(matriculationTermId("Fall 2026")).toBe("202608");
    expect(matriculationTermId("Spring 2027")).toBe("202701");
  });
});

describe("termFromMatriculationId", () => {
  it("inverts matriculationTermId for a fall or spring start", () => {
    expect(termFromMatriculationId("202608")).toBe("Fall 2026");
    expect(termFromMatriculationId("202701")).toBe("Spring 2027");
  });

  it("round-trips through matriculationTermId", () => {
    for (const name of ["Fall 2026", "Spring 2027", "Summer 2027", "Winter 2027"]) {
      expect(termFromMatriculationId(matriculationTermId(name)!)).toBe(name);
    }
  });

  it("is null for an unrecognized id", () => {
    expect(termFromMatriculationId("not-a-term")).toBeNull();
    expect(termFromMatriculationId("202699")).toBeNull();
  });
});

describe("startTermOptions", () => {
  it("offers fall and spring terms around the current year, oldest first", () => {
    const options = startTermOptions(2026);
    expect(options[0]).toBe("Fall 2022");
    expect(options).toContain("Spring 2027");
    expect(options.at(-1)).toBe("Fall 2028");
  });
});
