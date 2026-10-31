// checkTrack (@turboterp/tracks) sums a course's own `credits`, defaulting a missing one to 0
// (its studentCourses). Advisor plan courses usually carry no explicit credits override (the
// catalog is the source of truth for a normal course), so resolvedPlan fills each course's
// credits from the catalog before handing the plan to checkTrack -- otherwise every course would
// count as 0 credits and GPA protection (which divides quality points by credits) would never fire.

import type { PlanCatalog } from "@turboterp/plan/catalog";
import type { Plan } from "@turboterp/plan/check";

export function resolvedPlan(plan: Plan, catalog: PlanCatalog): Plan {
  return {
    ...plan,
    terms: plan.terms.map((t) => ({
      ...t,
      courses: t.courses.map((c) => ({ ...c, credits: c.credits ?? catalog.get(c.id)?.credits.min ?? 0 })),
    })),
  };
}
