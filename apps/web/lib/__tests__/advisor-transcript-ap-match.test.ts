import { describe, expect, it } from "vitest";
import { matchApExamName } from "../advisor/transcript-ap-match";

const NAMES = ["Calculus AB", "Calculus BC", "Calculus BC AB Subscore", "Chemistry", "Biology", "Human Geography", "United States History", "English Language and Composition", "Physics C: Electricity and Magnetism", "Physics C: Mechanics"];

describe("matchApExamName", () => {
  it("matches an exact name", () => {
    expect(matchApExamName("CHEMISTRY", NAMES)).toBe("Chemistry");
  });

  it("matches an abbreviated multi-word name by token prefix", () => {
    expect(matchApExamName("HUMAN GEOG", NAMES)).toBe("Human Geography");
    expect(matchApExamName("ENG LANG/COMP", NAMES)).toBe("English Language and Composition");
  });

  it("matches a subscore name split with a slash", () => {
    expect(matchApExamName("CALC BC/AB SUB", NAMES)).toBe("Calculus BC AB Subscore");
  });

  it("prefers the more specific full match over a shorter one sharing a prefix", () => {
    expect(matchApExamName("CALCULUS BC", NAMES)).toBe("Calculus BC");
  });

  it("matches known Testudo abbreviations that aren't simple prefixes", () => {
    expect(matchApExamName("PHYSICS C-ELM", NAMES)).toBe("Physics C: Electricity and Magnetism");
    expect(matchApExamName("PHYSICS C-MECH", NAMES)).toBe("Physics C: Mechanics");
  });

  it("matches U.S. History via punctuation normalization", () => {
    expect(matchApExamName("U.S. HISTORY", NAMES)).toBe("United States History");
  });

  it("returns null for a name with no reasonable match", () => {
    expect(matchApExamName("UNDERWATER BASKET WEAVING", NAMES)).toBeNull();
  });
});

describe("matchApExamName: against the real UMD AP chart", () => {
  it("matches against @turboterp/credit's actual exam names", async () => {
    const { apExamNames } = await import("@turboterp/credit");
    const names = apExamNames();
    expect(matchApExamName("CHEMISTRY", names)).toBe("Chemistry");
    expect(matchApExamName("HUMAN GEOG", names)).toBe("Human Geography");
    expect(matchApExamName("CALC BC/AB SUB", names)).toBe("Calculus BC AB Subscore");
    expect(matchApExamName("PHYSICS C-ELM", names)).toBe("Physics C: Electricity and Magnetism");
    expect(matchApExamName("U.S. HISTORY", names)).toBe("United States History");
    expect(matchApExamName("ENG LANG/COMP", names)).toBe("English Language and Composition");
  });
});
