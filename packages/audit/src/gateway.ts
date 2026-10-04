// CS Limited Enrollment Program (LEP) gateway check: can this student apply
// to the Computer Science major yet?
//
// Owner-confirmed rule (UMD CS tracking sheet, PROJECT_MEMORY.md):
// - Matriculated Fall 2024 (202408) or later: every gateway course B- or
//   better, cumulative UMD GPA 3.0 or higher.
// - Matriculated Summer 2024 (202405) or earlier: C- or better, GPA 2.7.
// Gateway courses: MATH140, CMSC131 (or CMSC141 or CMSC133), CMSC132 (or CMSC142).
// The substitutes match cmsc-major-2026-27.ts.
// CMSC133 also satisfies the CMSC131 gateway (CS department-page answers, owner, 2026-09-27).
//
// Kept separate from audit.ts. The major's program uses a single C- minimum,
// while the gateway minimum depends on when the student matriculated.

import { gradePoints, type StudentCourse } from "./audit.ts";

/** Which rule applies, based on the matriculation term. */
export type GatewayRule =
  | { name: "fall-2024-or-later"; minGrade: "B-"; minGpa: 3.0 }
  | { name: "spring-2024-or-earlier"; minGrade: "C-"; minGpa: 2.7 };

const NEW_RULE: GatewayRule = { name: "fall-2024-or-later", minGrade: "B-", minGpa: 3.0 };
const OLD_RULE: GatewayRule = { name: "spring-2024-or-earlier", minGrade: "C-", minGpa: 2.7 };
/** First term under the new rule (Fall 2024). Numeric order of term ids is chronological. */
const NEW_RULE_FROM_TERM = 202408;

const GATEWAY_COURSES = [
  { id: "MATH140", name: "Calculus I", options: ["MATH140"] },
  { id: "CMSC131", name: "Object-Oriented Programming I", options: ["CMSC131", "CMSC141", "CMSC133"] },
  { id: "CMSC132", name: "Object-Oriented Programming II", options: ["CMSC132", "CMSC142"] },
];


/**
 * RULING (owner, 2026-09-26, verbatim: "it absolutely counts towards the gateway - this is true
 * for gateway courses for all programs"): a gateway course completed without a letter grade
 * (AP/IB exam or transfer credit, which @turboterp/credit records with no grade) meets the
 * gateway, for every program's gateway, not only CS.
 */
const NO_GRADE_CREDIT_MEETS_GATEWAY = true;

/**
 * RULING (owner, 2026-09-26, verbatim: "A W counts as an attempt - but not as failing."): a W is
 * never treated as a failing grade -- a gateway with only W attempts is "missing" (not yet
 * passed), not "below-minimum", and a lone W never makes the student "ineligible" by itself
 * (see meetsGatewayGrade and the course-status checks below). It still counts as a completed
 * attempt for the CS LEP repeat limit (see ATTEMPT LIMIT below), which is the only way a W can
 * ever contribute to "ineligible".
 */
const isWithdrawal = (c: StudentCourse) => c.grade?.trim().toUpperCase() === "W";

/**
 * ATTEMPT LIMIT (UMD CS LEP): "Only one gateway course may be repeated to earn the required
 * grade and that course may only be repeated once ... a grade of 'W' is considered an attempt."
 * Sources (same text on all three; applies to both the pre- and post-Fall-2024 rule):
 * - https://undergrad.cs.umd.edu/internal-transfer-applicants ("LEP Guidelines")
 * - https://lep.umd.edu/computerscience-after2024.html
 * - https://lep.umd.edu/computerscience.html
 * The Undergraduate Catalog's own LEP page (academiccatalog.umd.edu, Admission to Limited
 * Enrollment Programs) states no specific number, so it isn't cited as the source of the limit.
 *
 * A gateway may be attempted at most twice (one repeat). Only one of the three gateways may ever
 * be the one that needed a repeat -- if two different gateways each have more than one completed
 * attempt, or any gateway has more than two, the record already violates the limit. Filling
 * an already-spent repeat with a *planned* attempt is caught too: a not-yet-met gateway with a
 * completed attempt can't take another one if either it or a different gateway has already used
 * the one allowed repeat.
 *
 * An attempt is a completed course record with a letter grade or "W" -- credit with no letter
 * grade (AP/IB/transfer, see NO_GRADE_CREDIT_MEETS_GATEWAY) is not a UMD course attempt and
 * doesn't count. ASSUMPTION: transfer credit that does carry a grade would count per the CS
 * external-transfer page ("this includes courses attempted at other institutions"), but
 * StudentCourse doesn't distinguish a transfer grade from a UMD one, so this is the same
 * "completed with a grade" count either way.
 */
