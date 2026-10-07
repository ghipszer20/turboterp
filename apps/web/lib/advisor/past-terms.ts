// Courses in terms that have already ended (owner ruling, rulings.md "Grades, drops and ungraded
// courses", 2026-10-07; revised the same day): a past-term course counts as completed, graded or
// not, and the student isn't asked about it. Grades are never required.

import { parseTerm, type Season } from "./terms";

/** Last day of each term as month (0-based) and day. Fixed table: Fall ends Dec 21, Winter Jan 23,
 * Spring May 20, Summer Aug 15. A term has ended once today is after that day. */
const TERM_END: Record<Season, { month: number; day: number }> = {
  Fall: { month: 11, day: 21 },
  Winter: { month: 0, day: 23 },
  Spring: { month: 4, day: 20 },
  Summer: { month: 7, day: 15 },
};

export function termEnded(name: string, today: Date): boolean {
  const t = parseTerm(name);
  if (!t) return false;
  const end = TERM_END[t.season];
  const endOfDay = new Date(t.year, end.month, end.day + 1); // midnight after the last day
  return today.getTime() >= endOfDay.getTime();
}
