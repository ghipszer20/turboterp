// Applies a student-reviewed transcript import to the plan. Pure and plan-state-shaped: folds
// over the existing planReducer actions (no new plan-state actions needed) so this is the only
// place a transcript import ever touches an AdvisorPlan, and only ever with rows the student has
// already reviewed and confirmed -- never the raw parse result.

import { creditForAp } from "@turboterp/credit";
import { planReducer, type AdvisorPlan } from "./plan-state";
import { parseTerm } from "./terms";

export type SelectedCourse = {
  term: string;
  code: string;
  grade: string | null;
  credits: number | null;
  status: "completed" | "in-progress";
};

/** `pick` is the course UMD posted for an award that offers a choice. */
export type SelectedAp = { exam: string; score: number; pick?: string };
export type SelectedIb = { exam: string; level: "SL" | "HL"; score: number };
export type SelectedDual = { institution: string; course: string; credits: number; umd: string; elective: boolean };

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `t${Math.random().toString(36).slice(2)}`);

const FOUR_YEARS = 8; // fall and spring terms
const isMain = (name: string) => /^(Fall|Spring) /.test(name);

/** A transcript that starts before the plan did adds terms at the front. The plan stays four years
 * (owner, 2026-10-04): empty terms are dropped from the end until eight fall and spring terms are
 * left. A term with courses, or one an exam is planned for, is never dropped. */
function trimToFourYears(before: AdvisorPlan, after: AdvisorPlan): AdvisorPlan {
  const mains = (p: AdvisorPlan) => p.terms.filter((t) => isMain(t.name)).length;
  if (mains(after) <= mains(before)) return after;
  const examTerms = new Set(Object.values(after.examTerms ?? {}));
  let next = after;
  for (;;) {
    const last = next.terms.at(-1);
    if (!last || last.courses.length > 0 || examTerms.has(last.name)) break;
    if (isMain(last.name) && mains(next) <= FOUR_YEARS) break;
    next = planReducer(next, { type: "remove-term", name: last.name });
  }
  return next;
}

export function applyTranscriptImport(plan: AdvisorPlan, selection: { courses: SelectedCourse[]; ap: SelectedAp[]; ib?: SelectedIb[]; dual?: SelectedDual[]; gpa?: number | null }): AdvisorPlan {
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

  next = trimToFourYears(plan, next);

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

  // A posted pick (the course UMD put on the record) wins over the automatic pick.
  const choices = { ...next.prior.choices };
  for (const a of selection.ap) {
    if (!a.pick) continue;
    try {
      choices[creditForAp(a.exam, a.score).source] = a.pick;
    } catch {
      // an exam the chart doesn't know has no choice to record
    }
  }
  if (Object.entries(choices).some(([k, v]) => next.prior.choices[k] !== v)) {
    next = { ...next, prior: { ...next.prior, choices } };
  }

  const newIb = (selection.ib ?? []).filter(
    (b, i, all) => !next.prior.ib.some((x) => x.exam === b.exam && x.level === b.level) && all.findIndex((x) => x.exam === b.exam && x.level === b.level) === i,
  );
  const dualKey = (d: { institution: string; course: string }) => `${d.institution}|${d.course}`.toUpperCase();
  const haveDual = new Set(next.prior.dual.map(dualKey));
  const newDual = (selection.dual ?? []).filter((d) => {
    if (haveDual.has(dualKey(d))) return false;
    haveDual.add(dualKey(d));
    return true;
  });
  if (newIb.length > 0 || newDual.length > 0) {
    next = {
      ...next,
      prior: {
        ...next.prior,
        ib: [...next.prior.ib, ...newIb.map((b) => ({ key: uid(), exam: b.exam, level: b.level, score: b.score }))],
        dual: [...next.prior.dual, ...newDual.map((d) => ({ key: uid(), ...d }))],
      },
    };
  }

  return next;
}