const MAX_ATTEMPTS_PER_GATEWAY = 2;
const MAX_REPEATED_GATEWAYS = 1;

function meetsGatewayGrade(c: StudentCourse, minRank: number): boolean {
  if (c.status !== "completed") return false;
  if (c.grade === undefined) return NO_GRADE_CREDIT_MEETS_GATEWAY;
  const points = gradePoints(c.grade);
  return points !== undefined && points >= minRank;
}

/**
 * One gateway course, checked against the rule's minimum grade. Every attempt
 * of the course or its substitute counts. Checked in this order:
 * - "met": some completed attempt has a letter grade at or above the minimum.
 *   Uses the best attempt, so a passing retake counts whatever the list order
 *   (StudentCourse has no term). `satisfiedBy` names that course.
 * - "planned": not met, and an attempt is in the Plan. This covers a first
 *   attempt and a planned retake of a below-minimum grade.
 * - "below-minimum": a completed attempt with a real letter grade below the minimum (a W never
 *   counts here -- see the RULING above). Pass/fail and other non-letter grades never meet a
 *   letter minimum either.
 * - "missing": no completed attempt with a real grade, and nothing planned. This is also the
 *   status for one or more W-only attempts, per the ruling above.
 * Ruling (see NO_GRADE_CREDIT_MEETS_GATEWAY above): a completed course with no grade
 * (AP/IB/transfer credit) is "met".
 */
export type GatewayCourseStatus = "met" | "below-minimum" | "missing" | "planned";

export type GatewayCourseResult = {
  /** The gateway's primary course id, e.g. "CMSC131". */
  id: string;
  name: string;
  /** Courses that satisfy this gateway, e.g. ["CMSC131", "CMSC141"]. */
  options: string[];
  status: GatewayCourseStatus;
  /** The course that met the gateway (only when status is "met"). */
  satisfiedBy?: string;
  /**
   * Completed attempts of this gateway or its substitute, letter grade or W (AP/IB/transfer
   * credit with no grade doesn't count -- see ATTEMPT LIMIT above). For the CS LEP repeat limit:
   * at most MAX_ATTEMPTS_PER_GATEWAY, and at most MAX_REPEATED_GATEWAYS gateways may have more
   * than one.
   */
  attempts: number;
};

/**
 * Cumulative UMD GPA against the rule's minimum (inclusive):
 * "met" if at or above it, "below" if under it, "unknown" if no GPA was given.
 */
export type GatewayGpaStatus = "met" | "below" | "unknown";

/**
 * - "eligible": every gateway is "met" and the GPA is "met". The student can apply.
 * - "ineligible": the record can't lead to eligibility no matter what's still planned. Either
 *   - some gateway is "below-minimum", with no passing attempt and no planned retake (planning a
 *     passing retake changes this to "not-yet"), or
 *   - the CS LEP repeat limit is already violated, or can no longer be avoided: a gateway has
 *     used up its one allowed repeat with no pass and nothing left to try, or repeating it would
 *     be a second repeated gateway (see ATTEMPT LIMIT in gateway.ts).
 *   Takes precedence over "not-yet".
 * - "not-yet": everything else. A gateway is planned or missing, or the GPA is
 *   below or unknown. A low GPA gives "not-yet", not "ineligible", because it
 *   can still rise. A lone W never makes this "ineligible" by itself -- only the repeat limit
 *   above can turn a W into "ineligible".
 */
