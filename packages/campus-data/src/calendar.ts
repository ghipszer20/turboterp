// UMD registrar's standard registration dates and deadlines, one page per term.

import * as cheerio from "cheerio";
import { fetchText } from "./http.ts";

export type AcademicEventKind =
  | "registration-appointments"
  | "priority-registration"
  | "early-registration"
  | "first-day"
  | "schedule-adjustment"
  | "pass-fail"
  | "drop-w"
  | "apply-to-graduate"
  | "last-class"
  | "finals"
  | "other";

export type AcademicEvent = {
  term: string;
  kind: AcademicEventKind;
  label: string;
  start: string;
  end?: string;
  /** Not on the registrar's page; worked out from another row. */
  derived?: boolean;
};

export type CalendarTerm = { id: string; name: string };

const CALENDAR_URL = "https://registrar.umd.edu/calendars/standard-registration-dates-deadlines";
const TERM_OPTIONS = "#edit-field-academic-terms-target-id option";

export function listCalendarTerms(html: string): CalendarTerm[] {
  const $ = cheerio.load(html);
  return $(TERM_OPTIONS)
    .map((_, o) => ({ id: $(o).attr("value") ?? "", name: $(o).text().trim() }))
    .get()
    .filter((t) => t.id && t.name);
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Feb 9, 2027 (Tue)" dates in a cell, as ISO strings. */
function parseDates(text: string): string[] {
  return [...text.matchAll(/([A-Z][a-z]{2})[a-z]*\s+(\d{1,2}),\s*(\d{4})/g)].flatMap((m) => {
    const month = MONTHS.indexOf(m[1]!.toLowerCase()) + 1;
    return month ? [`${m[3]}-${String(month).padStart(2, "0")}-${m[2]!.padStart(2, "0")}`] : [];
  });
}

function classify(label: string): AcademicEventKind {
  const l = label.toLowerCase();
  if (l.startsWith("registration appointment")) return "registration-appointments";
  if (l.startsWith("priority registration")) return "priority-registration";
  if (l.startsWith("early registration")) return "early-registration";
  if (l.startsWith("first day of classes")) return "first-day";
  if (l.startsWith("schedule adjustment")) return "schedule-adjustment";
  if (/^last day to drop a course with a w\b/.test(l)) return "drop-w";
  if (/^last day to apply for .*graduation/.test(l)) return "apply-to-graduate";
  if (l.startsWith("last day of classes")) return "last-class";
  if (l.startsWith("final exams")) return "finals";
  return "other";
}

export function parseAcademicCalendar(html: string, term: string): AcademicEvent[] {
  const $ = cheerio.load(html);
  const events: AcademicEvent[] = [];
  $("table tbody tr").each((_, tr) => {
    const cells = $(tr).find("td");
    if (cells.length < 2) return;
    const first = cells.eq(0);
    const label = (first.find("strong").first().text() || first.text()).replace(/\s+/g, " ").trim();
    const dates = parseDates(cells.eq(1).text());
    if (!label || dates.length === 0) return;
    const event: AcademicEvent = { term, kind: classify(label), label, start: dates[0]! };
    if (dates[1] && dates[1] !== dates[0]) event.end = dates[1];
    events.push(event);
  });
  // The registrar lists no pass/fail deadline; grading method can change until the
  // schedule adjustment period ends, so that date stands in for it.
  const adjustment = events.find((e) => e.kind === "schedule-adjustment");
  if (adjustment) {
    events.push({ term, kind: "pass-fail", label: "Pass/fail deadline", start: adjustment.end ?? adjustment.start, derived: true });
  }
  return events;
}

/** The registrar's default (current) term and the next two (the picker runs newest first, so they sit just above it). */
export async function fetchAcademicCalendar(): Promise<AcademicEvent[]> {
  const url = (id: string) => `${CALENDAR_URL}?field_academic_terms_target_id=${id}`;
  const first = await fetchText("calendar", CALENDAR_URL);
  const terms = listCalendarTerms(first);
  const selected = cheerio.load(first)(`${TERM_OPTIONS}[selected]`).first().attr("value");
  const start = Math.max(0, terms.findIndex((t) => t.id === selected));
  const wanted = terms.slice(Math.max(0, start - 2), start + 1).reverse();
  if (wanted.length === 0) throw new Error("calendar: no terms listed");
  const pages = await Promise.all(
    wanted.map((t) => (t.id === terms[start]?.id ? Promise.resolve(first) : fetchText("calendar", url(t.id)))),
  );
  return wanted.flatMap((t, i) => parseAcademicCalendar(pages[i]!, t.name));
}
