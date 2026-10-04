// "Get ready to register": the checklist for the next registration term, the per-term prep state
// kept on this device, and the appointment reminder (.ics with alarms). All pure.
//
// Legal rule: TurboTerp never touches or asks for Testudo credentials, so holds are a manual
// "Check Testudo for holds" check-off only. Registration appointments are typed in by hand.

import type { AcademicEvent } from "@turboterp/campus-data";
import { sectionsConflict, type Section } from "@turboterp/course-data/schedules";
import { escapeText, foldLine, p2, stampOf, VTIMEZONE, ymd } from "./ics";
import { PLAN_IDS, type SavedSchedule } from "./saved";

export const PREP_KEY = "turboterp-registration";

const REG_KINDS: readonly AcademicEvent["kind"][] = ["registration-appointments", "early-registration", "priority-registration"];

export type TermPrep = { appointment?: string; checked: string[] };
/** Per term code ("202701"). */
export type Prep = Record<string, TermPrep>;

const APPOINTMENT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function parsePrep(raw: string | null): Prep {
  if (!raw) return {};
  try {
    const p = JSON.parse(raw) as unknown;
    if (typeof p !== "object" || p === null || Array.isArray(p)) return {};
    const out: Prep = {};
    for (const [term, v] of Object.entries(p)) {
      if (typeof v !== "object" || v === null) continue;
      const t = v as Partial<TermPrep>;
      const checked = Array.isArray(t.checked) ? t.checked.filter((c): c is string => typeof c === "string") : [];
      out[term] = typeof t.appointment === "string" && APPOINTMENT.test(t.appointment) ? { appointment: t.appointment, checked } : { checked };
    }
    return out;
  } catch {
    return {};
  }
}

export const serializePrep = (p: Prep) => JSON.stringify(p);

const termPrep = (p: Prep, term: string): TermPrep => p[term] ?? { checked: [] };

export function setAppointment(p: Prep, term: string, appointment: string | null): Prep {
  const cur = termPrep(p, term);
  const next: TermPrep = { checked: cur.checked };
  if (appointment && APPOINTMENT.test(appointment)) next.appointment = appointment;
  return { ...p, [term]: next };
}

export function toggleChecked(p: Prep, term: string, id: string): Prep {
  const cur = termPrep(p, term);
  const checked = cur.checked.includes(id) ? cur.checked.filter((c) => c !== id) : [...cur.checked, id];
  return { ...p, [term]: { ...cur, checked } };
}

/** Eastern wall-clock "YYYY-MM-DDTHH:mm" as the instant it names (handles daylight time). */
export function easternToDate(local: string): Date | null {
  if (!APPOINTMENT.test(local)) return null;
  const asUtc = Date.parse(`${local}:00Z`);
  if (Number.isNaN(asUtc)) return null;
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  for (const hours of [4, 5]) {
    const d = new Date(asUtc + hours * 3_600_000);
    const parts = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
    if (`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}` === local) return d;
  }
  return null;
}

/** The term (by name, as the calendar uses) of the first registration event that hasn't ended yet. */
export function nextRegistrationTerm(events: AcademicEvent[], now: Date): string | null {
  const today = now.toISOString().slice(0, 10);
  const upcoming = events.filter((e) => REG_KINDS.includes(e.kind) && (e.end ?? e.start) >= today).sort((a, b) => a.start.localeCompare(b.start));
  return upcoming[0]?.term ?? null;
}

export type SeatStatus = { kind: "open"; open: number } | { kind: "waitlist"; note: string };

export const WAITLIST_NOTE =
  "Full: join the waitlist. Opened seats go to the waitlist automatically, and you must check in daily or you lose your spot.";

export type CourseItem = { courseId: string; chosen: Section | null; seat: SeatStatus | null; backups: Section[] };
export type ManualItem = { id: string; label: string; done: boolean };

export type Checklist =
  | { status: "wrong-term"; message: string }
  | { status: "not-published" }
  /** Nothing to prepare yet: the student hasn't added a course. */
  | { status: "no-courses" }
  | {
      status: "ready";
      courses: CourseItem[];
      manual: ManualItem[];
      appointment: string | null;
      windows: AcademicEvent[];
      /** When the seat data was generated. */
      asOf: string | null;
    };

