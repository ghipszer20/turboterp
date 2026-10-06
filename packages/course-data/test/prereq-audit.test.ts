import { describe, expect, it } from "vitest";
import { parsePrerequisite, type Requirement } from "../src/prereqs.ts";
import { ambiguousPrecedence, creditAnomalies, describeRequirement, detectClasses, lostCodes, normalizeTemplate } from "../src/prereq-audit.ts";

describe("normalizeTemplate", () => {
  it("replaces codes, bare numbers after a code, grades and credit counts", () => {
    expect(normalizeTemplate("Minimum grade of C- in MATH140 and BSCI 331, 332; 12 credits.")).toBe(
      "minimum grade of g in x and x, x; n credits.",
    );
  });
  it("collapses whitespace and case", () => {
    expect(normalizeTemplate("  MATH141   OR\nSTAT100 ")).toBe("x or x");
  });
  it("does not read the article a as a grade", () => {
    expect(normalizeTemplate("Must have a B or higher in MATH140")).toBe("must have a g or higher in x");
    expect(normalizeTemplate("A student with a C in MATH140")).toBe("a student with a g in x");
  });
});

describe("describeRequirement", () => {
  it("renders nested all/any in plain words", () => {
    const t = parsePrerequisite("MATH140 and (MATH141 or STAT100)");
    expect(describeRequirement(t!)).toBe("ALL of [MATH140; ANY of [MATH141; STAT100]]");
  });
  it("shows grades, levels and manual items", () => {
    expect(describeRequirement({ kind: "course", course: "MATH140", minGrade: "C-" })).toBe("MATH140 (min C-)");
    expect(describeRequirement({ kind: "dept-level", dept: "MATH", minNumber: 115 })).toBe("any MATH 115+");
    expect(describeRequirement({ kind: "manual", text: "permission" })).toBe('manual: "permission"');
  });
});

describe("ambiguousPrecedence", () => {
  it("flags and/or mixed with no parentheses", () => {
    expect(ambiguousPrecedence("MATH140 and MATH141 or STAT100")).toBe(true);
  });
  it("accepts parenthesized mixes, single operators and semicolon-separated clauses", () => {
    expect(ambiguousPrecedence("MATH140 and (MATH141 or STAT100)")).toBe(false);
    expect(ambiguousPrecedence("MATH140 and MATH141")).toBe(false);
    expect(ambiguousPrecedence("MATH140 or MATH141; STAT100 and STAT200")).toBe(false);
  });
});

describe("lostCodes", () => {
  it("lists codes missing from the tree", () => {
    expect(lostCodes("MATH140 and MATH141", { kind: "course", course: "MATH140" })).toEqual(["MATH141"]);
  });
});

describe("detectClasses", () => {
  it("flags an excluded course that became a requirement (B)", () => {
    const text = "MATH141 (not MATH461)";
    const tree: Requirement = { kind: "all", of: [{ kind: "course", course: "MATH141" }, { kind: "course", course: "MATH461" }] };
    expect(detectClasses(text, tree).map((f) => f.cls)).toContain("B");
  });
  it("is quiet on a clean parse", () => {
    const text = "MATH140 and MATH141";
    expect(detectClasses(text, parsePrerequisite(text)!)).toEqual([]);
  });
});

describe("creditAnomalies", () => {
  it("flags min>max, zero and variable credits", () => {
    expect(creditAnomalies({ min: 4, max: 3 })).toEqual(["min>max"]);
    expect(creditAnomalies({ min: 0, max: 0 })).toEqual(["zero"]);
    expect(creditAnomalies({ min: 1, max: 3 })).toEqual(["variable"]);
    expect(creditAnomalies({ min: 3, max: 3 })).toEqual([]);
  });
});
