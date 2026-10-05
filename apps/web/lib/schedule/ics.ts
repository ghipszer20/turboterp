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

function eventLines(term: string, s: Section, m: Meeting, i: number, stamp: string, dates: NonNullable<ReturnType<typeof termDates>>): string[] {
  if (m.start === null) return [];
  const idx = m.days.map((d) => DAY_INDEX[d]).filter((n): n is number => n !== undefined);
  if (idx.length === 0) return [];
  const first = parseDay(dates.first);
  const last = parseDay(dates.last);
  let start = first;
  while (!idx.includes(start.getUTCDay())) start = new Date(start.getTime() + DAY_MS);
  if (start > last) return [];
  const end = m.end ?? m.start;
  const exdates = dates.noClasses
    .map(parseDay)
    .filter((d) => d >= start && d <= last && idx.includes(d.getUTCDay()))
    .sort((a, b) => a.getTime() - b.getTime());
  const byday = [...new Set(idx)].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((n) => BYDAY[n]);
  const where = [m.building, m.room].filter(Boolean).join(" ");
  const desc = [`Section ${s.id}`, s.instructors.length ? `Instructors: ${s.instructors.join(", ")}` : ""].filter(Boolean).join("\n");
  return [
    "BEGIN:VEVENT",
    `UID:${term}-${s.courseId}-${s.id}-${i}@turboterp`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${TZID}:${ymd(start)}T${hms(m.start)}`,
    `DTEND;TZID=${TZID}:${ymd(start)}T${hms(end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${byday.join(",")};UNTIL=${endOfDayUtc(last)}`,
    ...exdates.map((d) => `EXDATE;TZID=${TZID}:${ymd(d)}T${hms(m.start!)}`),
    `SUMMARY:${escapeText(`${s.courseId} ${m.type}`)}`,
    ...(where ? [`LOCATION:${escapeText(where)}`] : []),
    `DESCRIPTION:${escapeText(desc)}`,
    "END:VEVENT",
  ];
}

/** The iCalendar text for `sections` in `term`; empty calendar body when the term's dates are unknown. */
export function buildIcs(term: string, sections: Section[], now: Date = new Date()): string {
  const dates = termDates(term);
  const stamp = stampOf(now);
  const events = dates ? sections.flatMap((s) => s.meetings.flatMap((m, i) => eventLines(term, s, m, i, stamp, dates))) : [];
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TurboTerp//Schedule Builder//EN", "CALSCALE:GREGORIAN", ...VTIMEZONE, ...events, "END:VCALENDAR"];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/** One all-day event (inclusive of `end` when given) as a calendar file. Dates are "YYYY-MM-DD". */
export function allDayIcs(e: { title: string; start: string; end?: string; description?: string }, now: Date = new Date()): string {
  const last = parseDay(e.end ?? e.start);
  const exclusiveEnd = new Date(last.getTime() + DAY_MS);
  const day = e.start.replace(/-/g, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TurboTerp//Academic Calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${day}-${escapeText(e.title).replace(/[^A-Za-z0-9]+/g, "-")}@turboterp`,
    `DTSTAMP:${stampOf(now)}`,
    `DTSTART;VALUE=DATE:${day}`,
    `DTEND;VALUE=DATE:${ymd(exclusiveEnd)}`,
    `SUMMARY:${escapeText(e.title)}`,
    ...(e.description ? [`DESCRIPTION:${escapeText(e.description)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
