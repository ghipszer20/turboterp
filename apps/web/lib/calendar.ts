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

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The next dates worth showing: useful kinds only, still ahead (or under way) within `days`, soonest first. */
export function upcomingDates(events: AcademicEvent[], today: string, days = 45, max = 4): AcademicEvent[] {
  const limit = addDaysIso(today, days);
  return events
    .filter((e) => e.kind !== "other" && endOf(e) >= today && e.start <= limit)
    .sort(byStart)
    .slice(0, max);
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