export type GatewayOverallStatus = "eligible" | "not-yet" | "ineligible";

export type GatewayInput = {
  /** Testudo term id the student started at UMD, YYYYMM with MM 01 spring, 05 summer, 08 fall, 12 winter. */
  matriculationTerm: string;
  courses: StudentCourse[];
  /** Cumulative UMD GPA; omit when unknown. */
  cumulativeGpa?: number;
};

export type GatewayResult = {
  rule: GatewayRule;
  /** MATH140, CMSC131, CMSC132, in that order. */
  courses: GatewayCourseResult[];
  gpa: GatewayGpaStatus;
  overall: GatewayOverallStatus;
  /**
   * True once the CS LEP repeat limit is violated or can no longer be avoided (see ATTEMPT LIMIT
   * above) -- the reason `overall` can be "ineligible" even when no course is "below-minimum".
   */
  attemptLimitViolated: boolean;
};

/** Checks CS LEP gateway eligibility. Throws on a malformed matriculation term id. */
export function checkCsGateway(input: GatewayInput): GatewayResult {
  if (!/^\d{4}(01|05|08|12)$/.test(input.matriculationTerm)) {
    throw new Error(`Invalid matriculation term id "${input.matriculationTerm}": expected YYYYMM with MM 01, 05, 08 or 12`);
  }
  const rule = Number(input.matriculationTerm) >= NEW_RULE_FROM_TERM ? NEW_RULE : OLD_RULE;
  const minRank = gradePoints(rule.minGrade)!;

  const courses = GATEWAY_COURSES.map((g): GatewayCourseResult => {
    const matching = input.courses.filter((c) => g.options.includes(c.id));
    const passing = matching.find((c) => meetsGatewayGrade(c, minRank));
    // A UMD attempt: completed with a real grade (letter or W); AP/IB/transfer credit with no
    // grade isn't an attempt (NO_GRADE_CREDIT_MEETS_GATEWAY already made it "met" above).
    const completedWithGrade = matching.filter((c) => c.status === "completed" && c.grade !== undefined);
    const attempts = completedWithGrade.length;
    if (passing) return { ...g, status: "met", satisfiedBy: passing.id, attempts };
    if (matching.some((c) => c.status === "planned")) return { ...g, status: "planned", attempts };
    // A W is an attempt (counted above) but never a failing grade, so it alone never reaches here.
    if (completedWithGrade.some((c) => !isWithdrawal(c))) return { ...g, status: "below-minimum", attempts };
    return { ...g, status: "missing", attempts };
  });

  // CS LEP repeat limit (see ATTEMPT LIMIT above): a gateway "used its repeat" once attempted
  // more than once. At most MAX_REPEATED_GATEWAYS may ever do that, and none may exceed
  // MAX_ATTEMPTS_PER_GATEWAY. A not-yet-met gateway that has, or would need, its own repeat once
  // another gateway already used the one allowed repeat can never become eligible either.
  const usedRepeat = (c: GatewayCourseResult) => c.attempts > 1;
  const overRepeated = courses.some((c) => c.attempts > MAX_ATTEMPTS_PER_GATEWAY);
  const tooManyRepeated = courses.filter(usedRepeat).length > MAX_REPEATED_GATEWAYS;
  const blocked = (c: GatewayCourseResult) =>
    c.status !== "met" &&
    (c.attempts >= MAX_ATTEMPTS_PER_GATEWAY || (c.attempts >= 1 && courses.some((o) => o.id !== c.id && usedRepeat(o))));
  const attemptLimitViolated = overRepeated || tooManyRepeated || courses.some(blocked);

  const gpa: GatewayGpaStatus =
    input.cumulativeGpa === undefined ? "unknown" : input.cumulativeGpa >= rule.minGpa ? "met" : "below";

  const overall: GatewayOverallStatus = courses.some((c) => c.status === "below-minimum") || attemptLimitViolated
    ? "ineligible"
    : courses.every((c) => c.status === "met") && gpa === "met"
      ? "eligible"
      : "not-yet";

  return { rule, courses, gpa, overall, attemptLimitViolated };
}
