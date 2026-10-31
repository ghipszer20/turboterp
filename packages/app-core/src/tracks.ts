// The pre-professional Tracks a student can pick in Setup, and small pure helpers the UI uses.
// Owner ruling: a Track is a prerequisite for applying to a professional school, not a degree
// requirement; it can be added to any major. So this module -- and every track id in
// AdvisorPlan.tracks -- is never passed to @turboterp/plan/notices or @turboterp/audit's program
// list (see lib/advisor/programs.ts, which only reads plan.programs). TRACKS and examMilestone
// come from "@turboterp/tracks/list", which has no runtime @turboterp/audit import, so this file
// stays out of the main bundle's solver code; only lib/advisor/analysis.ts (code-split) imports
// the full "@turboterp/tracks" (checkTrack, scienceGpa).

import type { Track } from "@turboterp/tracks/list";

export { examMilestone, TRACKS, type Track } from "@turboterp/tracks/list";

/** Adds or removes a track id, keeping the others' order. */
export function toggleTrack(selected: string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
}

/**
 * Whether to show the BCPM science GPA on this track's card. Owner ruling (Tracks, 2026-09-27):
 * only health tracks show it (pre-law doesn't) -- driven by the track's own `usesScienceGpa`
 * flag, not a hard-coded track id.
 */
export function showsScienceGpa(track: Pick<Track, "usesScienceGpa">): boolean {
  return track.usesScienceGpa === true;
}
