import { describe, expect, it } from "vitest";
import { showsScienceGpa, toggleTrack } from "../advisor/tracks";
import type { Track } from "@turboterp/tracks/list";

describe("toggleTrack", () => {
  it("adds a track id that isn't picked yet", () => {
    expect(toggleTrack([], "pre-med")).toEqual(["pre-med"]);
    expect(toggleTrack(["pre-med"], "pre-law")).toEqual(["pre-med", "pre-law"]);
  });

  it("removes a track id that's already picked", () => {
    expect(toggleTrack(["pre-med", "pre-law"], "pre-med")).toEqual(["pre-law"]);
  });
});

describe("showsScienceGpa", () => {
  const track = (usesScienceGpa?: boolean) => ({ usesScienceGpa }) as Track;

  // Owner ruling (Tracks, 2026-09-27): pre-law's card doesn't show science GPA (BCPM); only
  // health tracks do. A flag on the track definition, not a hard-coded id check in the UI.
  it("is true only when the track's usesScienceGpa flag is true", () => {
    expect(showsScienceGpa(track(true))).toBe(true);
    expect(showsScienceGpa(track(false))).toBe(false);
    expect(showsScienceGpa(track(undefined))).toBe(false);
  });
});
