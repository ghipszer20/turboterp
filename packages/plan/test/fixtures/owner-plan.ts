// The owner's four-year plan, Math (Applied) + CS, starting Fall 2026: a realistic fixture built
// only from courses in the Spring 2027 Schedule of Classes fixture. Not an advising recommendation.

import { creditForAp, toStudentCourses } from "@turboterp/credit";
import type { Plan } from "../../src/check.ts";

/** AP Calculus BC 5: MATH140 and MATH141 (UMD's AP chart awards both for a 4 or 5). */
const AP_CALCULUS_BC = toStudentCourses([creditForAp("Calculus BC", 5)]).courses;

const planned = (...ids: string[]) => ids.map((id) => ({ id }));

export function ownerPlan(): Plan {
  return {
    priorCredit: AP_CALCULUS_BC,
    terms: [
      { name: "Fall 2026", courses: planned("CMSC131", "MATH240", "ENGL101", "CMNS100", "HIST200") },
      { name: "Spring 2027", courses: planned("CMSC132", "MATH241", "COMM107", "PHIL140", "CHEM131", "CHEM132") },
      { name: "Fall 2027", courses: planned("CMSC216", "CMSC250", "MATH246", "MATH310") },
      { name: "Spring 2028", courses: planned("CMSC330", "CMSC351", "STAT410", "ARTH200", "AAAS100") },
      { name: "Fall 2028", courses: planned("CMSC320", "MATH410", "MATH401", "AMSC460", "ECON200") },
      { name: "Spring 2029", courses: planned("CMSC420", "CMSC335", "MATH411", "STAT401", "ENGL394") },
      { name: "Fall 2029", courses: planned("CMSC414", "CMSC451", "MATH420", "MATH462", "PSYC100") },
      { name: "Spring 2030", courses: planned("CMSC412", "CMSC421", "SOCY100", "ANTH260") },
    ],
  };
}

/** A copy of the plan with one course moved to another term. */
export function moved(plan: Plan, courseId: string, toTerm: string): Plan {
  return {
    ...plan,
    terms: plan.terms.map((t) => ({
      ...t,
      courses: [...t.courses.filter((c) => c.id !== courseId), ...(t.name === toTerm ? [{ id: courseId }] : [])],
    })),
  };
}

/** A copy of the plan with courses added to one term. */
export function added(plan: Plan, toTerm: string, ...ids: string[]): Plan {
  return { ...plan, terms: plan.terms.map((t) => (t.name === toTerm ? { ...t, courses: [...t.courses, ...planned(...ids)] } : t)) };
}
