import { describe, expect, it } from "vitest";
import { COLLEGES, creditCap } from "../src/credit-caps.ts";

describe("creditCap", () => {
  it("falls back to the campus-wide default when no college is given", () => {
    expect(creditCap(undefined, "Fall")).toMatchObject({ max: 20, approval: "dean", isDefault: true });
    expect(creditCap(undefined, "Spring")).toMatchObject({ max: 20, approval: "dean", isDefault: true });
    expect(creditCap(undefined, "Winter")).toMatchObject({ max: 4, approval: "dean", isDefault: true });
    expect(creditCap(undefined, "Summer")).toMatchObject({ max: 16, approval: "dean", isDefault: true });
  });

  it("falls back to the campus-wide default for a college with no override", () => {
    expect(creditCap("ARHU", "Fall")).toMatchObject({ max: 20, isDefault: true });
    expect(creditCap("JOUR", "Winter")).toMatchObject({ max: 4, isDefault: true });
  });

  it("uses CMNS's own, lower Fall/Spring maximum", () => {
    expect(creditCap("CMNS", "Fall")).toMatchObject({ max: 17, approval: "dean", isDefault: false });
    expect(creditCap("CMNS", "Spring")).toMatchObject({ max: 17, isDefault: false });
    // CMNS's Winter/Summer match the campus default, so they aren't overridden.
    expect(creditCap("CMNS", "Winter")).toMatchObject({ max: 4, isDefault: true });
  });

  it("uses Engineering's own, lower Fall/Spring maximum", () => {
    expect(creditCap("ENGR", "Fall")).toMatchObject({ max: 18, isDefault: false });
    expect(creditCap("ENGR", "Spring")).toMatchObject({ max: 18, isDefault: false });
    expect(creditCap("ENGR", "Summer")).toMatchObject({ max: 16, isDefault: true });
  });

  it("every entry cites a umd.edu source", () => {
    for (const season of ["Fall", "Winter", "Spring", "Summer"] as const) {
      expect(creditCap(undefined, season).source).toMatch(/^https:\/\/[^/]*umd\.edu\//);
    }
    for (const college of COLLEGES.map((c) => c.code)) {
      for (const season of ["Fall", "Winter", "Spring", "Summer"] as const) {
        expect(creditCap(college, season).source).toMatch(/^https:\/\/[^/]*umd\.edu\//);
      }
    }
  });

  it("lists the 13 UMD undergraduate colleges plus Shady Grove", () => {
    expect(COLLEGES.map((c) => c.code).sort()).toEqual(
      ["AGNR", "ARCH", "ARHU", "BMGT", "BSOS", "CMNS", "EDUC", "ENGR", "INFO", "JOUR", "PLCY", "SPHL", "UGST", "USG"].sort(),
    );
  });
});
