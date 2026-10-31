// "Hot" windows for the seats job: when registration is busy, seat counts refresh every 5 minutes; otherwise every 15.
// The daily Vercel job turns the academic-calendar snapshot into rows of the seat_hot_windows table, and the pg_cron
// command in supabase/migrations/0016_edge_jobs.sql only calls the seats function when `now()` is inside one
// of them (or the minute is a multiple of 15).
//
// A window is: from the first priority/early registration day of a term until 14 days after the last such day,
// plus each term's schedule-adjustment period (start through the end of its last day). All dates are America/New_York.

import { addDays } from "./dates.ts";
import type { AcademicEvent } from "./calendar.ts";

export const HOT_DAYS_AFTER_REGISTRATION = 14;
const ZONE = "America/New_York";

export type HotWindow = { startsAt: string; endsAt: string };

const fmt = new Intl.DateTimeFormat("en-US", { timeZone: ZONE, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" });

/** New York's offset from UTC (ms, negative) at an instant. */
function offsetMs(at: number): number {
  const p = Object.fromEntries(fmt.formatToParts(new Date(at)).map((x) => [x.type, Number(x.value)]));
  return Date.UTC(p.year!, p.month! - 1, p.day!, p.hour!, p.minute!, p.second!) - Math.floor(at / 1000) * 1000;
}

/** The instant of 00:00:00 (or, with `endOfDay`, 23:59:59) on a "YYYY-MM-DD" date in New York. */
export function newYorkInstant(isoDate: string, endOfDay = false): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  const wall = Date.UTC(y!, m! - 1, d!, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0);
  // The offset depends on the instant being found, so settle it in two passes (right across a DST change).
  let at = wall - offsetMs(wall);
  at = wall - offsetMs(at);
  return new Date(at);
}

const window = (firstDay: string, lastDay: string): HotWindow => ({
  startsAt: newYorkInstant(firstDay).toISOString(),
  endsAt: newYorkInstant(lastDay, true).toISOString(),
});

export function seatHotWindows(events: AcademicEvent[]): HotWindow[] {
  const registration = new Map<string, { first: string; last: string }>();
  const out: HotWindow[] = [];
  for (const e of events) {
    const last = e.end ?? e.start;
    if (e.kind === "priority-registration" || e.kind === "early-registration") {
      const held = registration.get(e.term);
      registration.set(e.term, { first: held && held.first < e.start ? held.first : e.start, last: held && held.last > last ? held.last : last });
    } else if (e.kind === "schedule-adjustment") {
      out.push(window(e.start, last));
    }
  }
  for (const { first, last } of registration.values()) out.push(window(first, addDays(last, HOT_DAYS_AFTER_REGISTRATION)));
  return out.sort((a, b) => (a.startsAt < b.startsAt ? -1 : a.startsAt > b.startsAt ? 1 : 0));
}
