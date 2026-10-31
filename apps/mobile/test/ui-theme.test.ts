import { describe, expect, it } from "vitest";
import { dark, light, palettes, resolveScheme, resolveScreenState, statusColors, type } from "../src/ui/theme";

describe("resolveScheme", () => {
  it("saved choice wins", () => {
    expect(resolveScheme("light", "dark")).toBe("light");
    expect(resolveScheme("dark", "light")).toBe("dark");
  });
  it("falls back to the device setting", () => {
    expect(resolveScheme(null, "dark")).toBe("dark");
    expect(resolveScheme("junk", "light")).toBe("light");
    expect(resolveScheme(undefined, null)).toBe("light");
  });
});

describe("palettes", () => {
  it("uses the UMD red in light mode and a brighter one in dark mode", () => {
    expect(light.accent).toBe("#ba0c2f");
    expect(dark.accent).not.toBe(light.accent);
    expect(palettes.dark).toBe(dark);
  });
  it("has the same keys in both modes", () => {
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
  });
});

describe("type scale", () => {
  it("line heights always exceed font sizes", () => {
    for (const t of Object.values(type)) expect(t.lineHeight).toBeGreaterThan(t.fontSize);
  });
});

describe("statusColors", () => {
  it("maps statuses and treats unknown like closed", () => {
    expect(statusColors("open", light).fg).toBe(light.open);
    expect(statusColors("soon", dark).tint).toBe(dark.soonTint);
    expect(statusColors("unknown", light)).toEqual(statusColors("closed", light));
  });
});

describe("resolveScreenState", () => {
  it("never returns a blank state", () => {
    expect(resolveScreenState({ loading: true })).toBe("loading");
    expect(resolveScreenState({ offline: true })).toBe("offline");
    expect(resolveScreenState({ error: new Error("x") })).toBe("error");
    expect(resolveScreenState({})).toBe("empty");
  });
  it("shows cached data over any notice", () => {
    expect(resolveScreenState({ hasData: true, offline: true, error: "x", loading: true })).toBe("ready");
  });
  it("offline outranks error", () => {
    expect(resolveScreenState({ offline: true, error: "x" })).toBe("offline");
  });
});
