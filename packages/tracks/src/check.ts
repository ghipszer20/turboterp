// checkTrack: the audit (@turboterp/audit) plus plain-language issues a Track's data alone can't
// express as a Requirement — exam timing, AP/IB and pass/fail credit, low grades, milestone
// timing, and pre-law's GPA protection. Pure and synchronous apart from the audit's solver call.

import { auditProgram, inArea, matchesFilter, type AuditResult, type Requirement } from "@turboterp/audit";
import type { Plan, PlanCourse, PriorCredit } from "@turboterp/plan";
import { amcasGpa, gpaOf, type GradedCourse } from "./gpa.ts";
import { trackProgram } from "./list.ts";
import type { Milestone, Track } from "./types.ts";

export type TrackIssueKind = "exam-timing" | "exam-credit" | "pass-fail-credit" | "low-grade" | "milestone" | "gpa-protection";

export type TrackIssue = {
  kind: TrackIssueKind;
  severity: "warning" | "info";
  message: string;
  /** The course the issue is about, when there is one. */
  course?: string;
  /** The milestone the issue is about, when there is one. */
  milestone?: string;
};

export type CheckTrackOptions = {
  /**
   * Calendar year of the fall the student starts professional school (or, for a transfer track,
   * the year they'd transfer). Inferred from the plan when omitted: after a degree, the year of
   * the last term (plus one if that term is a fall); for a transfer, the first term's year plus
   * `entry.afterYears`. Milestone reminders are skipped when this can't be determined either way
   * (e.g. a plan whose term names don't carry a year).
   */
  entryYear?: number;
  /**
   * Which plan term each exam milestone (MCAT, DAT, OAT…) happens in, by the milestone's id and
   * the term's name exactly as it appears in the plan (e.g. `{ mcat: "Spring 2028" }`). A course
   * assigned to one of that exam's `examContent` categories is flagged if it's planned in that
   * term or later. An exam left out, or whose term isn't in the plan (a gap-year exam sat after
   * the plan ends), produces no exam-timing issues for it.
   */
  examTerms?: Record<string, string>;
  /**
   * Predicted grades for not-yet-completed courses, by term name then course id, used only for
   * `gpaProtection` tracks. Kept separate from `PlanCourse.grade`, which @turboterp/plan treats as
   * a transcript grade for a completed course.
   */
  expectedGrades?: Record<string, Record<string, string>>;
};

export type TrackCheckResult = { audit: AuditResult; issues: TrackIssue[] };

const MONTHS = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
];

