import { describe, expect, it } from "vitest";
import type { ParsedApLine } from "@turboterp/app-core/transcript-parse";
import { selectApLines } from "@turboterp/app-core/transcript-ap-select";

const NAMES = ["Chemistry", "Biology", "Calculus AB", "Calculus BC", "Calculus BC AB Subscore"];

const line = (examRaw: string, score: number, flagged = false): ParsedApLine => ({
  examRaw,
  score,
  termCode: null,
  flagged,
  raw: `${examRaw}/SCR ${score}`,
});

describe("selectApLines: collapsing duplicate lines for the same exam", () => {
  it("collapses repeated lines for the same matched exam into one, keeping the highest score", () => {
    const r = selectApLines([line("CHEMISTRY", 5), line("CHEMISTRY", 4), line("CHEMISTRY", 5)], NAMES);
    expect(r.matched).toEqual([{ exam: "Chemistry", score: 5, flagged: false }]);
  });

  it("keeps two different exams as separate matched rows", () => {
    const r = selectApLines([line("CHEMISTRY", 5), line("BIOLOGY", 4)], NAMES);
    expect(r.matched).toEqual(
      expect.arrayContaining([
        { exam: "Chemistry", score: 5, flagged: false },
        { exam: "Biology", score: 4, flagged: false },
      ]),
    );
    expect(r.matched).toHaveLength(2);
  });

  it("flags the collapsed row if any of the duplicate lines was flagged", () => {
    const r = selectApLines([line("CHEMISTRY", 5, false), line("CHEMISTRY", 5, true)], NAMES);
    expect(r.matched).toEqual([{ exam: "Chemistry", score: 5, flagged: true }]);
  });
});

describe("selectApLines: unmatched exam names", () => {
  it("lists a line with no plausible match as unmatched, unchanged", () => {
    const l = line("UNDERWATER BASKET WEAVING", 5);
    const r = selectApLines([l], NAMES);
    expect(r.matched).toEqual([]);
    expect(r.unmatched).toEqual([l]);
  });
});

describe("selectApLines: Calculus BC's AB subscore", () => {
  it("gives an info row instead of a matched row when a Calculus BC line is present", () => {
    const r = selectApLines([line("CALCULUS BC", 5), line("CALC BC/AB SUB", 5)], NAMES);
    expect(r.matched).toEqual([{ exam: "Calculus BC", score: 5, flagged: false }]);
    expect(r.info).toEqual([{ exam: "Calculus BC AB Subscore", score: 5, note: "AB subscore; credit comes from Calculus BC" }]);
    expect(r.unmatched).toEqual([]);
  });

  it("lists the AB subscore as unmatched when there's no Calculus BC line", () => {
    const l = line("CALC BC/AB SUB", 5);
    const r = selectApLines([l], NAMES);
    expect(r.matched).toEqual([]);
    expect(r.info).toEqual([]);
    expect(r.unmatched).toEqual([l]);
  });

  it("still counts a real Calculus AB line normally alongside an unmatched-without-BC subscore", () => {
    const r = selectApLines([line("CALCULUS AB", 3), line("CALC BC/AB SUB", 5)], NAMES);
    expect(r.matched).toEqual([{ exam: "Calculus AB", score: 3, flagged: false }]);
    expect(r.unmatched).toEqual([line("CALC BC/AB SUB", 5)]);
  });
});
