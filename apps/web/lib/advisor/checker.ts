// The stored plan as @turboterp/plan's checker reads it.

import type { CreditCourse } from "@turboterp/credit";
import type { Plan } from "@turboterp/plan/check";
import type { AdvisorPlan } from "./plan-state";

export function checkerPlan(plan: AdvisorPlan, priorCourses: CreditCourse[]): Plan {
  return {
    terms: plan.terms.map((t) => ({ name: t.name, courses: t.courses.map((c) => ({ ...c })) })),
    priorCredit: priorCourses.map((c) => ({
      id: c.id,
      credits: c.credits,
      ...(c.grade ? { grade: c.grade } : {}),
      genEd: c.genEd ?? [],
      ...(c.genEdCredits !== undefined ? { genEdCredits: c.genEdCredits } : {}),
      source: c.source,
    })),
    ...(plan.mastersCredits !== undefined ? { mastersCredits: plan.mastersCredits } : {}),
  };
}
