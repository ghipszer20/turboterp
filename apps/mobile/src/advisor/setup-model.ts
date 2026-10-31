// Setup form state and its mapping to the plan, without React Native imports. Ported from the
// web's SetupView: the same fields, the same plan result.
import { newPlan, planReducer, type AdvisorPlan, type DegreeChoice } from "@turboterp/app-core/plan-state";
import { CATALOG_YEARS, collegeOf, degreeModeOf } from "@turboterp/app-core/programs";
import { examMilestone, type Track } from "@turboterp/app-core/tracks";
import { COLLEGES, type College } from "@turboterp/plan/credit-caps";
import type { Milestone } from "@turboterp/tracks/list";

export interface SetupForm {
  programs: string[];
  catalogYear: string;
  startTerm: string;
  college: College;
  transfer: boolean;
  tracks: string[];
  degreeChoice: DegreeChoice | undefined;
  examTerms: Record<string, string>;
}

export function initialForm(plan: AdvisorPlan | null, thisYear: number): SetupForm {
  return {
    programs: plan?.programs ?? [],
    catalogYear: plan?.catalogYear ?? CATALOG_YEARS[0],
    startTerm: plan?.startTerm ?? `Fall ${thisYear}`,
    college: plan?.college ?? collegeOf(plan?.programs ?? []) ?? COLLEGES[0]!.code,
    transfer: plan?.entry === "transfer",
    tracks: plan?.tracks ?? [],
    degreeChoice: plan?.degreeMode,
    examTerms: plan?.examTerms ?? {},
  };
}

export const canContinue = (form: SetupForm): boolean => form.programs.length > 0;

/** True when changing the first term would move planned courses (the web's warning). */
export const movesCourses = (plan: AdvisorPlan | null, form: SetupForm): boolean =>
  plan !== null && plan.startTerm !== form.startTerm && plan.terms.some((t) => t.courses.length > 0);

/** The plan after setup: a fresh one on first run, the reducer's setup action when editing. */
export function applySetup(plan: AdvisorPlan | null, form: SetupForm): AdvisorPlan {
  const degreeMode = degreeModeOf(form.programs, form.degreeChoice);
  const setup = {
    programs: form.programs,
    catalogYear: form.catalogYear,
    startTerm: form.startTerm,
    tracks: form.tracks,
    examTerms: form.examTerms,
    expectedGrades: plan?.expectedGrades ?? {},
    college: form.college,
    ...(degreeMode ? { degreeMode } : {}),
  };
  const entry = form.transfer ? ("transfer" as const) : ("freshman" as const);
  const next = plan ? planReducer(plan, { type: "setup", ...setup, entry }) : newPlan(setup);
  return !plan && form.transfer ? { ...next, entry } : next;
}

/** Every distinct exam the chosen tracks point to, with the track names sharing it. */
export function sharedExamMilestones(chosen: Track[]): { milestone: Milestone; trackNames: string[] }[] {
  const byId = new Map<string, { milestone: Milestone; trackNames: string[] }>();
  for (const track of chosen) {
    const milestone = examMilestone(track);
    if (!milestone) continue;
    const entry = byId.get(milestone.id) ?? { milestone, trackNames: [] };
    entry.trackNames.push(track.name);
    byId.set(milestone.id, entry);
  }
  return [...byId.values()];
}
