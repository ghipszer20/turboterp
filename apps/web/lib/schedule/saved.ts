// What the schedule builder remembers on this device (no accounts yet): the term's courses,
// the gallery filters, saved plans A/B/C and the Build-my-own picks.
//
// Plan sync rule (owner): the builder never writes to the 4-year plan on its own -- only an
// explicit, confirmed "Update plan" click does (see plan-link.ts). `courses` is null until the
// student overrides the plan's list for this term; `affectsPlan` says when that override changed.

import type { Weekday } from "@turboterp/course-data/schedules";
import { DEFAULT_FILTERS, type FilterState } from "./filters";

export type PlanId = "A" | "B" | "C";
export const PLAN_IDS: readonly PlanId[] = ["A", "B", "C"];

/** Section id by course id. */
export type SectionPicks = Record<string, string>;

export type SavedSchedule = {
  v: 1;
  term: string;
  /**
   * The student's own course list, in the order they added them -- or null while the builder is
   * still following the 4-year plan's list for this term (see plan-link.ts's `builderCourses`).
   */
  courses: string[] | null;
  filters: FilterState;
  plans: Partial<Record<PlanId, SectionPicks>>;
  /** Build my own: the sections placed so far. */
  own: SectionPicks;
};

export const SAVED_KEY = "turboterp-schedule";

export const emptySaved = (term: string): SavedSchedule => ({
  v: 1,
  term,
  courses: null,
  filters: DEFAULT_FILTERS,
  plans: {},
  own: {},
});

const isPicks = (x: unknown): x is SectionPicks =>
  typeof x === "object" && x !== null && Object.values(x).every((v) => typeof v === "string");

export function parseSaved(raw: string | null, term: string): SavedSchedule {
  if (!raw) return emptySaved(term);
  try {
    const s = JSON.parse(raw) as Partial<SavedSchedule>;
    if (s.v !== 1 || s.term !== term || (s.courses !== null && !Array.isArray(s.courses)) || !isPicks(s.own)) {
      return emptySaved(term);
    }
    const plans: SavedSchedule["plans"] = {};
    for (const p of PLAN_IDS) if (isPicks(s.plans?.[p])) plans[p] = s.plans![p];
    const days: FilterState["days"] = {};
    for (const [d, r] of Object.entries(s.filters?.days ?? {})) {
      if (r === "off" || (typeof r === "object" && typeof r.from === "number" && typeof r.to === "number")) {
        days[d as Weekday] = r;
      }
    }
    return {
      v: 1,
      term,
      courses: s.courses === null ? null : s.courses.filter((c): c is string => typeof c === "string"),
      filters: { days, sort: s.filters?.sort ?? "best" },
      plans,
      own: s.own,
    };
  } catch {
    return emptySaved(term);
  }
}

export const serializeSaved = (s: SavedSchedule) => JSON.stringify(s);

const only = (picks: SectionPicks, courses: string[]) =>
  Object.fromEntries(Object.entries(picks).filter(([c]) => courses.includes(c)));

export function withCourses(s: SavedSchedule, courses: string[]): SavedSchedule {
  const plans: SavedSchedule["plans"] = {};
  for (const p of PLAN_IDS) if (s.plans[p]) plans[p] = only(s.plans[p]!, courses);
  return { ...s, courses: [...courses], plans, own: only(s.own, courses) };
}

export const savePlan = (s: SavedSchedule, plan: PlanId, picks: SectionPicks): SavedSchedule => ({
  ...s,
  plans: { ...s.plans, [plan]: { ...picks } },
});

export function setOwnSection(s: SavedSchedule, courseId: string, sectionId: string | null): SavedSchedule {
  const own = { ...s.own };
  if (sectionId === null) delete own[courseId];
  else own[courseId] = sectionId;
  return { ...s, own };
}

/** True only when the student's own course override changed (added, removed, or first set). */
export function affectsPlan(prev: SavedSchedule, next: SavedSchedule): boolean {
  const a = [...(prev.courses ?? [])].sort().join(",");
  const b = [...(next.courses ?? [])].sort().join(",");
  return a !== b;
}
