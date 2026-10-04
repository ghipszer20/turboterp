import { describe, expect, it } from "vitest";
import { EXTRA_DEPARTMENT_PREFIXES, withExtraDepartments } from "../src/soc.ts";

describe("withExtraDepartments", () => {
  it("adds the prefixes Testudo's index omits, once each, keeping the index's own entries", () => {
    const listed = [
      { code: "AAAS", name: "African American and Africana Studies" },
      { code: "CMNS", name: "Already listed" },
    ];
    const all = withExtraDepartments(listed);
    expect(all[0]).toEqual(listed[0]);
    expect(all.filter((d) => d.code === "CMNS")).toEqual([listed[1]]);
    expect(all.map((d) => d.code)).toContain("ARUX");
    expect(new Set(all.map((d) => d.code)).size).toBe(all.length);
    expect(all.length).toBe(new Set([...listed.map((d) => d.code), ...EXTRA_DEPARTMENT_PREFIXES]).size);
  });

  it("has the 30 known extra prefixes", () => {
    expect(EXTRA_DEPARTMENT_PREFIXES).toHaveLength(30);
  });
});
