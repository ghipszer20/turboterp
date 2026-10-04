// What-if program changes (switch major, add or drop a program): compares a plan's courses,
// missing requirements, freed credits, the CS gateway and a graduation-term estimate under the
// student's current declared majors vs a proposed set. Async and solver-backed (@turboterp/audit),
// like notices.ts -- run it after edits settle, not on every keystroke.

import { auditPrograms, checkCsGateway, PROGRAM_GPA_ID, earnsCredit, type AuditResult, type GatewayResult, type Program, type StudentCourse } from "@turboterp/audit";
import type { PlanCatalog } from "./catalog.ts";
import type { Plan } from "./check.ts";
import { planCourses, shortfall } from "./notices.ts";

export type CourseStatus = "counts" | "elective" | "unused";

export type CourseWhatIf = {
  id: string;
  /** Whether this occurrence is a completed or a not-yet-taken (planned) attempt. */
  status: "completed" | "planned";
  /** From the catalog (or the plan's own override), for a completed-credits totals display. */
  credits: number;
  /** Counts toward a major requirement, is used only as an elective (Gen Ed or the credit
   * floor), or is unused, under the student's currently declared majors. */
  currentStatus: CourseStatus;
  /** Same, under the proposed majors. */
  proposedStatus: CourseStatus;
  /** Ids of the current majors (only -- never layers) this course is assigned to. */
  currentPrograms: string[];
  /** Ids of the proposed majors (only -- never layers) this course is assigned to. */
  proposedPrograms: string[];
  /** Whether this occurrence earns credit (@turboterp/audit's earnsCredit): false only for a
   * completed course graded F or W. A pure-display consumer (what-if-display.ts) can't value-import
   * @turboterp/audit itself (it would pull in HiGHS), so this is computed here instead. */
  earnsCredit: boolean;
};

export type MissingRequirement = {
  program: Program;
  coursesShort: number;
  missing: string[];
};

export type GraduationEstimate = {
  /** Median credits of the plan's own Fall/Spring terms that have courses. */
  typicalLoad: number;
  currentFinishTerm: string;
  proposedFinishTerm: string;
  /** Positive: later. Negative: earlier. Zero: no change. */
  deltaTerms: number;
};

export type WhatIfOptions = {
  /** Testudo term id the student started at UMD (see @turboterp/audit's checkCsGateway). Required
   * for a gateway result when the Computer Science major is involved. */
  matriculationTerm?: string;
  cumulativeGpa?: number;
  /** Open Slots the student confirmed, as "<programId>/<requirementId>" (@turboterp/audit AuditOptions). */
  confirmed?: string[];
};

export type WhatIfResult = {
  courses: CourseWhatIf[];
  /** Shortfall of each proposed program that isn't already one of the current ones. */
  newlyMissing: MissingRequirement[];
  /** Credits of not-yet-completed courses that stop being required by any proposed program. */
  freedCredits: number;
  /** Courses (ids, plan order) that count toward something now -- a program or a layer -- and
   * toward nothing under the proposed programs ("courses that now count toward nothing"). */
  orphaned: string[];
  graduation: GraduationEstimate;
  /** Only when cmsc-major is one of the current or proposed programs. */
  gateway?: GatewayResult;
};

const dedupeById = (programs: Program[]): Program[] => [...new Map(programs.map((p) => [p.id, p])).values()];

/** A layer requirement is a chronological credit floor (e.g. the 120-credit university rule), not
 * a solver-audited one, when it's an uncapped "any course" credit requirement -- returns its
 * credit amount, or null. The solver's objective maximizes the number of assigned pairs, not a
 * chronological order, so which specific courses fill such a floor would otherwise be an
 * arbitrary pick among many candidates once there are more candidates than the floor needs. */
function creditFloorAmount(req: Program["requirements"][number]): number | null {
  return req.kind === "choose" && req.from.anyCourse === true && req.credits !== undefined ? req.credits : null;
}

/** Splits a layer program into the part the solver should audit (its non-floor requirements, or
 * null if none) and its credit-floor amounts (handled chronologically instead). */
function splitLayer(program: Program): { audited: Program | null; floors: number[] } {
  const floors = program.requirements.map(creditFloorAmount).filter((n): n is number => n !== null);
  const audited = program.requirements.filter((r) => creditFloorAmount(r) === null);
  return { audited: audited.length > 0 ? { ...program, requirements: audited } : null, floors };
}

