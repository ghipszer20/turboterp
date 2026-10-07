// The gallery's workday filters and sort: editing, the URL form (?c=…&off=F&win=M:480-780&sort=…)
// and the relax buttons of the empty state.

import type { DayRule, ScheduleFilters, Weekday } from "@turboterp/course-data/schedules";
import type { EmptyExplanation, FilterConstraint } from "@turboterp/course-data/explain";
import type { SortKey } from "@turboterp/course-data/sort";
import { DAY_NAME, WEEKDAYS } from "./calendar";
import type { SharedSchedule } from "./share";

export type FilterState = {
  /** Days left out are unrestricted. */
  days: Partial<Record<Weekday, DayRule>>;
  sort: SortKey;
};

export const DEFAULT_FILTERS: FilterState = { days: {}, sort: "best" };

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  // Labels renamed by the owner (2026-10-07); the keys stay so saved schedules and shared links keep working.
  { value: "best", label: "Default" },
  { value: "recommended", label: "Best Teachers" },
  { value: "fewestDays", label: "Fewest days on campus" },
  { value: "latestStart", label: "Latest start" },
  { value: "earliestFinish", label: "Earliest finish" },
  { value: "fewestGaps", label: "Fewest gaps" },
];
const SORT_KEYS = new Set<string>(SORT_OPTIONS.map((o) => o.value));

const COURSE = /^[A-Z]{4}\d{3}[A-Z]?$/;
const isWeekday = (d: string): d is Weekday => (WEEKDAYS as readonly string[]).includes(d);

const TERM = /^\d{6}$/;
const SHARE_PICK = /^([A-Z]{4}\d{3}[A-Z]?)\.([A-Za-z0-9]{1,6})$/;

/** `?term=202608&share=CMSC351.0101~STAT400.0201`; anything malformed means no share at all. */
function readShare(params: URLSearchParams): SharedSchedule | undefined {
  const term = params.get("term");
  const share = params.get("share");
  if (term === null || share === null || !TERM.test(term)) return undefined;
  const picks: Record<string, string> = {};
  for (const part of share.split("~")) {
    const m = SHARE_PICK.exec(part);
    if (!m || m[1] in picks) return undefined;
    picks[m[1]] = m[2];
  }
  return { term, picks };
}

export function readQuery(params: URLSearchParams): { courses?: string[]; filters?: FilterState; share?: SharedSchedule } {
  const out: { courses?: string[]; filters?: FilterState; share?: SharedSchedule } = {};
  const shared = readShare(params);
  if (shared) out.share = shared;
  const c = params.get("c");
  if (c !== null) {
    out.courses = [...new Set(c.split(",").map((s) => s.trim().toUpperCase()).filter((s) => COURSE.test(s)))];
  }
  const off = params.get("off");
  const win = params.get("win");
  const sort = params.get("sort");
  if (off === null && win === null && sort === null) return out;

  const days: FilterState["days"] = {};
  for (const part of (win ?? "").split(",")) {
    const m = /^(M|Tu|W|Th|F):(\d{1,4})-(\d{1,4})$/.exec(part);
    if (!m) continue;
    const from = Number(m[2]);
    const to = Number(m[3]);
    if (from < to && to <= 24 * 60) days[m[1] as Weekday] = { from, to };
  }
  for (const d of (off ?? "").split(",")) if (isWeekday(d)) days[d] = "off";
  out.filters = { days, sort: sort !== null && SORT_KEYS.has(sort) ? (sort as SortKey) : "best" };
  return out;
}

/** Commas and colons are left unescaped so the URL stays readable. */
export function writeQuery(courses: string[], filters: FilterState, share?: SharedSchedule): string {
  const parts: string[] = [];
  if (share && Object.keys(share.picks).length) {
    parts.push(`term=${share.term}`, `share=${Object.entries(share.picks).map(([c, id]) => `${c}.${id}`).join("~")}`);
  }
  if (courses.length) parts.push(`c=${courses.join(",")}`);
  const off = WEEKDAYS.filter((d) => filters.days[d] === "off");
  if (off.length) parts.push(`off=${off.join(",")}`);
  const win = WEEKDAYS.flatMap((d) => {
    const r = filters.days[d];
    return r && r !== "off" ? [`${d}:${r.from}-${r.to}`] : [];
  });
  if (win.length) parts.push(`win=${win.join(",")}`);
  if (filters.sort !== "best") parts.push(`sort=${filters.sort}`);
  return parts.join("&");
}

export function setDayOff(state: FilterState, day: Weekday, off: boolean): FilterState {
  const days = { ...state.days };
  if (off) days[day] = "off";
  else delete days[day];
  return { ...state, days };
}

export function setWindow(state: FilterState, day: Weekday, from: number, to: number): FilterState {
  return { ...state, days: { ...state.days, [day]: { from, to: Math.max(to, from + 60) } } };
}

/** The "same hours every day" shortcut: every day that isn't off gets the window. */
export function applySameHours(state: FilterState, from: number, to: number): FilterState {
  const days: FilterState["days"] = {};
  for (const d of WEEKDAYS) days[d] = state.days[d] === "off" ? "off" : { from, to: Math.max(to, from + 60) };
  return { ...state, days };
}

/** Full sections are never generated (the generator's default), so only the day rules pass through. */
export const toScheduleFilters = (state: FilterState): ScheduleFilters => ({ days: state.days });

export type RelaxOption = { label: string; constraint: FilterConstraint };

/** One button per day rule that blocks every layout. Open seats are never relaxed (owner rule). */
export function relaxOptions(explanation: EmptyExplanation): RelaxOption[] {
  const seen = new Set<string>();
  const out: RelaxOption[] = [];
  for (const b of explanation.blockers) {
    for (const c of b.filters) {
      if (c.kind === "openSeats") continue;
      const key = `${c.kind}:${c.day}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        label: c.kind === "dayOff" ? `Allow classes on ${DAY_NAME[c.day]}` : `Any time on ${DAY_NAME[c.day]}`,
        constraint: c,
      });
    }
  }
  return out;
}

export function relaxConstraint(state: FilterState, c: FilterConstraint): FilterState {
  if (c.kind === "openSeats") return state;
  const days = { ...state.days };
  delete days[c.day];
  return { ...state, days };
}