export type ChecklistInput = {
  saved: SavedSchedule;
  /** The builder's course list (it may follow the 4-year plan). */
  courses: string[];
  term: string;
  termName: string;
  sections: Section[];
  events: AcademicEvent[];
  prep: TermPrep | undefined;
  now: Date;
  asOf: string | null;
};

const MANUAL: { id: string; label: string }[] = [
  { id: "advisor", label: "Meet your advisor if your college requires it" },
  { id: "holds", label: "Check Testudo for holds" },
];

export function registrationChecklist(i: ChecklistInput): Checklist {
  const next = nextRegistrationTerm(i.events, i.now);
  if (next !== null && next !== i.termName) return { status: "wrong-term", message: `Switch to ${next} to prepare` };
  if (i.courses.length === 0) return { status: "no-courses" };
  if (i.sections.length === 0) return { status: "not-published" };

  const byId = (courseId: string, id: string | undefined) => (id ? i.sections.find((s) => s.courseId === courseId && s.id === id) ?? null : null);
  const chosen = new Map<string, Section | null>();
  for (const c of i.courses) chosen.set(c, byId(c, i.saved.own[c]) ?? byId(c, i.saved.plans.A?.[c]));

  const courses: CourseItem[] = i.courses.map((courseId) => {
    const pick = chosen.get(courseId) ?? null;
    if (!pick) return { courseId, chosen: null, seat: null, backups: [] };
    const seat: SeatStatus = pick.seats.open > 0 ? { kind: "open", open: pick.seats.open } : { kind: "waitlist", note: WAITLIST_NOTE };
    const fromPlans: Section[] = [];
    for (const p of PLAN_IDS.filter((p) => p !== "A")) {
      const s = byId(courseId, i.saved.plans[p]?.[courseId]);
      if (s && s.id !== pick.id && !fromPlans.some((x) => x.id === s.id)) fromPlans.push(s);
    }
    let backups = fromPlans;
    if (backups.length === 0) {
      const rest = [...chosen.values()].filter((s): s is Section => s !== null && s.courseId !== courseId);
      backups = i.sections
        .filter((s) => s.courseId === courseId && s.id !== pick.id && s.seats.open > 0 && !rest.some((r) => sectionsConflict(r, s)))
        .slice(0, 2);
    }
    return { courseId, chosen: pick, seat, backups };
  });

  const done = new Set(i.prep?.checked ?? []);
  return {
    status: "ready",
    courses,
    manual: MANUAL.map((m) => ({ ...m, done: done.has(m.id) })),
    appointment: i.prep?.appointment ?? null,
    windows: i.events.filter((e) => e.term === i.termName && REG_KINDS.includes(e.kind)),
    asOf: i.asOf,
  };
}

/** The appointment as a calendar file: one 30-minute event, alarms 1 day and 15 minutes before. */
export function appointmentIcs(termName: string, appointment: string, now: Date = new Date()): string {
  const start = appointment.replace(/[-:]/g, "") + "00";
  const startMs = Date.parse(`${appointment}:00Z`) + 30 * 60_000;
  const end = new Date(startMs);
  const endStamp = `${ymd(end)}T${p2(end.getUTCHours())}${p2(end.getUTCMinutes())}00`;
  const alarm = (trigger: string, text: string) => [
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(text)}`,
    `TRIGGER:${trigger}`,
    "END:VALARM",
  ];
  const summary = `Registration appointment (${termName})`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TurboTerp//Registration//EN",
    "CALSCALE:GREGORIAN",
    ...VTIMEZONE,
    "BEGIN:VEVENT",
    `UID:registration-${start}@turboterp`,
    `DTSTAMP:${stampOf(now)}`,
    `DTSTART;TZID=America/New_York:${start}`,
    `DTEND;TZID=America/New_York:${endStamp}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText("Register for classes in Testudo. Check for holds and have your backup sections ready.")}`,
    ...alarm("-P1D", `${summary} is tomorrow`),
    ...alarm("-PT15M", `${summary} starts in 15 minutes`),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
