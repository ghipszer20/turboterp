// Sharing a schedule by link: the picks travel in the URL (no accounts, no server). Opening one is
// read-only; saving is an explicit choice of Plan A/B/C and touches nothing else (owner ruling:
// the builder never changes the 4-year plan or the student's saved schedule on its own).

import type { Section } from "@turboterp/course-data/schedules";
import { savePlan, withCourses, type PlanId, type SavedSchedule, type SectionPicks } from "./saved";

export type SharedSchedule = { term: string; picks: SectionPicks };

/** Resolves shared picks against the loaded sections; ids that no longer exist come back as "COURSE id". */
export function resolveShared(
  picks: SectionPicks,
  sectionByKey: ReadonlyMap<string, Section>,
): { found: Section[]; missing: string[] } {
  const found: Section[] = [];
  const missing: string[] = [];
  for (const [c, id] of Object.entries(picks)) {
    const s = sectionByKey.get(`${c}/${id}`);
    if (s) found.push(s);
    else missing.push(`${c} ${id}`);
  }
  return { found, missing };
}

/** Writes only `plan`'s picks and appends the shared courses to the builder's course list. */
export function saveShared(s: SavedSchedule, plan: PlanId, picks: SectionPicks, currentCourses: string[]): SavedSchedule {
  const courses = [...currentCourses, ...Object.keys(picks).filter((c) => !currentCourses.includes(c))];
  return savePlan(withCourses(s, courses), plan, picks);
}