// UMD letter grades, lowest to highest (same order as @turboterp/audit, which doesn't export it).
const GRADE_ORDER = ["F", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
const gradeRank = (g: string) => GRADE_ORDER.indexOf(g.trim().toUpperCase());

/** Mirrors @turboterp/audit's own (unexported) course/program grade filter: a course below a
 * program's minimum grade never receives a pair from the solver for any of that program's
 * requirements, so it can never be "assigned". */
function meetsProgramGrade(course: StudentCourse, minGrade: string | undefined): boolean {
  if (!minGrade || course.status !== "completed" || !course.grade) return true;
  const rank = gradeRank(course.grade);
  return rank >= 0 && rank >= gradeRank(minGrade);
}

/**
 * Which occurrences (indices into `courses`) this program's audit result actually counted toward
 * one of its own non-overlay requirements. Occurrence-, not id-, based because a legitimate
 * retake can put two entries of the same course id in `courses` (owner ruling: a course may
 * appear twice only after a failed or withdrawn attempt); `AuditResult.assigned` names only ids,
 * so a naive id match can't tell a used retake from its unused failed attempt. A grade-ineligible
 * occurrence never receives a pair from the solver at all (see meetsProgramGrade and earnsCredit),
 * so it's excluded outright; the remaining assigned slots go to the earliest eligible occurrences
 * in plan order (the order `courses` is already in). earnsCredit matters even when the program has
 * no minGrade at all: an F/W attempt earns no credit regardless, so without this check it could
 * wrongly grab "counts" ahead of the passing retake that follows it.
 */
function usedIndices(program: Program, result: AuditResult, courses: StudentCourse[]): Set<number> {
  const nonOverlayAssigned = result.requirements.flatMap((r, i) => (r.id === PROGRAM_GPA_ID || program.requirements[i]!.overlay ? [] : r.assigned));
  const remaining = new Map<string, number>();
  for (const id of nonOverlayAssigned) remaining.set(id, (remaining.get(id) ?? 0) + 1);
  const used = new Set<number>();
  courses.forEach((c, i) => {
    const left = remaining.get(c.id) ?? 0;
    if (left <= 0 || !earnsCredit(c) || !meetsProgramGrade(c, program.minGrade)) return;
    remaining.set(c.id, left - 1);
    used.add(i);
  });
  return used;
}

/** Occurrences (indices into `courses`, which is already in plan order: prior credit, then each
 * term in order) that fall within a layer's credit floor. A course counts toward the floor only
 * if the credits before it are still under the floor -- matching the audit's own "a credit
 * requirement may overshoot by less than one course" rule (its cap is need + the largest single
 * course's weight - 1, so a course that starts under the floor may still push a little over it).
 * A failed/withdrawn attempt earns no credit (earnsCredit), so it neither fills the floor itself
 * nor consumes floor space that a later real course would otherwise fall within. */
function creditFloorIndices(courses: StudentCourse[], floors: number[]): Set<number> {
  const within = new Set<number>();
  if (floors.length === 0) return within;
  const need = Math.max(...floors);
  let before = 0;
  courses.forEach((c, i) => {
    if (!earnsCredit(c)) return;
    if (before < need) within.add(i);
    before += c.credits;
  });
  return within;
}

const median = (xs: number[]): number => {
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
};

const FALL_SPRING = /^(Fall|Spring)\s+(\d{4})$/;

/** Chronological index of a Fall/Spring term name (Fall Y < Spring Y+1 < Fall Y+1 < ...), or null
 * for a Winter or Summer term. */
function termIndex(name: string): number | null {
  const m = FALL_SPRING.exec(name.trim());
  if (!m) return null;
  const year = Number(m[2]);
  return m[1] === "Fall" ? year * 2 : year * 2 - 1;
}

function termName(index: number): string {
  const fall = index % 2 === 0;
  const year = fall ? index / 2 : (index + 1) / 2;
  return `${fall ? "Fall" : "Spring"} ${year}`;
}

/** Shifts a Fall/Spring term name by `delta` terms, alternating seasons. */
function shiftTerm(name: string, delta: number): string {
  const i = termIndex(name);
  return i === null ? name : termName(i + delta);
}

const COURSE_ID = /^[A-Z]{4}\d{3}[A-Z]?/;

/** Best estimate of a missing item's credits: the first course id it names, looked up in the
 * catalog, else the audit's own generic 3-credits-a-course conversion (see notices.ts's
 * `shortfall`, which this mirrors for non-course-id items like "2 more for X"). */
function missingCredits(missing: string[], catalog: PlanCatalog): number {
  return missing.reduce((total, item) => {
    const id = COURSE_ID.exec(item)?.[0];
    return total + (id ? catalog.get(id)?.credits.min ?? 3 : 3);
  }, 0);
}

export async function whatIf(
  plan: Plan,
  catalog: PlanCatalog,
  current: Program[],
  proposed: Program[],
  layers: Program[],
  options: WhatIfOptions = {},
): Promise<WhatIfResult> {
  const courses = planCourses(plan, catalog);
  const currentIds = new Set(current.map((p) => p.id));
  const proposedIds = new Set(proposed.map((p) => p.id));

  const splitLayers = layers.map(splitLayer);
  const auditedLayers = splitLayers.map((l) => l.audited).filter((p): p is Program => p !== null);
  const floorCredits = splitLayers.flatMap((l) => l.floors);

  const union = dedupeById([...current, ...proposed, ...auditedLayers]);
  const results = union.length > 0 ? await auditPrograms(union, courses, options.confirmed ? { confirmed: options.confirmed } : {}) : [];
  const usedByProgram = new Map(union.map((p, i) => [p.id, usedIndices(p, results[i]!, courses)]));

  const floorSet = creditFloorIndices(courses, floorCredits);
  const inAnyLayer = (i: number) => floorSet.has(i) || auditedLayers.some((p) => usedByProgram.get(p.id)?.has(i));

  const programIdsAt = (ids: Set<string>, i: number) => [...ids].filter((id) => usedByProgram.get(id)?.has(i));
  const statusFor = (programIds: string[], i: number): CourseStatus => (programIds.length > 0 ? "counts" : inAnyLayer(i) ? "elective" : "unused");

  const courseResults: CourseWhatIf[] = courses.map((c, i) => {
    const currentPrograms = programIdsAt(currentIds, i);
    const proposedPrograms = programIdsAt(proposedIds, i);
    return {
      id: c.id,
      status: c.status,
      credits: c.credits,
      currentStatus: statusFor(currentPrograms, i),
      proposedStatus: statusFor(proposedPrograms, i),
      currentPrograms,
      proposedPrograms,
      earnsCredit: earnsCredit(c),
    };
  });

  // Newly missing: proposed programs not already declared, that aren't (yet) satisfied.
  const resultById = new Map(union.map((p, i) => [p.id, results[i]!]));
  const newlyMissing: MissingRequirement[] = proposed
    .filter((p) => !currentIds.has(p.id))
    .map((p) => {
      const result = resultById.get(p.id)!;
      if (result.requirements.every((r) => r.status === "satisfied")) return null;
      const { count, missing } = shortfall(p, result, courses);
      return { program: p, coursesShort: count, missing };
    })
    .filter((x): x is MissingRequirement => x !== null);

  // Freed credits: not-yet-completed courses required by a current program, no longer required by
  // any proposed one.
  const freedCredits = courseResults.reduce(
    (total, c, i) => (c.status !== "completed" && c.currentPrograms.length > 0 && c.proposedPrograms.length === 0 ? total + courses[i]!.credits : total),
    0,
  );

  const orphaned = courseResults.filter((c) => c.currentStatus !== "unused" && c.proposedStatus === "unused").map((c) => c.id);

  const graduation = graduationEstimate(plan, catalog, newlyMissing, freedCredits, floorCredits, courses);

  const cmscInvolved = currentIds.has("cmsc-major") || proposedIds.has("cmsc-major");
  const gateway =
    cmscInvolved && options.matriculationTerm
      ? checkCsGateway({
          matriculationTerm: options.matriculationTerm,
          courses,
          ...(options.cumulativeGpa !== undefined ? { cumulativeGpa: options.cumulativeGpa } : {}),
        })
      : undefined;

  return { courses: courseResults, newlyMissing, freedCredits, orphaned, graduation, ...(gateway ? { gateway } : {}) };
}

function graduationEstimate(
  plan: Plan,
  catalog: PlanCatalog,
  newlyMissing: MissingRequirement[],
  freedCredits: number,
  floorCredits: number[],
  courses: StudentCourse[],
): GraduationEstimate {
  const mainTerms = plan.terms.filter((t) => termIndex(t.name) !== null);
  const loadTerms = mainTerms.filter((t) => t.courses.length > 0);
  const typicalLoad =
    loadTerms.length > 0
      ? median(loadTerms.map((t) => t.courses.reduce((s, c) => s + (c.credits ?? catalog.get(c.id)?.credits.min ?? 0), 0)))
      : 0;
  const currentFinishTerm = (mainTerms.at(-1) ?? plan.terms.at(-1))?.name ?? "";

  const extraNeeded = newlyMissing.reduce((total, m) => total + missingCredits(m.missing, catalog), 0);

  // Clamp: freeing credits can't be assumed to shorten the plan below what a layer's own credit
  // floor (e.g. the university's total-credit minimum) needs.
  const floorNeed = floorCredits.length > 0 ? Math.max(...floorCredits) : 0;
  const totalCredits = courses.filter(earnsCredit).reduce((t, c) => t + c.credits, 0);
  const clampedFreed = floorNeed > 0 ? Math.min(freedCredits, Math.max(0, totalCredits - floorNeed)) : freedCredits;

  const net = extraNeeded - clampedFreed;
  const deltaTerms = typicalLoad > 0 ? Math.sign(net) * Math.ceil(Math.abs(net) / typicalLoad) : 0;
  const proposedFinishTerm = deltaTerms === 0 ? currentFinishTerm : shiftTerm(currentFinishTerm, deltaTerms);

  return { typicalLoad, currentFinishTerm, proposedFinishTerm, deltaTerms };
}
