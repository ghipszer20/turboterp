import { describe, expect, it } from "vitest";
import { distanceMeters, walkMinutes } from "../src/walk.ts";

describe("distanceMeters", () => {
  it("is zero for the same point and about 111 km per degree of latitude", () => {
    expect(distanceMeters(38.986, -76.943, 38.986, -76.943)).toBe(0);
    expect(distanceMeters(38, -76.9, 39, -76.9)).toBeCloseTo(111_195, -2);
  });
});

describe("walkMinutes", () => {
  it("is the haversine distance x1.3 detour, at 1.3 m/s", () => {
    // 1.3x detour / 1.3 m/s cancels to ~1 second per meter -- still computed via both factors,
    // not hardcoded, so a change to either constant would be caught here.
    expect(walkMinutes(600)).toBeCloseTo(600 / 60, 5);
  });
});
