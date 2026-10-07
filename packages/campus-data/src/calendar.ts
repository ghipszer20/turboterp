// UMD registrar's standard registration dates and deadlines, one page per term.

import * as cheerio from "cheerio";
import { addDays } from "./dates.ts";
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
  /** The registrar's explanation under the title (absent on older snapshots). */
  description?: string;
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
    // The title is everything before the first line break (bold text plus any suffix such as
    // " - University closed"); the explanation sits after it.
    const [head = "", ...rest] = (first.html() ?? "").split(/<br\s*\/?>/i);
    const collapse = (h: string) => cheerio.load(`<div>${h}</div>`)("div").text().replace(/\s+/g, " ").trim();
    const label = collapse(head);
    const description = collapse(rest.join(" "));
    const dates = parseDates(cells.eq(1).text());
    if (!label || dates.length === 0) return;
    const event: AcademicEvent = { term, kind: classify(label), label, start: dates[0]! };
    if (description) event.description = description;
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

const isoToday = () => new Date().toISOString().slice(0, 10);

/**
 * Every term the registrar's picker lists that has not fully passed. The picker runs newest
 * first, so we stop at the first term whose dates are all before `today`. Pages load one at a
 * time; a page that fails is skipped, and we only throw when none load.
 */
export async function fetchAcademicCalendar(today: string = isoToday()): Promise<AcademicEvent[]> {
  const url = (id: string) => `${CALENDAR_URL}?field_academic_terms_target_id=${id}`;
  const first = await fetchText("calendar", CALENDAR_URL);
  const terms = listCalendarTerms(first);
  if (terms.length === 0) throw new Error("calendar: no terms listed");
  const selected = cheerio.load(first)(`${TERM_OPTIONS}[selected]`).first().attr("value");
  const events: AcademicEvent[] = [];
  let loaded = 0;
  let lastError: unknown;
  for (const t of terms) {
    let html: string;
    try {
      html = t.id === selected ? first : await fetchText("calendar", url(t.id));
    } catch (err) {
      lastError = err;
      continue;
    }
    loaded++;
    const parsed = parseAcademicCalendar(html, t.name);
    if (parsed.length > 0 && !parsed.some((e) => (e.end ?? e.start) >= today)) break;
    events.push(...parsed);
  }
  if (loaded === 0) throw lastError instanceof Error ? lastError : new Error("calendar: no term loaded");
  return events;
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const shortDate = (iso: string) => `${SHORT_MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}`;

/**
 * The registrar's "Winter Break - University closed" row is only the holiday closure (Dec 25 – Jan 3).
 * For students the break runs from the day after fall finals to the day before spring classes, with
 * winter term inside it, so that row is replaced by the student break, closure dates kept in the
 * description. Needs both terms loaded; otherwise the events come back unchanged.
 */
export function withWinterBreak(events: AcademicEvent[]): AcademicEvent[] {
  const closure = events.find((e) => /^winter break\b/i.test(e.label) && !e.derived);
  if (!closure) return events;
  const fallYear = Number(closure.start.slice(0, 4));
  const finals = events.find((e) => e.kind === "finals" && e.term === `Fall ${fallYear}`);
  const spring = events.find((e) => e.kind === "first-day" && e.term === `Spring ${fallYear + 1}`);
  if (!finals || !spring) return events;
  const closed = `University closed ${shortDate(closure.start)}${closure.end ? ` – ${shortDate(closure.end)}` : ""}.`;
  const winterBreak: AcademicEvent = {
    term: closure.term,
    kind: "other",
    label: "Winter Break",
    start: addDays(finals.end ?? finals.start, 1),
    end: addDays(spring.start, -1),
    description: `No fall or spring classes; Winter term runs during the break. ${closed}`,
    derived: true,
  };
  return events.map((e) => (e === closure ? winterBreak : e));
}
