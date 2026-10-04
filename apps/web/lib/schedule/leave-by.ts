// Transport's "leave by" card: which class is next today, from this device's saved schedule.
// Pure logic; the card fetches the sections and the trip and calls these.

import type { Section, Weekday } from "@turboterp/course-data/schedules";
import type { SavedSchedule, SectionPicks } from "./saved";

/** The picks the card follows: Plan A's, else Build my own. */
export function pickedForToday(saved: SavedSchedule): SectionPicks {
  return saved.plans.A && Object.keys(saved.plans.A).length > 0 ? saved.plans.A : saved.own;
}

const WEEKDAY_BY_UTC_DAY: Record<number, Weekday> = { 1: "M", 2: "Tu", 3: "W", 4: "Th", 5: "F" };

/** The schedule weekday for an ISO date (campus date), or null on a weekend. */
export function weekdayOf(isoDate: string): Weekday | null {
  return WEEKDAY_BY_UTC_DAY[new Date(`${isoDate}T12:00:00Z`).getUTCDay()] ?? null;
}

export type NextClass = {
  courseId: string;
  start: number;
  building: string;
  /** The class just before it today (by end time), if it has a known building code. */
  before: { courseId: string; building: string; end: number } | null;
};

/** The student's next class today after `nowMinutes` (campus time), in a building we can name. */
export function nextClassToday(sections: readonly Section[], day: Weekday, nowMinutes: number): NextClass | null {
  const today = sections.flatMap((s) =>
    s.meetings
      .filter((m) => m.start !== null && m.end !== null && m.days.includes(day))
      .map((m) => ({ courseId: s.courseId, start: m.start!, end: m.end!, building: m.building ?? "" })),
  );
  today.sort((a, b) => a.start - b.start || a.end - b.end);
  const next = today.find((c) => c.start > nowMinutes);
  if (!next || !next.building || next.building === "TBA") return null;
  const prior = today.filter((c) => c !== next && c.start < next.start && c.end <= next.start);
  const before = prior.length ? prior.reduce((a, b) => (b.end >= a.end ? b : a)) : null;
  return {
    courseId: next.courseId,
    start: next.start,
    building: next.building,
    before: before && before.building && before.building !== "TBA" ? { courseId: before.courseId, building: before.building, end: before.end } : null,
  };
}
