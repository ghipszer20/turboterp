// Pure part of "Add to calendar": turns app-core's class events (the same ones behind the web's
// .ics) into Apple Calendar events. EventKit has no per-date exceptions, so a holiday ends one
// weekly series the day before and a new series starts the day after.
import type { Section } from "@turboterp/course-data/schedules";
import { classEvents, easternInstant, type ClassEvent } from "@turboterp/app-core/schedule/ics";

export const ADD_TO_CALENDAR_NOTE =
  "This adds your classes to Apple Calendar once. It does not stay in sync. If UMD changes a room or time, delete these events and add them again.";

export type AppleEvent = {
  title: string;
  location: string;
  notes: string;
  timeZone: string;
  startDate: Date;
  endDate: Date;
  recurrenceRule: { frequency: "weekly"; daysOfTheWeek: { dayOfTheWeek: number }[]; endDate: Date };
};

const DAY_MS = 86_400_000;
const parse = (iso: string) => new Date(`${iso}T00:00:00Z`);
const iso = (d: Date) => d.toISOString().slice(0, 10);

function segments(e: ClassEvent): { first: string; last: string }[] {
  const out: { first: string; last: string }[] = [];
  const addRun = (from: Date, to: Date) => {
    let first = from;
    while (first <= to && !e.weekdays.includes(first.getUTCDay())) first = new Date(first.getTime() + DAY_MS);
    if (first <= to) out.push({ first: iso(first), last: iso(to) });
  };
  let cur = parse(e.startDay);
  for (const skip of e.skipDays.map(parse)) {
    addRun(cur, new Date(skip.getTime() - DAY_MS));
    cur = new Date(skip.getTime() + DAY_MS);
  }
  addRun(cur, parse(e.lastDay));
  return out;
}

/** Apple Calendar events (weekly series) for `sections` in `term`; [] when the term's dates are unknown. */
export function appleEvents(term: string, sections: Section[]): AppleEvent[] {
  return classEvents(term, sections).flatMap((e) =>
    segments(e).map((seg) => ({
      title: e.title,
      location: e.location,
      notes: e.notes,
      timeZone: "America/New_York",
      startDate: easternInstant(seg.first, e.startMin),
      endDate: easternInstant(seg.first, e.endMin),
      recurrenceRule: {
        frequency: "weekly" as const,
        // EventKit weekdays: Sunday = 1 .. Saturday = 7.
        daysOfTheWeek: e.weekdays.map((n) => ({ dayOfTheWeek: n + 1 })),
        endDate: easternInstant(seg.last, 23 * 60 + 59),
      },
    })),
  );
}

export type AccessDecision = "granted" | "denied" | "settings";

/** What to do with a permission response: carry on, let the student try again, or point them to Settings. */
export function accessDecision(r: { granted: boolean; canAskAgain: boolean }): AccessDecision {
  if (r.granted) return "granted";
  return r.canAskAgain ? "denied" : "settings";
}