// UMD letter grades, lowest to highest (matches @turboterp/audit's own, unexported, table).
const GRADE_ORDER = ["F", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
const gradeRank = (g: string) => GRADE_ORDER.indexOf(g.trim().toUpperCase());
const PASS_FAIL = new Set(["P", "S", "PASS", "NC", "U", "SAT"]);
const isPassFail = (grade: string | undefined) => !!grade && PASS_FAIL.has(grade.trim().toUpperCase());
const isApOrIb = (source: string | undefined) => !!source && /^(AP|IB) /.test(source);

/** Whether a course id could count toward a Requirement (ignores minGrade; that's checked separately). */
function requirementMentions(req: Requirement, courseId: string): boolean {
  const course = { id: courseId, genEd: [] };
  switch (req.kind) {
    case "course":
      return req.options.includes(courseId);
    case "choose":
      return matchesFilter(req.from, course);
    case "sets":
      return req.options.some((option) => option.some((m) => (typeof m === "string" ? m === courseId : matchesFilter(m.from, course))));
    case "distribution":
      return req.areas.some((a) => inArea(a, course));
    case "concentration":
    case "openSlot":
      return false; // no track category uses these kinds
  }
}

// Chronological order of the seasons within one calendar year (Winter = January intersession).
const SEASON_RANK: Record<string, number> = { winter: 0, spring: 1, summer: 2, fall: 3 };

/** Which season a milestone's month falls in, for lining its date up with a plan term. */
function seasonOfMonth(month: number): { name: string; rank: number } {
  const name = month === 1 ? "Winter" : month <= 5 ? "Spring" : month <= 8 ? "Summer" : "Fall";
  return { name, rank: SEASON_RANK[name.toLowerCase()]! };
}

const TERM_NAME = /^(Fall|Winter|Spring|Summer)\s+(\d{4})/i;

function parseTerm(name: string): { season: string; year: number } | undefined {
  const m = TERM_NAME.exec(name.trim());
  return m ? { season: m[1]!, year: Number(m[2]) } : undefined;
}

function parseTermYear(name: string): number | undefined {
  return parseTerm(name)?.year;
}

/** entryYear inference (see CheckTrackOptions.entryYear). Returns undefined when it can't be determined. */
function inferEntryYear(plan: Plan, track: Track): number | undefined {
  if (plan.terms.length === 0) return undefined;
  if (track.entry.kind === "transfer") {
    const year = parseTermYear(plan.terms[0]!.name);
    return year === undefined ? undefined : year + track.entry.afterYears;
  }
  const last = plan.terms.at(-1)!;
  const year = parseTermYear(last.name);
  if (year === undefined) return undefined;
  return /^Fall\b/i.test(last.name.trim()) ? year + 1 : year;
}

/** Every course id known in the plan with its original (untouched) grade, if any: prior credit first, then each term in order. */
function originalGrades(plan: Plan): Map<string, string | undefined> {
  const grades = new Map<string, string | undefined>();
  for (const c of plan.priorCredit ?? []) grades.set(c.id, c.grade);
  for (const term of plan.terms) for (const c of term.courses) if (c.status !== "planned" || c.grade) grades.set(c.id, c.grade);
  return grades;
}

/** Where a course id came from in the plan, for the AP/IB check: the PriorCredit entry, if any. */
function priorCreditFor(plan: Plan, id: string): PriorCredit | undefined {
  return (plan.priorCredit ?? []).find((c) => c.id === id);
}

/** The audit's StudentCourse list, built from the plan. Pass/fail grades are cleared so the audit
 * (which treats a non-letter grade as not meeting any minGrade) still counts them; `checkTrack`
 * warns about them separately via `originalGrades`. */
function studentCourses(plan: Plan) {
  const prior = (plan.priorCredit ?? []).map((c) => ({ id: c.id, credits: c.credits, status: "completed" as const, grade: c.grade, genEd: c.genEd }));
  const planned = plan.terms.flatMap((term) =>
    term.courses.map((c: PlanCourse) => ({
      id: c.id,
      credits: c.credits ?? 0,
      status: (c.status ?? "planned") as "planned" | "completed",
      grade: isPassFail(c.grade) ? undefined : c.grade,
    })),
  );
  return [...prior, ...planned];
}

function examCreditIssues(plan: Plan, track: Track, audit: AuditResult): TrackIssue[] {
  const issues: TrackIssue[] = [];
  for (const category of track.categories) {
    if (!category.requirement || category.examCredit === "accepted") continue;
    const result = audit.requirements.find((r) => r.id === category.requirement!.id);
    for (const id of result?.assigned ?? []) {
      const credit = priorCreditFor(plan, id);
      if (!credit || !isApOrIb(credit.source)) continue;
      const advice = category.examCreditAdvice ?? `Many schools won't accept AP/IB credit for this; confirm with each target school.`;
      issues.push({
        kind: "exam-credit",
        severity: "warning",
        course: id,
        message: `${id} comes from ${credit.source} credit, used for "${category.requirement.name}". ${advice}`,
      });
    }
  }
  return issues;
}

function passFailIssues(plan: Plan, track: Track, audit: AuditResult): TrackIssue[] {
  const issues: TrackIssue[] = [];
  const grades = originalGrades(plan);
  for (const category of track.categories) {
    if (!category.requirement) continue;
    const result = audit.requirements.find((r) => r.id === category.requirement!.id);
    for (const id of result?.assigned ?? []) {
      const grade = grades.get(id);
      if (!isPassFail(grade)) continue;
      issues.push({
        kind: "pass-fail-credit",
        severity: "warning",
        course: id,
        message: `${id} was taken pass/fail (grade ${grade}), used for "${category.requirement.name}". Many schools won't accept a pass/fail grade for a prerequisite.`,
      });
    }
  }
  return issues;
}

function lowGradeIssues(plan: Plan, track: Track): TrackIssue[] {
  if (!track.minGrade) return [];
  const minRank = gradeRank(track.minGrade);
  const issues: TrackIssue[] = [];
  for (const term of plan.terms) {
    for (const c of term.courses) {
      if (c.status !== "completed" || !c.grade) continue;
      const rank = gradeRank(c.grade);
      if (rank < 0 || rank >= minRank) continue; // not a letter grade, or already meets minGrade
      const matching = track.categories.filter((cat) => cat.requirement && requirementMentions(cat.requirement, c.id));
      if (matching.length === 0) continue;
      const names = matching.map((cat) => `"${cat.requirement!.name}"`).join(", ");
      issues.push({
        kind: "low-grade",
        severity: "warning",
        course: c.id,
        message: `${c.id} (grade ${c.grade}) is below ${track.minGrade}, so it doesn't count for ${names}. ${track.minGradeNote ?? ""}`.trim(),
      });
    }
  }
  return issues;
}

function examTimingIssues(plan: Plan, track: Track, audit: AuditResult, examTerms: Record<string, string>): TrackIssue[] {
  const issues: TrackIssue[] = [];
  const termIndex = new Map(plan.terms.map((t, i) => [t.name, i]));
  for (const category of track.categories) {
    if (!category.requirement || !category.examContent) continue;
    const milestone = track.milestones.find((m) => m.id === category.examContent);
    const examTermName = examTerms[category.examContent];
    if (!milestone || !examTermName) continue;
    const examIndex = termIndex.get(examTermName);
    if (examIndex === undefined) continue; // the exam's term isn't in the plan; nothing to compare
    const result = audit.requirements.find((r) => r.id === category.requirement!.id);
    for (const id of result?.assigned ?? []) {
      const indices = plan.terms.flatMap((t, i) => (t.courses.some((c) => c.id === id) ? [i] : []));
      const earliest = Math.min(...indices);
      if (indices.length === 0 || earliest < examIndex) continue;
      issues.push({
        kind: "exam-timing",
        severity: "warning",
        course: id,
        milestone: milestone.id,
        message: `${id} is planned for ${plan.terms[earliest]!.name}, at or after the ${milestone.name}'s term (${examTermName}). Finish it before the ${milestone.name} if possible.`,
      });
    }
  }
  return issues;
}

/** A milestone's timing relative to the plan (see trackMilestoneTimings). */
export type MilestoneTiming = {
  milestone: Milestone;
  /** Calendar year the milestone falls in. */
  year: number;
  monthName: string;
  /** The plan term whose season and year match, if any. */
  term: string | null;
  /** True when the milestone's date is after the plan's last term (only meaningful when `term` is null). */
  afterLast: boolean;
  /** The same wording milestoneIssues puts in its message: "during Spring 2028", "after your last planned term", or "around Spring 2028". */
  when: string;
};

function milestoneTiming(plan: Plan, m: Milestone, entryYear: number): MilestoneTiming | null {
  const date = m.due ?? m.start;
  if (!date) return null;
  const last = parseTerm(plan.terms.at(-1)!.name);
  const lastOrder = last ? last.year * 4 + SEASON_RANK[last.season.toLowerCase()]! : undefined;

  const termByDate = new Map<string, string>();
  for (const t of plan.terms) {
    const parsed = parseTerm(t.name);
    if (parsed) termByDate.set(`${parsed.year}-${parsed.season.toLowerCase()}`, t.name);
  }

  const year = entryYear + date.year;
  const season = seasonOfMonth(date.month);
  const monthName = MONTHS[date.month - 1]!;
  const matchedTerm = termByDate.get(`${year}-${season.name.toLowerCase()}`) ?? null;
  const order = year * 4 + season.rank;
  const afterLast = lastOrder !== undefined && order > lastOrder;
  const when = matchedTerm ? `during ${matchedTerm}` : afterLast ? "after your last planned term" : `around ${season.name} ${year}`;
  return { milestone: m, year, monthName, term: matchedTerm, afterLast, when };
}

/**
 * Every milestone's timing relative to the plan, structured for a UI that lines milestones up
 * with plan terms (a "Tracks" audit timeline). Milestones with neither a `due` nor a `start` date
 * are left out. Empty when `entryYear` can't be given or inferred (see CheckTrackOptions.entryYear)
 * or the plan has no terms.
 */
export function trackMilestoneTimings(plan: Plan, track: Track, entryYear?: number): MilestoneTiming[] {
  const year = entryYear ?? inferEntryYear(plan, track);
  if (year === undefined || plan.terms.length === 0) return [];
  return track.milestones.map((m) => milestoneTiming(plan, m, year)).filter((t): t is MilestoneTiming => t !== null);
}

function milestoneIssues(plan: Plan, track: Track, entryYear: number | undefined): TrackIssue[] {
  return trackMilestoneTimings(plan, track, entryYear).map((t) => ({
    kind: "milestone",
    severity: "info",
    milestone: t.milestone.id,
    message: `${t.milestone.name}: ${t.milestone.detail} (around ${t.monthName} ${t.year}, ${t.when}.)`,
  }));
}

function gpaProtectionIssues(plan: Plan, track: Track, expectedGrades: Record<string, Record<string, string>> | undefined): TrackIssue[] {
  if (!track.gpaProtection || !expectedGrades) return [];
  const issues: TrackIssue[] = [];
  const completedBefore: GradedCourse[] = [...(plan.priorCredit ?? []).filter((c) => c.grade).map((c) => ({ id: c.id, credits: c.credits, grade: c.grade }))];
  for (const term of plan.terms) {
    const expected = expectedGrades[term.name];
    if (expected) {
      const cumulative = amcasGpa(completedBefore);
      if (cumulative.gpa !== null) {
        const termCourses: GradedCourse[] = term.courses
          .filter((c) => expected[c.id] !== undefined)
          .map((c) => ({ id: c.id, credits: c.credits ?? 0, grade: expected[c.id] }));
        const termSummary = gpaOf(termCourses);
        if (termSummary.gpa !== null && termSummary.gpa < cumulative.gpa) {
          issues.push({
            kind: "gpa-protection",
            severity: "warning",
            message: `Your expected grades for ${term.name} average to about a ${termSummary.gpa.toFixed(2)} GPA, below your ${cumulative.gpa.toFixed(2)} GPA so far; this could lower your overall GPA. LSAC's CAS counts every attempt of a repeated course, so retaking one later doesn't erase this.`,
          });
        }
      }
    }
    for (const c of term.courses) if (c.status === "completed" && c.grade) completedBefore.push({ id: c.id, credits: c.credits ?? 0, grade: c.grade });
  }
  return issues;
}

/** The audit status of a Track's requirements, plus plain-language issues (see CheckTrackOptions). */
export async function checkTrack(plan: Plan, track: Track, options: CheckTrackOptions = {}): Promise<TrackCheckResult> {
  const program = trackProgram(track);
  const courses = studentCourses(plan);
  const audit: AuditResult =
    program.requirements.length === 0 ? { requirements: [], unused: courses.map((c) => c.id) } : await auditProgram(program, courses);

  const entryYear = options.entryYear ?? inferEntryYear(plan, track);
  const issues: TrackIssue[] = [
    ...examCreditIssues(plan, track, audit),
    ...passFailIssues(plan, track, audit),
    ...lowGradeIssues(plan, track),
    ...(options.examTerms ? examTimingIssues(plan, track, audit, options.examTerms) : []),
    ...milestoneIssues(plan, track, entryYear),
    ...gpaProtectionIssues(plan, track, options.expectedGrades),
  ];
  return { audit, issues };
}
