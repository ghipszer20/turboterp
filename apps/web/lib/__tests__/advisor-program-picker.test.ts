import type { ProgramEntry } from "@turboterp/programs";
import { describe, expect, it } from "vitest";
import { findProgram } from "@turboterp/programs";
import { kindTabs, optionState, pickerGroups } from "../advisor/program-picker";

const entry = (id: string, name: string, kind: ProgramEntry["kind"], college: ProgramEntry["college"], track?: string): ProgramEntry => ({
  id,
  name,
  kind,
  college,
  catalogYear: "2026-27",
  verified: false,
  sources: {},
  load: async () => ({ id, name, requirements: [] }),
  ...(track ? { track } : {}),
});

const OPTIONS = [
  entry("cmsc-major", "Computer Science Major", "major", "CMNS"),
  entry("engl-major", "English Major", "major", "ARHU"),
  entry("math-major-applied", "Mathematics Major (Applied Mathematics Track)", "major", "CMNS", "Applied Mathematics"),
  entry("cmsc-minor", "Computer Science Minor", "minor", "CMNS"),
  entry("honors-aces", "ACES", "special", "UGST"),
];

const titles = (groups: ReturnType<typeof pickerGroups>) => groups.map((g) => [g.title, g.options.map((o) => o.id)]);

describe("kindTabs", () => {
  it("lists the kinds that have programs, with counts, in a fixed order", () => {
    expect(kindTabs(OPTIONS)).toEqual([
      { kind: "major", label: "Majors", count: 3 },
      { kind: "minor", label: "Minors", count: 1 },
      { kind: "special", label: "Special programs", count: 1 },
    ]);
  });
});

describe("pickerGroups", () => {
  it("without a search, shows one kind grouped by college, in the college list's order", () => {
    expect(titles(pickerGroups(OPTIONS, { kind: "major", query: "" }))).toEqual([
      ["Arts and Humanities", ["engl-major"]],
      ["Computer, Mathematical, and Natural Sciences", ["cmsc-major", "math-major-applied"]],
    ]);
  });

  it("a search spans every kind, grouped by kind, matching every word anywhere in the name or track", () => {
    expect(titles(pickerGroups(OPTIONS, { kind: "major", query: "computer sci" }))).toEqual([
      ["Majors", ["cmsc-major"]],
      ["Minors", ["cmsc-minor"]],
    ]);
    expect(titles(pickerGroups(OPTIONS, { kind: "minor", query: "applied" }))).toEqual([["Majors", ["math-major-applied"]]]);
  });

  it("finds nothing for a search with no match", () => {
    expect(pickerGroups(OPTIONS, { kind: "major", query: "zoology" })).toEqual([]);
  });
});

describe("optionState (eligibility gates)", () => {
  const astrMinor = findProgram("astr-minor")!;

  it("leaves an ungated or unblocked option enabled", () => {
    expect(optionState(astrMinor, ["cmsc-major"])).toEqual({ on: false, disabled: false });
    expect(optionState(findProgram("cmsc-major")!, ["astr-major-data-science"])).toEqual({ on: false, disabled: false });
  });

  it("disables an option a chosen major blocks, with the reason", () => {
    expect(optionState(astrMinor, ["astr-major-data-science"])).toEqual({ on: false, disabled: true, blocked: astrMinor.notOpenTo!.reason });
  });

  it("keeps an already-chosen blocked option removable", () => {
    expect(optionState(astrMinor, ["astr-major-data-science", "astr-minor"])).toEqual({ on: true, disabled: false, blocked: astrMinor.notOpenTo!.reason });
  });
});
