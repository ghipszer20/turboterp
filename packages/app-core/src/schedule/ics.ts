// iCalendar (RFC 5545) export of a set of sections. Pure: (term, sections) -> string.

import type { Meeting, Section } from "@turboterp/course-data/schedules";
import { termDates } from "./term-dates";

const DAY_INDEX: Record<string, number> = { Su: 0, M: 1, Tu: 2, W: 3, Th: 4, F: 5, Sa: 6 };
const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const DAY_MS = 86_400_000;
const TZID = "America/New_York";

const encoder = new TextEncoder();

export const escapeText = (s: string): string =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Fold a content line at 75 octets (continuations start with one space); never splits a character. */
export function foldLine(line: string): string {
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let cur = "";
  let bytes = 0;
  let limit = 75;
  for (const ch of line) {
    const n = encoder.encode(ch).length;
    if (bytes + n > limit) {
      parts.push(cur);
      cur = "";
      bytes = 0;
      limit = 74; // the leading space counts toward the 75
    }
    cur += ch;
    bytes += n;
  }
  parts.push(cur);
  return parts.join("\r\n ");
}

export const p2 = (n: number) => String(n).padStart(2, "0");
export const ymd = (d: Date) => `${d.getUTCFullYear()}${p2(d.getUTCMonth() + 1)}${p2(d.getUTCDate())}`;
const hms = (min: number) => `${p2(Math.floor(min / 60))}${p2(min % 60)}00`;
const parseDay = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** 23:59:59 Eastern on this calendar day, as a UTC iCalendar timestamp. */
function endOfDayUtc(d: Date): string {
  const nthSunday = (month: number, n: number) => {
    const first = new Date(Date.UTC(d.getUTCFullYear(), month, 1));
    return new Date(first.getTime() + (((7 - first.getUTCDay()) % 7) + 7 * (n - 1)) * DAY_MS);
  };
  const dst = d >= nthSunday(2, 2) && d < nthSunday(10, 1); // 2nd Sunday of March .. 1st Sunday of November
  const utc = new Date(d.getTime() + (23 * 60 + 59) * 60_000 + 59_000 + (dst ? 4 : 5) * 3_600_000);
  return `${ymd(utc)}T${p2(utc.getUTCHours())}${p2(utc.getUTCMinutes())}${p2(utc.getUTCSeconds())}Z`;
}

export const stampOf = (d: Date) => `${ymd(d)}T${p2(d.getUTCHours())}${p2(d.getUTCMinutes())}${p2(d.getUTCSeconds())}Z`;

export const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${TZID}`,
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0400",
  "TZNAME:EDT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0400",
  "TZOFFSETTO:-0500",
  "TZNAME:EST",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

/** One recurring class meeting, resolved against the term's dates (shared by the .ics and Apple Calendar exports). */
export type ClassEvent = {
  uid: string;
  /** First class day as YYYY-MM-DD. */
  startDay: string;
  /** Last class day of the term as YYYY-MM-DD (the recurrence ends on it). */
  lastDay: string;
  /** Minutes after midnight, Eastern. */
  startMin: number;
  endMin: number;
  /** Weekdays as 0=Sunday..6=Saturday, Monday first. */
  weekdays: number[];
  /** No-class days (holidays) that fall on a meeting day inside the range, YYYY-MM-DD, ascending. */
  skipDays: string[];
  title: string;
  location: string;
  notes: string;
};

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** The class events for `sections` in `term`; [] when the term's dates are unknown. */
export function classEvents(term: string, sections: Section[]): ClassEvent[] {
  const dates = termDates(term);
  if (!dates) return [];
  return sections.flatMap((s) => s.meetings.flatMap((m, i) => classEvent(term, s, m, i, dates) ?? []));
}

function classEvent(term: string, s: Section, m: Meeting, i: number, dates: NonNullable<ReturnType<typeof termDates>>): ClassEvent | null {
  if (m.start === null) return null;
  const idx = m.days.map((d) => DAY_INDEX[d]).filter((n): n is number => n !== undefined);
  if (idx.length === 0) return null;
  const first = parseDay(dates.first);
  const last = parseDay(dates.last);
  let start = first;
  while (!idx.includes(start.getUTCDay())) start = new Date(start.getTime() + DAY_MS);
  if (start > last) return null;
  const skip = dates.noClasses
    .map(parseDay)
    .filter((d) => d >= start && d <= last && idx.includes(d.getUTCDay()))
    .sort((a, b) => a.getTime() - b.getTime());
  const weekdays = [...new Set(idx)].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  const desc = [`Section ${s.id}`, s.instructors.length ? `Instructors: ${s.instructors.join(", ")}` : ""].filter(Boolean).join("\n");
  return {
    uid: `${term}-${s.courseId}-${s.id}-${i}@turboterp`,
    startDay: isoDay(start),
    lastDay: isoDay(last),
    startMin: m.start,
    endMin: m.end ?? m.start,
    weekdays,
    skipDays: skip.map(isoDay),
    title: `${s.courseId} ${m.type}`,
    location: [m.building, m.room].filter(Boolean).join(" "),
    notes: desc,
  };
}

function eventLines(e: ClassEvent, stamp: string): string[] {
  const start = parseDay(e.startDay);
  const last = parseDay(e.lastDay);
  return [
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${TZID}:${ymd(start)}T${hms(e.startMin)}`,
    `DTEND;TZID=${TZID}:${ymd(start)}T${hms(e.endMin)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${e.weekdays.map((n) => BYDAY[n]).join(",")};UNTIL=${endOfDayUtc(last)}`,
    ...e.skipDays.map((d) => `EXDATE;TZID=${TZID}:${ymd(parseDay(d))}T${hms(e.startMin)}`),
    `SUMMARY:${escapeText(e.title)}`,
    ...(e.location ? [`LOCATION:${escapeText(e.location)}`] : []),
    `DESCRIPTION:${escapeText(e.notes)}`,
    "END:VEVENT",
  ];
}

/** The UTC instant of `minutes` after midnight Eastern on YYYY-MM-DD (handles daylight time). */
export function easternInstant(day: string, minutes: number): Date {
  const d = parseDay(day);
  const nthSunday = (month: number, n: number) => {
    const first = new Date(Date.UTC(d.getUTCFullYear(), month, 1));
    return new Date(first.getTime() + (((7 - first.getUTCDay()) % 7) + 7 * (n - 1)) * DAY_MS);
  };
  const dst = d >= nthSunday(2, 2) && d < nthSunday(10, 1);
  return new Date(d.getTime() + minutes * 60_000 + (dst ? 4 : 5) * 3_600_000);
}

/** The iCalendar text for `sections` in `term`; empty calendar body when the term's dates are unknown. */
export function buildIcs(term: string, sections: Section[], now: Date = new Date()): string {
  const stamp = stampOf(now);
  const events = classEvents(term, sections).flatMap((e) => eventLines(e, stamp));
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TurboTerp//Schedule Builder//EN", "CALSCALE:GREGORIAN", ...VTIMEZONE, ...events, "END:VCALENDAR"];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
