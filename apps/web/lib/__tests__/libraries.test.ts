import { describe, expect, it } from "vitest";
import { compactLibraryName, MAIN_LIBRARIES } from "../libraries";

describe("compactLibraryName", () => {
  it("drops the 'Michelle Smith' prefix so the name fits a compact row", () => {
    expect(compactLibraryName("Michelle Smith Performing Arts Library")).toBe("Performing Arts Library");
  });

  it("leaves other library names unchanged", () => {
    expect(compactLibraryName("McKeldin Library")).toBe("McKeldin Library");
    expect(compactLibraryName("Architecture Library")).toBe("Architecture Library");
    expect(compactLibraryName("Art Library")).toBe("Art Library");
    expect(compactLibraryName("Hornbake Library")).toBe("Hornbake Library");
    expect(compactLibraryName("STEM Library")).toBe("STEM Library");
  });
});

describe("MAIN_LIBRARIES", () => {
  it("names McKeldin, STEM and Hornbake, in that order, for the Today page", () => {
    const names = ["Architecture Library", "Hornbake Library", "McKeldin Library", "STEM Library", "Art Library"];
    const picked = MAIN_LIBRARIES.map((p) => names.find((n) => p.test(n)));
    expect(picked).toEqual(["McKeldin Library", "STEM Library", "Hornbake Library"]);
  });
});

