// The review step's data: what was found (with AP/IB/college-credit picks) and what applying the
// student's checked rows does to the plan. Mirrors the web's ReviewStage.
import { apExamNames } from "@turboterp/credit";
import type { AdvisorPlan } from "@turboterp/app-core/plan-state";
import { applyTranscriptImport, type SelectedAp, type SelectedCourse } from "@turboterp/app-core/transcript-apply";
import { selectApLines } from "@turboterp/app-core/transcript-ap-select";
import { selectDualLines, selectIbLines } from "@turboterp/app-core/transcript-ib-select";
import type { ParsedTranscript } from "@turboterp/app-core/transcript-parse";

export type Review = {
  parsed: ParsedTranscript;
  ap: ReturnType<typeof selectApLines>;
  ib: ReturnType<typeof selectIbLines>;
  dual: ReturnType<typeof selectDualLines>;
  notRecognized: { raw: string }[];
};

/** Which rows are checked; everything starts checked. */
export type Checks = { courses: boolean[]; ap: boolean[]; ib: boolean[]; dual: boolean[]; gpa: boolean };

export function buildReview(parsed: ParsedTranscript): Review {
  const ap = selectApLines(parsed.apLines, apExamNames());
  const ib = selectIbLines(parsed.ibLines);
  const dual = selectDualLines(parsed.dualLines);
  return { parsed, ap, ib, dual, notRecognized: [...ap.unmatched, ...ib.unmatched, ...dual.unmatched] };
}

export const allChecked = (r: Review): Checks => ({
  courses: r.parsed.courses.map(() => true),
  ap: r.ap.matched.map(() => true),
  ib: r.ib.matched.map(() => true),
  dual: r.dual.matched.map(() => true),
  gpa: true,
});

export const anyChecked = (r: Review, k: Checks): boolean =>
  [k.courses, k.ap, k.ib, k.dual].some((a) => a.some(Boolean)) || (r.parsed.cumulativeGpa !== null && k.gpa);

export const isEmptyReview = (r: Review): boolean =>
  r.parsed.courses.length === 0 && r.ap.matched.length === 0 && r.ib.matched.length === 0 && r.dual.matched.length === 0 && r.notRecognized.length === 0;

export function applyReview(plan: AdvisorPlan, r: Review, k: Checks): AdvisorPlan {
  const courses: SelectedCourse[] = r.parsed.courses
    .filter((_, i) => k.courses[i])
    .map((c) => ({ term: c.term, code: c.code, grade: c.grade, credits: c.earnedCredits ?? c.attemptedCredits, status: c.status }));
  const ap: SelectedAp[] = r.ap.matched.filter((_, i) => k.ap[i]).map((a) => ({ exam: a.exam, score: a.score, ...(a.pick ? { pick: a.pick } : {}) }));
  const ib = r.ib.matched.filter((_, i) => k.ib[i]).map((b) => ({ exam: b.exam, level: b.level, score: b.score }));
  const dual = r.dual.matched
    .filter((_, i) => k.dual[i])
    .map((d) => ({ institution: d.institution, course: d.course, credits: d.credits, umd: d.umd, elective: d.elective }));
  const gpa = r.parsed.cumulativeGpa && k.gpa ? r.parsed.cumulativeGpa.value : null;
  return applyTranscriptImport(plan, { courses, ap, ib, dual, gpa });
}
