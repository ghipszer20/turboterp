// Display helpers for the Stamp Student Union food venues.

import type { StampVenue } from "@turboterp/campus-data";
import { isOpenAt } from "@turboterp/campus-data/hours";

/** Venues in the Stamp whose hours UMD Dining Services doesn't publish (run by other operators). */
export const OTHER_STAMP_VENUES = ["Panda Express", "Moby Freestyle", "Hibachi San"];

/** One line for the Today page: how many Stamp food places are open now. */
export function stampSummary(venues: StampVenue[], today: string, minutes: number): string {
  const known = venues.filter((v) => v.days[today]);
  if (known.length === 0) return "Hours unavailable";
  const open = known.filter((v) => isOpenAt(v.days[today]!, minutes) === true).length;
  if (open === 0) return "Everything is closed right now";
  return `${open} of ${known.length} ${known.length === 1 ? "place" : "places"} open now`;
}
