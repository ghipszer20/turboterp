// Links the schedule builder's term (a Testudo id, e.g. "202701") to the student's 4-year plan
// (a term name, e.g. "Spring 2027"). Owner ruling: the builder "should give you the option to
// update the plan, but you'd have to confirm that. shouldn't be automatic." So the builder keeps
// its own course list (SavedSchedule.courses, null until the student overrides it) and only
// *reads* the plan: it follows the plan's course list for the matching term until the student's
// own list first differs, and only an explicit "Update plan" click ever writes back to the plan.
// Sections stay builder-only regardless (saved.ts).

import { termCourseIds, type AdvisorPlan } from "@turboterp/app-core/plan-state";
import { sortTerms, termFromMatriculationId } from "@turboterp/app-core/terms";

/** The plan's term name for the builder's schedule term, or null if it can't be parsed. */
export const planTermName = (scheduleTerm: string): string | null => termFromMatriculationId(scheduleTerm);

/** The plan's course ids for `termName`, or [] when the plan has no such term (yet). */
export const planCourseIds = (plan: AdvisorPlan, termName: string): string[] => termCourseIds(plan, termName);

/**
 * Other plan terms (sorted) that also have `courseId`, excluding `termName`. Owner ruling:
 * "the same course in another plan term: ask nothing; show a small note in the builder."
 */
export function otherPlannedTerms(plan: AdvisorPlan, termName: string, courseId: string): string[] {
  const names = plan.terms.filter((t) => t.name !== termName && t.courses.some((c) => c.id === courseId)).map((t) => t.name);
  return sortTerms(names);
}

/**
 * A `?c=` link's courses, applied safely: replaces the list for a standalone builder (today's
 * behavior), but only adds to a plan-linked term — a stale or shared link must never delete a
 * course the plan already has for that term.
 */
export function applyQueryCourses(current: string[], query: string[], linked: boolean): string[] {
  return linked ? [...new Set([...current, ...query])] : [...query];
}

const sameSet = (a: string[], b: string[]): boolean => a.length === b.length && a.every((id) => b.includes(id));

/**
 * The builder's course list to show: `own` (the student's local override) once it differs from
 * the plan term's courses, otherwise the plan's own list — so the builder "follows" the plan
 * (including edits made in the Advisor tab) until the student's own list first diverges from it.
 * `own` is null before the student has ever touched this term's course list.
 */
export function builderCourses(own: string[] | null, planCourses: string[]): string[] {
  return own === null || sameSet(own, planCourses) ? planCourses : own;
}

export type PlanCourseDiff = { adds: string[]; removes: string[] };

/**
 * What clicking "Update plan" would change: the plan term's courses replaced by `own`'s — or
 * null while the builder is still following the plan (own is null, or already matches it).
 * Owner ruling: never automatic; this only ever feeds a confirmation prompt.
 */
export function planCourseDiff(own: string[] | null, planCourses: string[]): PlanCourseDiff | null {
  if (own === null || sameSet(own, planCourses)) return null;
  return {
    adds: own.filter((id) => !planCourses.includes(id)),
    removes: planCourses.filter((id) => !own.includes(id)),
  };
}

/** "Adds CMSC216 · Removes PHIL140" (either half omitted when empty). */
export function describePlanDiff(diff: PlanCourseDiff): string {
  const parts: string[] = [];
  if (diff.adds.length) parts.push(`Adds ${diff.adds.join(", ")}`);
  if (diff.removes.length) parts.push(`Removes ${diff.removes.join(", ")}`);
  return parts.join(" · ");
}
