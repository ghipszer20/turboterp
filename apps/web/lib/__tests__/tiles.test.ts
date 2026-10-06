import { describe, expect, it } from "vitest";
import { clampSub, tileStatusTone } from "../tiles";

describe("tileStatusTone", () => {
  it("maps open, soon and closed to themselves", () => {
    expect(tileStatusTone("open")).toBe("open");
    expect(tileStatusTone("soon")).toBe("soon");
    expect(tileStatusTone("closed")).toBe("closed");
  });
  it("maps unknown to closed", () => {
    expect(tileStatusTone("unknown")).toBe("closed");
  });
});

describe("clampSub", () => {
  it("leaves a short sub unchanged", () => {
    expect(clampSub("Open until 9pm")).toBe("Open until 9pm");
  });
  it("cuts a 90-char sub at a space to at most 72 chars ending in an ellipsis", () => {
    const text = "Lunch: Orange chicken, Margherita pizza, Chicken shawarma, Roasted vegetables, Rice pilaf";
    expect(text.length).toBeGreaterThan(85);
    const out = clampSub(text);
    expect(out.length).toBeLessThanOrEqual(72);
    expect(out.endsWith("…")).toBe(true);
    const base = out.slice(0, -1);
    expect(text.startsWith(base)).toBe(true);
    expect(/[ ,]/.test(text[base.length])).toBe(true);
  });
});
