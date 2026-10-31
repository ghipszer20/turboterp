// Links the builder's course list to the 4-year plan (owner rule: the builder never writes the plan
// by itself; only a confirmed "Update plan" does). Pure; logic lives in app-core's plan-link.
import type { AdvisorPlan, PlanAction } from "@turboterp/app-core/plan-state";
import { builderCourses, describePlanDiff, planCourseDiff, planCourseIds, planTermName } from "@turboterp/app-core/schedule/plan-link";

export type PlanPrompt = { termName: string; text: string; ids: string[] };
export type PlanSync = { linked: boolean; termName: string | null; courses: string[]; prompt: PlanPrompt | null };

/** The courses to show for `term` (the plan's list until the student's own list differs) and the Update plan prompt, if any. */
export function planSync(plan: AdvisorPlan | null, term: string | null, own: string[] | null): PlanSync {
  const termName = term ? planTermName(term) : null;
  if (!plan || !termName) return { linked: false, termName, courses: own ?? [], prompt: null };
  const planCourses = planCourseIds(plan, termName);
  const courses = builderCourses(own, planCourses);
  const diff = planCourseDiff(own, planCourses);
  return { linked: true, termName, courses, prompt: diff ? { termName, text: describePlanDiff(diff), ids: courses } : null };
}

/** The only plan write the builder makes; call it only after the student confirms. */
export const updatePlanAction = (p: PlanPrompt): PlanAction => ({ type: "set-term-courses", term: p.termName, ids: p.ids });
