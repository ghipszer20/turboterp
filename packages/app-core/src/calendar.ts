// Pure helpers over the registrar's academic-calendar events (Today, plan grid).

import type { AcademicEvent, AcademicEventKind } from "@turboterp/campus-data";

const SHORT: Partial<Record<AcademicEventKind, string>> = {
  "registration-appointments": "Registration appointments",
  "priority-registration": "Priority registration",
  "early-registration": "Early registration",
  "first-day": "First day of classes",
  "schedule-adjustment": "Schedule adjustment ends",
  "pass-fail": "Pass/fail deadline",
  "drop-w": "Last day to drop with W",
  "apply-to-graduate": "Apply to graduate",
  "last-class": "Last day of classes",
  finals: "Finals",
};

const TERM_ORDER: AcademicEventKind[] = ["apply-to-graduate", "pass-fail", "drop-w", "finals"];

const endOf = (e: AcademicEvent) => e.end ?? e.start;
const byStart = (a: AcademicEvent, b: AcademicEvent) => a.start.localeCompare(b.start);

/** Readable name for an event kind ("Last day to drop with W"). */
export function eventTitle(e: AcademicEvent): string {
  return SHORT[e.kind] ?? e.label;
}

/** Title for the Calendar tab: says what the date is for, naming the term where the Registrar's title does not. */
export function calendarTitle(e: AcademicEvent): string {
  const { term, label } = e;
  switch (e.kind) {
    case "registration-appointments":
      return `${term} registration: your time slot is posted on Testudo`;
    case "priority-registration":
      return `${term} priority registration begins`;
    case "early-registration":
      return `${term} early registration`;
    case "first-day":
      return `First day of ${term} classes`;
    case "last-class":
      return `Last day of ${term} classes`;
    case "finals":
      return `${term} final exams`;
    case "schedule-adjustment":
      return `${term} schedule adjustment period`;
    case "pass-fail":
      return `${term} pass/fail deadline`;
    case "drop-w": {
      const suffix = /\(.*\)\s*$/.exec(label)?.[0];
      return `Last day to drop a ${term} course with a W${suffix ? ` ${suffix}` : ""}`;
    }
    case "apply-to-graduate":
      return label;
    default:
      if (/^general registration/i.test(label)) return `${term} general registration`;
      if (/^(schedule of classes|mandatory waitlist)/i.test(label)) return `${term} ${label}`;
      return label;
  }
}

/** Drop-with-W, pass/fail and finals for a term, plus apply-to-graduate on the graduation term. */
export function termKeyDates(events: AcademicEvent[], termName: string, isGraduationTerm: boolean): AcademicEvent[] {
  const kinds = TERM_ORDER.filter((k) => isGraduationTerm || k !== "apply-to-graduate");
  return events
    .filter((e) => e.term === termName && kinds.includes(e.kind))
    .sort((a, b) => a.start.localeCompare(b.start) || kinds.indexOf(a.kind) - kinds.indexOf(b.kind));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Feb 9", or "May 13–20" / "Dec 28–Jan 3" for a range. */
export function formatEventDate(e: AcademicEvent): string {
  const md = (iso: string) => ({ m: MONTHS[Number(iso.slice(5, 7)) - 1]!, d: Number(iso.slice(8, 10)) });
  const s = md(e.start);
  if (!e.end) return `${s.m} ${s.d}`;
  const t = md(e.end);
  return s.m === t.m ? `${s.m} ${s.d}–${t.d}` : `${s.m} ${s.d}–${t.m} ${t.d}`;
}

const LINE_LABEL: Partial<Record<AcademicEventKind, string>> = {
  "pass-fail": "Pass/fail",
  "drop-w": "Drop with W",
  "apply-to-graduate": "Apply to graduate",
  finals: "Finals",
};

/** One muted line for a plan term: "Drop with W Apr 13 · Pass/fail Feb 9 · Finals May 13–20". */
export function formatKeyDates(events: AcademicEvent[]): string {
  return events.map((e) => `${LINE_LABEL[e.kind] ?? eventTitle(e)} ${formatEventDate(e)}`).join(" · ");
}

// ---- Calendar tab ----

const NOT_KEY = /refund|transcript|clearance|conferral|grades|waitlist|graduate student|schedule of classes|cancel registration|general registration/i;
const KEY_OTHER = /break|holiday|recess|reading day|labor day|thanksgiving|martin luther king|presidents|memorial|juneteenth|commencement/i;
const HIGHLIGHT_OTHER = /break|holiday|recess|labor day|thanksgiving|martin luther king|presidents|memorial|juneteenth/i;

/** Dates most students care about: breaks, holidays, class start/end, finals, registration, key deadlines. */
export function isKeyEvent(e: AcademicEvent): boolean {
  // Every classified kind is a key date; NOT_KEY only weeds out "other" rows.
  return e.kind !== "other" || (KEY_OTHER.test(e.label) && !NOT_KEY.test(e.label));
}

/** Breaks, holidays and finals stand out in the list. */
export function isHighlighted(e: AcademicEvent): boolean {
  return e.kind === "finals" || (e.kind === "other" && HIGHLIGHT_OTHER.test(e.label));
}

const SEASONS = ["winter", "spring", "summer", "fall"];

/** "Spring 2027" sorts after "Fall 2026". */
function termRank(term: string): number {
  const [season = "", year = "0"] = term.toLowerCase().split(" ");
  return Number(year) * 10 + SEASONS.indexOf(season);
}

/** Finished before `today` (an event still under way is not past). */
export function isPast(e: AcademicEvent, today: string): boolean {
  return endOf(e) < today;
}

/**
 * Drops repeats of the same event (same label, overlapping dates), keeping the widest range.
 * The registrar lists some dates under two terms (Commencement); the later term is named.
 */
export function dedupeEvents(events: AcademicEvent[]): AcademicEvent[] {
  const out: AcademicEvent[] = [];
  for (const e of [...events].sort(byStart)) {
    const i = out.findIndex((o) => o.label === e.label && e.start <= endOf(o));
    if (i < 0) {
      out.push(e);
      continue;
    }
    const kept = out[i]!;
    const widest = endOf(e) > endOf(kept) ? { ...e, start: kept.start } : kept;
    out[i] = { ...widest, term: termRank(e.term) > termRank(kept.term) ? e.term : kept.term };
  }
  return out;
}

export type MonthGroup = { key: string; title: string; events: AcademicEvent[] };

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Events grouped by the month they start in, in date order. */
export function groupByMonth(events: AcademicEvent[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const e of [...events].sort(byStart)) {
    const key = e.start.slice(0, 7);
    let g = groups[groups.length - 1];
    if (!g || g.key !== key) {
      g = { key, title: `${MONTH_NAMES[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`, events: [] };
      groups.push(g);
    }
    g.events.push(e);
  }
  return groups;
}

/** The soonest event that has not finished by `today` (one in progress counts). */
export function nextEvent(events: AcademicEvent[], today: string): AcademicEvent | undefined {
  return [...events].sort(byStart).find((e) => endOf(e) >= today);
}
