import { describe, expect, it } from "vitest";
import { legendCategories, rowCategory } from "../advisor/row-category";

const audit = (id: string, layer: string | undefined, assigned: string[]) => ({
  program: { id, name: id, ...(layer ? { layer } : {}) },
  requirements: [{ requirement: { id: "r", name: "R" }, result: { id: "r", name: "R", status: "satisfied", assigned }, gap: null }],
});
const analysis = {
  audits: [
    audit("cmsc-major", undefined, ["CMSC131"]),
    audit("gen-ed", "gen-ed", ["DSHU101", "CMSC131"]),
    audit("college-intro", "college", ["CMNS100"]),
    audit("math-minor", undefined, ["MATH140"]),
  ],
} as never;
const kinds = { "cmsc-major": "major", "math-minor": "minor" };

describe("rowCategory", () => {
  it("major audit wins", () => expect(rowCategory("CMSC131", analysis, kinds)).toBe("major"));
  it("Gen Ed layer", () => expect(rowCategory("DSHU101", analysis, kinds)).toBe("gened"));
  it("college layer", () => expect(rowCategory("CMNS100", analysis, kinds)).toBe("college"));
  it("minor maps to other", () => expect(rowCategory("MATH140", analysis, kinds)).toBe("other"));
  it("unassigned counts as an elective, so every row gets a color", () => expect(rowCategory("ART100", analysis, kinds)).toBe("elective"));
});
describe("legendCategories", () => {
  it("keeps fixed order and drops absent", () => {
    expect(legendCategories(["other", "major", "other", "gened"])).toEqual(["major", "gened", "other"]);
  });
});
