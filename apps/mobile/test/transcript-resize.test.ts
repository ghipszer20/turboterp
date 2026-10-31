import { describe, expect, it } from "vitest";
import { LIMITS } from "../src/engine/protocol";
import { MAX_LONG_EDGE, planResize } from "../src/advisor/transcript-resize";

describe("planResize", () => {
  it("leaves small images alone", () => {
    expect(planResize(2000, 3000)).toBeNull();
    expect(planResize(3000, 3000)).toBeNull();
  });
  it("caps the long edge of a 48 MP portrait photo", () => {
    expect(planResize(6000, 8000)).toEqual({ height: 3000 });
  });
  it("caps the width of a landscape photo", () => {
    expect(planResize(8000, 6000)).toEqual({ width: 3000 });
  });
  it("ignores unknown sizes", () => {
    expect(planResize(0, 0)).toBeNull();
    expect(planResize(NaN, 100)).toBeNull();
  });
  it("keeps the result under the engine pixel cap", () => {
    expect(MAX_LONG_EDGE * MAX_LONG_EDGE).toBeLessThan(LIMITS.maxImagePixels);
  });
});
