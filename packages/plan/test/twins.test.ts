// Twins: courses UMD treats as the same course (see program-sources/course-equivalence.md).
// The strings are real Testudo lines from the Fall 2026 / Spring 2027 snapshots.

import { describe, expect, it } from "vitest";
import type { Course } from "@turboterp/course-data";
import { buildCatalog } from "../src/catalog.ts";
import { decodeCatalogFile, encodeCatalogFile } from "../src/catalog-file.ts";
import { parseTwinLine, twinsOf } from "../src/twins.ts";
import { SPRING_2027 } from "./helpers.ts";

const base = SPRING_2027[0]!;
function course(id: string, creditOnly: string | null, other: Record<string, string> = {}): Course {
  return { ...base, id, texts: { ...base.texts, creditOnlyGrantedFor: creditOnly, other } };
}

describe("parseTwinLine", () => {
  it("splits commas and 'or', drops the course's own id and the trailing period", () => {
    expect(parseTwinLine("CMSC320, DATA320 or STAT426.", "CMSC320")).toEqual({ codes: ["DATA320", "STAT426"], rejected: [] });
    expect(parseTwinLine("AMSC460, AMSC466, CMSC460, or CMSC466.", "CMSC460").codes).toEqual(["AMSC460", "AMSC466", "CMSC466"]);
  });

  it("closes the space inside a code", () => {
    expect(parseTwinLine("AAST498T, AAST443, GVPT368C or AMST 498J.", "AAST443").codes).toEqual(["AAST498T", "GVPT368C", "AMST498J"]);
  });

  it("keeps suffix letters", () => {
    expect(parseTwinLine("ENGL101H.", "ENGL101").codes).toEqual(["ENGL101H"]);
  });

  it("reports a token that is not a course code instead of listing it", () => {
    expect(parseTwinLine("ANSC4890 or ANSC454.", "ANSC454")).toEqual({ codes: [], rejected: ["ANSC4890"] });
  });

  it("returns nothing for a missing line", () => {
    expect(parseTwinLine(null, "CMSC131")).toEqual({ codes: [], rejected: [] });
    expect(parseTwinLine(undefined, "CMSC131")).toEqual({ codes: [], rejected: [] });
  });
});

describe("buildCatalog twins", () => {
  const catalog = buildCatalog([
    course("STAT426", "STAT426 or CMSC320."),
    course("CMSC320", "CMSC320, DATA320 or STAT426."),
    course("DATA320", null),
    course("AAST443", "AAST498T, AAST443, GVPT368C or AMST 498J.", { "Cross-listed with": "AMST498J, GVPT368C.", Formerly: "AAST498T." }),
    course("ANTH454", null, { "Jointly offered with": "ANTH654." }),
    course("CMSC131", null),
  ]);

  it("fills each Twin kind from its Testudo line", () => {
    expect(catalog.get("STAT426")!.twins).toEqual({ creditOnly: ["CMSC320"] });
    expect(catalog.get("AAST443")!.twins).toEqual({
      renumbered: ["AAST498T"],
      crossListed: ["AMST498J", "GVPT368C"],
      creditOnly: ["AAST498T", "GVPT368C", "AMST498J"],
    });
  });

  it("leaves twins out when there are none, and ignores 'Jointly offered with'", () => {
    expect(catalog.get("CMSC131")).not.toHaveProperty("twins");
    expect(catalog.get("ANTH454")).not.toHaveProperty("twins");
  });

  it("reads 'Also offered as' as Cross-listed", () => {
    const c = buildCatalog([course("ABCD100", null, { "Also offered as": "WXYZ100." })]);
    expect(c.get("ABCD100")!.twins).toEqual({ crossListed: ["WXYZ100"] });
  });

  it("twinsOf is symmetric: either course's line naming the other makes a Twin", () => {
    expect([...twinsOf(catalog, "STAT426").creditOnly]).toEqual(["CMSC320"]);
    expect([...twinsOf(catalog, "CMSC320").creditOnly].sort()).toEqual(["DATA320", "STAT426"]);
    expect([...twinsOf(catalog, "DATA320").creditOnly]).toEqual(["CMSC320"]);
    expect([...twinsOf(catalog, "GVPT368C").crossListed]).toEqual(["AAST443"]);
    expect([...twinsOf(catalog, "AAST498T").renumbered]).toEqual(["AAST443"]);
    const none = twinsOf(catalog, "CMSC131");
    expect([none.renumbered.size, none.crossListed.size, none.creditOnly.size]).toEqual([0, 0, 0]);
  });
});

describe("catalog file twins", () => {
  const catalog = buildCatalog([
    course("AAST443", "AAST498T, AAST443, GVPT368C or AMST 498J.", { "Cross-listed with": "AMST498J, GVPT368C.", Formerly: "AAST498T." }),
    course("CMSC131", null),
  ]);
  const meta = { term: "202701", generatedAt: "2026-10-06T00:00:00.000Z" };

  it("round-trips twins and leaves the key out when empty", () => {
    const file = JSON.parse(JSON.stringify(encodeCatalogFile(catalog, meta)));
    expect(file.v).toBe(1);
    expect(file.courses.find((c: { i: string }) => c.i === "CMSC131")).not.toHaveProperty("e");
    expect(file.courses.find((c: { i: string }) => c.i === "AAST443").e).toEqual({
      f: ["AAST498T"],
      x: ["AMST498J", "GVPT368C"],
      co: ["AAST498T", "GVPT368C", "AMST498J"],
    });
    const back = decodeCatalogFile(file).catalog;
    for (const [id, c] of catalog) expect(back.get(id)).toEqual(c);
  });

  it("still decodes a v1 file without twins", () => {
    const file = { v: 1, term: "202701", generatedAt: "", courses: [{ i: "CMSC131", t: "Object-Oriented Programming I", c: 4 }] };
    expect(decodeCatalogFile(file).catalog.get("CMSC131")).not.toHaveProperty("twins");
  });
});
