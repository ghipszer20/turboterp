// Grad courses as an undergrad (feature-modules.md "Grad courses as an undergrad"; owner ruling
// 2026-09-27, docs/project/rulings.md ~line 81): an undergrad may plan a 600-897 course (not 799,
// thesis research) with an advisor's permission -- it's never blocked, only a warning. 799, 898
// and 899 are never allowed. Each planned grad course carries a credit tag the student picks (see
// GradCreditTag) that decides how its credits are counted.
//
// Pure course-number and credit-cap math only, so it's cheap to unit test. checkPlan (./check.ts)
// turns this into PlanIssues term by term; planCourses (./notices.ts) uses it to leave
// graduate-only credits out of the degree-audit totals.

/** How a planned graduate course's credits count. `undefined` on a PlanCourse means "undergrad
 * credit" (the default): it counts toward the 120 and program requirements as usual. */
export type GradCreditTag = "graduate-only" | "bs-ms";
export const GRAD_CREDIT_TAGS: GradCreditTag[] = ["graduate-only", "bs-ms"];

const COURSE_NUMBER = /^[A-Z]{4}(\d{3})[A-Z]?$/;

/** The course's catalog number (e.g. 616 for "CMSC616H"), or null when the id doesn't parse. */
function courseNumber(id: string): number | null {
  const m = COURSE_NUMBER.exec(id.trim().toUpperCase());
  return m ? Number(m[1]) : null;
}

/** 600-897, except 799 (thesis research): the range an undergrad may plan, with an advisor's
 * permission. */
export function isGraduateCourse(id: string): boolean {
  const n = courseNumber(id);
  return n !== null && n >= 600 && n <= 897 && n !== 799;
}

/** 799 (thesis research), 898 or 899: never allowed on an undergrad's plan. */
export function isBlockedGraduateCourse(id: string): boolean {
  const n = courseNumber(id);
  return n !== null && (n === 799 || n === 898 || n === 899);
}

/** Graduate-only credits: a warning above this many (a petition can add up to 3 more)... */
export const GRADUATE_ONLY_WARN_CREDITS = 9;
/** ...and an error above this many (the 9-credit cap plus the petitioned 3 more). */
export const GRADUATE_ONLY_MAX_CREDITS = 12;

/** A combined BS/MS may double-count up to this share of the master's credits. */
export const BS_MS_DOUBLE_COUNT_RATE = 0.35;
/** BS/MS double-counting needs at least this grade. */
export const BS_MS_MIN_GRADE = "B-";

// UMD letter grades, lowest to highest -- duplicated from @turboterp/audit and
// @turboterp/course-data/prereqs rather than shared, matching how each of those already keeps its
// own copy.
const GRADE_ORDER = ["F", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
const gradeRank = (g: string) => GRADE_ORDER.indexOf(g.trim().toUpperCase());

/**
 * Whether a course's grade meets "B- or better" for BS/MS double-counting. A course not yet
 * completed, or completed with no letter grade (P/S, AP/IB/transfer credit), doesn't meet it yet
 * -- the caller shows "needs B- or better" rather than treating it as a failure.
 */
export function meetsBsMsGrade(course: { status?: "planned" | "completed"; grade?: string }): boolean {
  if (course.status !== "completed" || !course.grade) return false;
  const rank = gradeRank(course.grade);
  return rank >= 0 && rank >= gradeRank(BS_MS_MIN_GRADE);
}

/** The 35%-of-master's-credits cap, or null with no master's-credit total set on the plan. */
export function bsMsCap(mastersCredits: number | undefined): number | null {
  return mastersCredits === undefined || mastersCredits <= 0 ? null : mastersCredits * BS_MS_DOUBLE_COUNT_RATE;
}
