// Pure display helpers for the What-if tab (WhatIfView.tsx). Type-only imports from
// @turboterp/audit and @turboterp/plan/what-if only -- like what-if.ts, this must never
// value-import either (both pull HiGHS in transitively), so WhatIfView.tsx can keep importing
// this file at the top while still loading the comparison itself with import().
//
// Owner rulings (docs/project/feature-modules.md), on switching majors: "Show how existing
// credits apply to the new major (count / become electives / unused), ... the catalog year for
// the new major, and the internal-transfer requirements (gateway courses and GPA) for
// limited-enrollment majors."

import type { GatewayRule } from "@turboterp/audit";
import type { CourseWhatIf } from "@turboterp/plan/what-if";
import { PROGRAM_OPTIONS } from "./programs";

/** The gateway rule's grade and GPA minimums in one sentence (matches AuditView's wording for the
 * same rule). */
export function gatewayRuleText(rule: GatewayRule): string {
  const when = rule.name === "fall-2024-or-later" ? "Matriculated Fall 2024 or later" : "Matriculated before Fall 2024";
  return `${when}: every gateway course ${rule.minGrade} or better, cumulative GPA ${rule.minGpa.toFixed(1)} or higher.`;
}

/**
 * Shown on both the Audit and What-if tabs (AuditView.tsx, WhatIfView.tsx) whenever a gateway's
 * `attemptLimitViolated` is true, so a student who sees "ineligible" with every course "Met" or
 * "Planned" knows why: UMD's CS LEP repeat limit, not a grade. Source:
 * undergrad.cs.umd.edu/internal-transfer-applicants ("LEP Guidelines"), the same text at
 * lep.umd.edu/computerscience-after2024.html and lep.umd.edu/computerscience.html.
 */
export function gatewayAttemptLimitNote(gateway: { attemptLimitViolated: boolean }): string | null {
  if (!gateway.attemptLimitViolated) return null;
  return (
    "UMD's CS LEP allows only one gateway course to be repeated, and that course may only be " +
    "repeated once (a W counts as an attempt). Your record already uses up, or would exceed, " +
    "that limit. See undergrad.cs.umd.edu/internal-transfer-applicants."
  );
}

export type AddedProgramNote = { id: string; name: string; catalogYear?: string; verified: boolean };

/**
 * Majors proposed that aren't already declared -- a switch, or a genuine add -- with the catalog
 * year their requirements come from. Only PROGRAM_OPTIONS ids resolve to a note; an id this
 * session doesn't recognize is skipped.
 */
export function addedProgramNotes(currentIds: string[], proposedIds: string[]): AddedProgramNote[] {
  const current = new Set(currentIds);
  return proposedIds
    .filter((id) => !current.has(id))
    .map((id) => PROGRAM_OPTIONS.find((o) => o.id === id))
    .filter((o): o is (typeof PROGRAM_OPTIONS)[number] => o !== undefined)
    .map((o) => ({ id: o.id, name: o.name, catalogYear: o.catalogYear, verified: o.verified }));
}

export type CompletedCreditTotals = { counts: number; elective: number; unused: number };

/**
 * How the student's existing credits (completed courses and prior credit -- planCourses gives
 * prior credit "completed" status too) would apply under the proposed majors: how many count
 * toward a requirement, become electives, or go unused. Not-yet-taken (planned) courses are
 * excluded; those aren't "existing credits" yet. A completed course that earns no credit (F or W --
 * see @turboterp/audit's earnsCredit, mirrored on CourseWhatIf.earnsCredit since this file can't
 * value-import @turboterp/audit) contributes to none of the three totals.
 */
export function completedCreditTotals(courses: CourseWhatIf[]): CompletedCreditTotals {
  const totals: CompletedCreditTotals = { counts: 0, elective: 0, unused: 0 };
  for (const c of courses) {
    if (c.status !== "completed" || !c.earnsCredit) continue;
    totals[c.proposedStatus] += c.credits;
  }
  return totals;
}
