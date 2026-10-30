import { describe, expect, it } from "vitest";
import { isAppleDevice } from "../apple-device";

describe("isAppleDevice", () => {
  it("is true for iPhone", () => {
    expect(isAppleDevice({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", platform: "iPhone", maxTouchPoints: 5 })).toBe(true);
  });
  it("is true for iPad", () => {
    expect(isAppleDevice({ userAgent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)", platform: "iPad", maxTouchPoints: 5 })).toBe(true);
  });
  it("is true for iPadOS reporting as a Mac with touch", () => {
    expect(isAppleDevice({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", platform: "MacIntel", maxTouchPoints: 5 })).toBe(true);
  });
  it("is true for a Mac", () => {
    expect(isAppleDevice({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", platform: "MacIntel", maxTouchPoints: 0 })).toBe(true);
  });
  it("is false for Windows", () => {
    expect(isAppleDevice({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", platform: "Win32", maxTouchPoints: 0 })).toBe(false);
  });
  it("is false for Android", () => {
    expect(isAppleDevice({ userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8)", platform: "Linux armv81", maxTouchPoints: 5 })).toBe(false);
  });
  it("works without a platform string", () => {
    expect(isAppleDevice({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" })).toBe(true);
  });
});
