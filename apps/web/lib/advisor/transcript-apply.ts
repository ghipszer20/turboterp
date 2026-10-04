// Applies a student-reviewed transcript import to the plan. Pure and plan-state-shaped: folds
// over the existing planReducer actions (no new plan-state actions needed) so this is the only
// place a transcript import ever touches an AdvisorPlan, and only ever with rows the student has
// already reviewed and confirmed -- never the raw parse result.

import { planReducer, type AdvisorPlan } from "./plan-state";
import { parseTerm } from "./terms";

export type SelectedCourse = {
  term: string;
  code: string;
  grade: string | null;
  credits: number | null;
  status: "completed" | "in-progress";
};

export type SelectedAp = { exam: string; score: number };

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `t${Math.random().toString(36).slice(2)}`);

export function applyTranscriptImport(plan: AdvisorPlan, selection: { courses: SelectedCourse[]; ap: SelectedAp[]; gpa?: number | null }): AdvisorPlan {
  let next = plan;
  // The transcript's printed cumulative GPA replaces any earlier value (the student can still edit it); none printed leaves it alone.
  if (selection.gpa !== undefined && selection.gpa !== null) next = planReducer(next, { type: "set-gpa", gpa: selection.gpa });

  for (const course of selection.courses) {
    if (!parseTerm(course.term)) continue; // defensive: every parsed term should already be "Season Year"
    if (!next.terms.some((t) => t.name === course.term)) {
      next = planReducer(next, { type: "add-term", name: course.term });
    }
    next = planReducer(next, {
      type: "add-course",
      term: course.term,
      id: course.code,
      ...(course.credits === undefined || course.credits === null ? {} : { credits: course.credits }),
    });
    if (course.status === "completed") {
      next = planReducer(next, {
        type: "set-course",
        term: course.term,
        id: course.code,
        status: "completed",
        ...(course.grade === null ? {} : { grade: course.grade }),
      });
    }
  }

  // Testudo lists one AP line per course equivalency (the same exam can repeat on one transcript),
  // and a student may re-import the same transcript later: skip any exam already in prior.ap either
  // way, so credit for it is never counted more than once.
  const existingExams = new Set(next.prior.ap.map((a) => a.exam));
  const newAp = selection.ap.filter((a) => !existingExams.has(a.exam));
  if (newAp.length > 0) {
    next = {
      ...next,
      prior: {
        ...next.prior,
        ap: [...next.prior.ap, ...newAp.map((a) => ({ key: uid(), exam: a.exam, score: a.score }))],
      },
    };
  }

  return next;
}
