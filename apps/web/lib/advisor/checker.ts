// The stored plan as @turboterp/plan's checker reads it.

import type { CreditCourse } from "@turboterp/credit";
import type { Plan } from "@turboterp/plan/check";
import { termEnded } from "./past-terms";
import type { AdvisorPlan } from "./plan-state";

export function checkerPlan(plan: AdvisorPlan, priorCourses: CreditCourse[], today: Date = new Date()): Plan {
  return {
    // A course in a term that has ended counts as completed, graded or not (owner ruling 2026-10-07).
    terms: plan.terms.map((t) => {
      const past = termEnded(t.name, today);
      return { name: t.name, courses: t.courses.map((c) => ({ ...c, ...(past ? { status: "completed" as const } : {}) })) };
    }),
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
