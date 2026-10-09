// Checks a Plan term by term. Pure and synchronous: it runs in the student's browser on every
// edit, so all text parsing happens once, in buildCatalog.

import { earnsCredit } from "@turboterp/audit";
import { sameOrVariant } from "@turboterp/course-data/lab-pairs";
import { checkRequirement, type CourseRecord, type Requirement } from "@turboterp/course-data/prereqs";
import type { PlanCatalog } from "./catalog.ts";
import { collegeName, creditCap, type College } from "./credit-caps.ts";
import {
  bsMsCap,
  GRADUATE_ONLY_MAX_CREDITS,
  GRADUATE_ONLY_WARN_CREDITS,
  isBlockedGraduateCourse,
  isGraduateCourse,
  meetsBsMsGrade,
  type GradCreditTag,
} from "./grad-courses.ts";
import { twinIndex } from "./twins.ts";

/** A course in one term of the Plan: planned by default, or completed (from the transcript). */
export type PlanCourse = {
  id: string;
  status?: "planned" | "completed";
  grade?: string;
  /** Overrides the catalog's credits, e.g. for a variable-credit course. */
  credits?: number;
  /** How a graduate course's credits count (grad-courses.ts); ignored for a non-graduate course. */
  gradTag?: GradCreditTag;
};

/** One term, named like "Fall 2026", "Winter 2027", "Spring 2027" or "Summer 2027". */
export type PlanTerm = { name: string; courses: PlanCourse[] };

/**
 * Credit the student has before the first term: AP/IB exams or dual enrollment. `CreditCourse`
 * records from @turboterp/credit fit this shape.
 */
export type PriorCredit = { id: string; credits: number; grade?: string; genEd?: string[]; genEdCredits?: number; source?: string };

/** Terms in order, first to last. */
export type Plan = {
  terms: PlanTerm[];
  priorCredit?: PriorCredit[];
  /** For the BS/MS double-count cap (grad-courses.ts): 35% of this number. Omitted shows an info
   * note instead of checking the cap. */
  mastersCredits?: number;
};

export type IssueKind =
  | "prerequisite"
  | "corequisite"
  | "lab-missing"
  | "lecture-missing"
  | "term-offering"
  | "repeat"
  | "twin-repeat"
  | "credit-load"
  | "light-load"
  | "unknown-course"
  | "grad-permission"
  | "grad-restricted"
  | "grad-only-cap"
  | "grad-double-count-cap"
  | "grad-double-count-grade";

export type PlanIssue = {
  kind: IssueKind;
  /**
   * error: the plan has to change. warning: probably a mistake. confirm: something TurboTerp
   * can't check (a Manual Item), so the student checks it. info: worth knowing, nothing wrong.
   */
  severity: "error" | "warning" | "confirm" | "info";
  term: string;
  /** The course the issue is about; absent for whole-term issues (credit load). */
  course?: string;
  /** Plain language, for the student. */
  message: string;
  /** A few words for the course card, when the message is too long for it (confirm items). */
  short?: string;
};

export type Season = "Fall" | "Winter" | "Spring" | "Summer";

/**
 * The campus-wide credit-load cap, used when no college is given. Superseded by `creditCap`
 * (./credit-caps.ts), which also knows each college's own override (e.g. CMNS, ENGR) and cites a
 * source for every number -- see docs/project/credit-caps.md. Kept here only because it's the
 * fallback baked into `options.maxCredits`'s type below.
 */
export const DEFAULT_MAX_CREDITS: Record<Season, number> = { Fall: 20, Winter: 4, Spring: 20, Summer: 16 };

/** Fewer credits than this in a fall or spring term gets an info note. */
export const FULL_TIME_CREDITS = 12;

export type CheckOptions = {
  /** The student's college, for `creditCap`'s per-college caps (./credit-caps.ts). Ignored for a
   * season `maxCredits` overrides. */
  college?: College;
  /** Per-season cap overrides, taking priority over `creditCap`/`college`. Seasons left out use
   * `creditCap(college, season)`. */
  maxCredits?: Partial<Record<Season, number>>;
};

const SEASON = /^(Fall|Winter|Spring|Summer)\b/i;
function seasonOf(termName: string): Season | null {
  const m = SEASON.exec(termName.trim());
  return m ? ((m[1]![0]!.toUpperCase() + m[1]!.slice(1).toLowerCase()) as Season) : null;
}

/** Where each course sits: -1 for prior credit, else the index of every term it's in. */
type Placement = { at: Map<string, { terms: number[]; grade?: string }>; termNames: string[] };

/** Ids in the plan that satisfy a leaf's course or level, whatever the term. */
function plannedFor(leaf: CourseLeaf, placement: Placement): string[] {
  if (leaf.kind === "course") return placement.at.has(leaf.course) ? [leaf.course] : [];
  return [...placement.at.keys()].filter((id) => inLevel(id, leaf.dept, leaf.minNumber));
}

const inLevel = (id: string, dept: string, min: number) => {
  const m = /^([A-Z]{4})(\d{3})/.exec(id);
  return m !== null && m[1] === dept && Number(m[2]) >= min;
};

const withGrade = (id: string, minGrade?: string) => (minGrade ? `${id} (${minGrade} or better)` : id);

type CourseLeaf = Extract<Requirement, { kind: "course" | "dept-level" }>;

function courseLeaves(req: Requirement): CourseLeaf[] {
  if (req.kind === "course" || req.kind === "dept-level") return [req];
  if (req.kind === "manual") return [];
  return req.of.flatMap(courseLeaves);
}

/** A plan course that counts: planned, or completed with a grade that earns credit (not F or W). */
const counts = (c: Pick<PlanCourse, "status" | "grade">) =>
  earnsCredit({ status: c.status === "completed" ? "completed" : "planned", ...(c.grade ? { grade: c.grade } : {}) });

/** "A", "A or B", "A, B or C" */
const orList = (items: string[]) => (items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} or ${items.at(-1)}`);

/** Whether a requirement names one of these courses. */
const names = (req: Requirement | null, ids: string[]) => req !== null && courseLeaves(req).some((l) => l.kind === "course" && ids.includes(l.course));

/** The courses a student can take in a term of this season: in the catalog, and on a current schedule
 * for fall or spring, or offered in that season for winter or summer (BSCI171: summer, not Fall 2026). */
const offeredFor = (ids: string[], catalog: PlanCatalog, season: Season | null) =>
  ids.filter((id) => {
    const x = catalog.get(id);
    if (!x) return false;
    if (season === "Winter" || season === "Summer") return !x.offered || x.offered.includes(season);
    return !x.notScheduled;
  });

/** Whether a requirement needs `id` finished in an earlier term (a course leaf without concurrent enrollment). */
export const needsFirst = (req: Requirement | null, id: string) =>
  req !== null && courseLeaves(req).some((l) => l.kind === "course" && l.course === id && !l.concurrentOk);

/** Each lab's lectures, from every lecture's `labs`; a section variant (BSCI180S) finds its base lab's. */
function lectureIndex(catalog: PlanCatalog): (id: string) => string[] {
  const byLab = new Map<string, string[]>();
  for (const c of catalog.values()) for (const lab of c.labs ?? []) byLab.set(lab, [...(byLab.get(lab) ?? []), c.id]);
  return (id) => byLab.get(id) ?? (/\d[A-Z]$/.test(id) ? byLab.get(id.slice(0, -1)) : undefined) ?? [];
}

/** What's still missing from an unmet requirement, in words: "CMSC250 (C- or better) and CMSC216". */
function describeMissing(req: Requirement, history: Record<string, CourseRecord>, nested = false): string {
  if (req.kind === "course") return withGrade(req.course, req.minGrade);
  if (req.kind === "dept-level") return withGrade(`${req.dept}${req.minNumber} or a higher ${req.dept} course`, req.minGrade);
  if (req.kind === "manual") return req.text;
  if (req.kind === "all") {
    const parts = req.of.filter((r) => checkRequirement(r, history) === "unmet").map((r) => describeMissing(r, history, true));
    const text = listing(parts, "and");
    return nested && parts.length > 1 ? `(${text})` : text;
  }
  const grades = new Set(req.of.map((r) => (r.kind === "course" ? (r.minGrade ?? "") : null)));
  if (grades.size === 1 && !grades.has(null)) {
    const grade = [...grades][0] || undefined;
    const ids = req.of.map((r) => (r as { course: string }).course);
    return withGrade(`one of ${listing(ids, "or")}`, grade);
  }
  return `one of ${listing(req.of.map((r) => describeMissing(r, history, true)), "or")}`;
}

/** "A", "A and B", "A, B and C" */
function listing(items: string[], word: "and" | "or"): string {
  return items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} ${word} ${items.at(-1)}`;
}

/** Why each missing course doesn't count yet: later, same term, low grade, or absent. */
function whereNotes(req: Requirement, history: Record<string, CourseRecord>, placement: Placement, term: number): string[] {
  if (req.kind === "manual") return [];
  if (req.kind === "dept-level") {
    const ids = plannedFor(req, placement);
    const graded = ids.find((id) => placement.at.get(id)?.terms.some((t) => t < term) && placement.at.get(id)?.grade);
    if (graded) return [`Your grade in ${graded} was ${placement.at.get(graded)!.grade}.`];
    const same = ids.find((id) => placement.at.get(id)!.terms.includes(term));
    if (same) return [`${same} is in the same term; it has to come first.`];
    for (const id of ids) {
      const later = placement.at.get(id)!.terms.find((t) => t > term);
      if (later !== undefined) return [`${id} is planned for ${placement.termNames[later]}, which is too late.`];
    }
    return [`A ${req.dept} course numbered ${req.minNumber} or higher isn't in your plan.`];
  }
  if (req.kind === "course") {
    const at = placement.at.get(req.course);
    const earlier = at?.terms.some((t) => t < term);
    if (earlier && at?.grade) return [`Your grade in ${req.course} was ${at.grade}.`];
    if (at?.terms.includes(term)) return [`${req.course} is in the same term; it has to come first.`];
    const later = at?.terms.find((t) => t > term);
    if (later !== undefined) return [`${req.course} is planned for ${placement.termNames[later]}, which is too late.`];
    return [`${req.course} isn't in your plan.`];
  }
  const unmet = req.of.filter((r) => checkRequirement(r, history) === "unmet");
  if (req.kind === "any" && courseLeaves(req).every((leaf) => plannedFor(leaf, placement).length === 0)) {
    return ["None of them is in your plan."];
  }
  const notes = unmet.flatMap((r) => whereNotes(r, history, placement, term));
  return req.kind === "any" ? notes.filter((n) => !n.endsWith("isn't in your plan.")) : notes;
}

/** The manual items that decide a "confirm" result, preferring the path whose courses are met. */
function confirmTexts(req: Requirement, history: Record<string, CourseRecord>): string[] {
  // Lowercase the first letter: the text continues a sentence ("Confirm it yourself: must have…").
  if (req.kind === "manual") return [req.text.charAt(0).toLowerCase() + req.text.slice(1)];
  if (req.kind === "course" || req.kind === "dept-level") return [];
  const confirming = req.of.filter((r) => checkRequirement(r, history) === "confirm");
  if (req.kind === "any") {
    const withCourses = confirming.filter((r) => courseLeaves(r).length > 0);
    return (withCourses.length > 0 ? withCourses.slice(0, 1) : confirming).flatMap((r) => confirmTexts(r, history));
  }
  return confirming.flatMap((r) => confirmTexts(r, history));
}

const count = (n: number) => (n === 2 ? "twice" : `${n} times`);

const gradeIs = (c: PlanCourse, grade: string) => c.grade?.trim().toUpperCase() === grade;

/**
 * Owner ruling ("Repeated courses"): a course may be in the plan again only after a completed
 * attempt graded F (failed) or W (withdrawn) — any other repeat is an error.
 */
export function allowsRetake(c: PlanCourse): boolean {
  return c.status === "completed" && (gradeIs(c, "F") || gradeIs(c, "W"));
}

export function checkPlan(plan: Plan, catalog: PlanCatalog, options: CheckOptions = {}): PlanIssue[] {
  const issues: PlanIssue[] = [];
  const prior = new Map((plan.priorCredit ?? []).map((c) => [c.id, c]));
  const creditsOf = (c: PlanCourse) => c.credits ?? catalog.get(c.id)?.credits.min ?? 0;

  // A Renumbered or Cross-listed Twin counts as the course its Twin names (a Credit-only Twin may
  // be a different course, so it never does). Aliases never replace a record the course has itself.
  const twins = twinIndex(catalog);
  const aliasesOf = (id: string) => [...twins(id).renumbered, ...twins(id).crossListed];
  const withAliases = (history: Record<string, CourseRecord>): Record<string, CourseRecord> => {
    const out = { ...history };
    for (const [id, rec] of Object.entries(history)) for (const a of aliasesOf(id)) out[a] ??= rec;
    return out;
  };

  const placement: Placement = { at: new Map(), termNames: plan.terms.map((t) => t.name) };
  const place = (id: string, term: number, grade?: string) => {
    for (const key of [id, ...aliasesOf(id)]) {
      const at = placement.at.get(key) ?? { terms: [] };
      at.terms.push(term);
      if (grade !== undefined) at.grade = grade;
      placement.at.set(key, at);
    }
  };
  for (const c of prior.values()) place(c.id, -1, c.grade);
  plan.terms.forEach((t, i) => t.courses.forEach((c) => place(c.id, i, c.status === "completed" ? c.grade : undefined)));

  // Finished before the current term: prior credit, then each earlier term as we go.
  const before: Record<string, CourseRecord> = {};
  for (const c of prior.values()) before[c.id] = c.grade ? { grade: c.grade } : {};

  const lecturesOf = lectureIndex(catalog);
  /** Prior credit for one of `ids` that earns credit. */
  const priorFor = (has: (id: string) => boolean) =>
    (plan.priorCredit ?? []).some((x) => has(x.id) && counts({ status: "completed", ...(x.grade ? { grade: x.grade } : {}) }));

  plan.terms.forEach((term, i) => {
    // Same-term courses count only where the prerequisite allows concurrent enrollment;
    // a corequisite is met by the same term or an earlier one.
    const prereqHistory: Record<string, CourseRecord> = { ...before };
    const coreqHistory: Record<string, CourseRecord> = { ...before };
    for (const c of term.courses) {
      prereqHistory[c.id] ??= { concurrent: true };
      coreqHistory[c.id] ??= {};
    }
    Object.assign(prereqHistory, withAliases(prereqHistory), prereqHistory);
    Object.assign(coreqHistory, withAliases(coreqHistory), coreqHistory);

    for (const course of term.courses) {
      const info = catalog.get(course.id);
      const at = { term: term.name, course: course.id };
      const where = `${course.id} (${term.name})`;

      // Grad courses as an undergrad (owner ruling): checked from the course id alone, so this
      // runs even for a course TurboTerp's catalog doesn't have, and for a completed course.
      if (isBlockedGraduateCourse(course.id)) {
        issues.push({
          kind: "grad-restricted",
          severity: "error",
          ...at,
          message: `${where} is thesis research or a doctoral-level course (799, 898 or 899) and can't be planned as an undergraduate.`,
        });
      } else if (isGraduateCourse(course.id)) {
        issues.push({
          kind: "grad-permission",
          severity: "warning",
          ...at,
          message: `${where} is a graduate course. Taking it as an undergraduate needs your advisor's permission.`,
        });
        if (course.gradTag === "bs-ms" && !meetsBsMsGrade(course)) {
          issues.push(
            course.status === "completed"
              ? {
                  kind: "grad-double-count-grade",
                  severity: "warning",
                  ...at,
                  message: `${where} needs a B- or better to double-count toward your BS/MS. A grade of ${course.grade} doesn't qualify, so it counts toward your bachelor's degree only.`,
                }
              : {
                  kind: "grad-double-count-grade",
                  severity: "info",
                  ...at,
                  message: `${where} needs a B- or better to double-count toward your BS/MS.`,
                },
          );
        }
      }

      if (!info) {
        issues.push({
          kind: "unknown-course",
          severity: "warning",
          ...at,
          message: `${course.id} isn't in the course data TurboTerp has. Check the course number; if it's right, TurboTerp can't check its prerequisites or credits yet.`,
        });
        continue;
      }
      if (course.status === "completed") continue;

      if (info.prerequisite) {
        const result = checkRequirement(info.prerequisite, prereqHistory);
        if (result === "unmet") {
          const missing = describeMissing(info.prerequisite, prereqHistory);
          const notes = whereNotes(info.prerequisite, prereqHistory, placement, i);
          issues.push({
            kind: "prerequisite",
            severity: "error",
            ...at,
            message: [`${where} needs ${missing} finished in an earlier term.`, ...notes].join(" "),
          });
        } else if (result === "confirm") {
          issues.push({
            kind: "prerequisite",
            severity: "confirm",
            ...at,
            message: `${where} also needs something TurboTerp can't check. Confirm it yourself: ${confirmTexts(info.prerequisite, prereqHistory).join("; ")}.`,
            short: `Confirm: ${confirmTexts(info.prerequisite, prereqHistory).join("; ")}`,
          });
        }
      }

      if (info.corequisite) {
        const result = checkRequirement(info.corequisite, coreqHistory);
        if (result === "unmet") {
          const missing = describeMissing(info.corequisite, coreqHistory);
          const notes = whereNotes(info.corequisite, coreqHistory, placement, i);
          issues.push({
            kind: "corequisite",
            severity: "error",
            ...at,
            message: [`${where} must be taken with ${missing} in the same term, or after it.`, ...notes].join(" "),
          });
        } else if (result === "confirm") {
          issues.push({
            kind: "corequisite",
            severity: "confirm",
            ...at,
            message: `${where} also has a corequisite TurboTerp can't check. Confirm it yourself: ${confirmTexts(info.corequisite, coreqHistory).join("; ")}.`,
            short: `Confirm: ${confirmTexts(info.corequisite, coreqHistory).join("; ")}`,
          });
        }
      }

      // Winter and summer courses (docs/project/term-offerings.md). Fall against spring isn't checked.
      const offered = info.offered;
      const planned = seasonOf(term.name);
      if (offered && planned) {
        const regular = offered.includes("Fall") || offered.includes("Spring");
        if (!regular && (planned === "Fall" || planned === "Spring")) {
          const only = offered.length === 2 ? "winter and summer" : offered[0]!.toLowerCase();
          issues.push({
            kind: "term-offering",
            severity: "warning",
            ...at,
            message: `${course.id} is only offered in ${only}, based on UMD's recent schedules.`,
            short: `Only offered in ${only}`,
          });
        } else if ((planned === "Winter" || planned === "Summer") && !offered.includes(planned)) {
          const season = planned.toLowerCase();
          issues.push({
            kind: "term-offering",
            severity: "warning",
            ...at,
            message: `${course.id} isn't offered in ${season}, based on UMD's recent schedules.`,
            short: `Not offered in ${season}`,
          });
        }
      }

      // Labs and lectures are usually taken together (docs/project/lab-pairs.md). Each check stands
      // down when UMD's own prerequisite or corequisite already names the partner.
      const labs = info.labs ?? [];
      if (labs.length > 0 && !names(info.corequisite, labs)) {
        const isLab = (id: string) => labs.some((l) => sameOrVariant(id, l));
        const together = term.courses.some((x) => isLab(x.id) && counts(x));
        const earlier = priorFor(isLab) || plan.terms.slice(0, i).some((t) => t.courses.some((x) => isLab(x.id) && x.status === "completed" && counts(x)));
        // Name only labs offered for this term that go alongside the lecture: a lab whose prerequisite
        // needs this lecture finished first (BSCI180 after BSCI170) comes after it, not with it.
        const named = offeredFor(labs, catalog, seasonOf(term.name)).filter((l) => !needsFirst(catalog.get(l)!.prerequisite, course.id));
        if (!together && !earlier && named.length > 0) {
          issues.push({
            kind: "lab-missing",
            severity: "warning",
            ...at,
            message: `${course.id} is usually taken with ${named.length === 1 ? `its lab, ${named[0]}` : `one of its labs, ${orList(named)}`}, in the same term.`,
            short: `Usually taken with ${orList(named)}`,
          });
        }
      }

      const lectures = lecturesOf(course.id);
      if (lectures.length > 0 && !names(info.corequisite, lectures) && !names(info.prerequisite, lectures)) {
        const isLecture = (id: string) => lectures.includes(id);
        const together = term.courses.some((x) => isLecture(x.id) && counts(x));
        // A lecture planned earlier already gets lab-missing, so the lab doesn't warn too.
        const earlier = priorFor(isLecture) || plan.terms.slice(0, i).some((t) => t.courses.some((x) => isLecture(x.id) && counts(x)));
        const named = offeredFor(lectures, catalog, seasonOf(term.name));
        if (!together && !earlier && named.length > 0) {
          issues.push({
            kind: "lecture-missing",
            severity: "warning",
            ...at,
            message: `${course.id} is a lab, usually taken in the same term as ${named.length === 1 ? `its lecture, ${named[0]}` : `one of its lectures, ${orList(named)}`}.`,
            short: `Usually taken with ${orList(named)}`,
          });
        }
      }
    }

    for (const c of term.courses) before[c.id] = c.status === "completed" && c.grade ? { grade: c.grade } : {};
  });

  issues.push(...repeatIssues(plan, catalog, prior, creditsOf), ...twinRepeatIssues(plan, catalog, prior));
  issues.push(...gradCapIssues(plan, creditsOf));

  plan.terms.forEach((term) => {
    const season = seasonOf(term.name);
    if (!season) return;
    const credits = term.courses.reduce((t, c) => t + creditsOf(c), 0);
    const info = creditCap(options.college, season);
    const cap = options.maxCredits?.[season] ?? info.max;
    if (credits > cap) {
      const limitLabel = options.college
        ? `the ${cap}-credit ${season.toLowerCase()} limit for ${collegeName(options.college)} students`
        : `the ${cap}-credit limit for a ${season.toLowerCase()} term`;
      const approvalText = info.approval === "dean" ? "your dean's approval" : info.approval === "advisor" ? "your advisor's approval" : "approval";
      issues.push({
        kind: "credit-load",
        severity: "error",
        term: term.name,
        message: `${term.name} has ${credits} credits, over ${limitLabel}. Going over ${cap} credits needs ${approvalText}.`,
      });
    } else if ((season === "Fall" || season === "Spring") && credits < FULL_TIME_CREDITS) {
      issues.push({
        kind: "light-load",
        severity: "info",
        term: term.name,
        message: `${term.name} has ${credits} credits. Full-time students take at least ${FULL_TIME_CREDITS} in a fall or spring term; fewer can affect financial aid, housing and your graduation date.`,
      });
    }
  });
  return issues;
}

const TWIN_LINK = { renumbered: "the same course as", crossListed: "the same course as" } as const;

/**
 * UMD grants credit for only one of a set of Twins (program-sources/course-equivalence.md), so a
 * later Twin of a course the plan already counts adds no credits. Prior credit comes first, then
 * terms in order; an earlier Twin that was a completed F or W attempt earns nothing, so it doesn't count.
 */
function twinRepeatIssues(plan: Plan, catalog: PlanCatalog, prior: Map<string, PriorCredit>): PlanIssue[] {
  const issues: PlanIssue[] = [];
  const twins = twinIndex(catalog);
  const counted = new Set(prior.keys());
  for (const term of plan.terms) {
    for (const course of term.courses) {
      if (!counted.has(course.id)) {
        const t = twins(course.id);
        const kind = (["renumbered", "crossListed", "creditOnly"] as const).find((k) => [...t[k]].some((x) => counted.has(x)));
        if (kind) {
          const earlier = [...t[kind]].find((x) => counted.has(x))!;
          issues.push({
            kind: "twin-repeat",
            severity: "warning",
            term: term.name,
            course: course.id,
            message:
              kind === "creditOnly"
                ? `You already have credit for ${earlier}, and UMD grants credit for only one of ${earlier} and ${course.id}, so ${course.id}'s credits won't add to your total.`
                : `You already have credit for ${earlier}. ${course.id} is ${TWIN_LINK[kind]} ${earlier}, so ${course.id}'s credits won't add to your total.`,
          });
          continue;
        }
      }
      if (!allowsRetake(course)) counted.add(course.id);
    }
  }
  return issues;
}

function repeatIssues(
  plan: Plan,
  catalog: PlanCatalog,
  prior: Map<string, PriorCredit>,
  creditsOf: (c: PlanCourse) => number,
): PlanIssue[] {
  const issues: PlanIssue[] = [];
  const taken = new Map<string, { term: string; credits: number; course: PlanCourse }[]>();
  for (const term of plan.terms) {
    for (const course of term.courses) {
      const info = catalog.get(course.id);
      if (!info) continue;
      const earlier = prior.get(course.id);
      if (earlier) {
        issues.push({
          kind: "repeat",
          severity: "warning",
          term: term.name,
          course: course.id,
          message: `You already have credit for ${course.id}${earlier.source ? ` (${earlier.source})` : ""}. Taking it again counts only once, so these credits won't add to your total.`,
        });
      }
      const list = taken.get(course.id) ?? [];
      list.push({ term: term.name, credits: creditsOf(course), course });
      taken.set(course.id, list);
    }
  }

  for (const [id, list] of taken) {
    if (list.length < 2) continue;
    const repeat = catalog.get(id)!.repeat;
    const terms = listing(list.map((x) => x.term), "and");
    const last = { kind: "repeat" as const, term: list.at(-1)!.term, course: id };
    if (repeat.kind === "unknown") {
      // Owner ruling: every attempt after the first must follow a failed or withdrawn one.
      const allowed = list.every((_, k) => k === 0 || allowsRetake(list[k - 1]!.course));
      if (!allowed) {
        issues.push({
          ...last,
          severity: "error",
          message: `${id} is in your plan ${count(list.length)} (${terms}). You can only retake a course you failed or withdrew from.`,
        });
      }
      continue;
    }
    const total = list.reduce((t, x) => t + x.credits, 0);
    if (repeat.maxCredits !== undefined && total > repeat.maxCredits) {
      issues.push({
        ...last,
        severity: "error",
        message: `${id} can count for at most ${repeat.maxCredits} credits, but your plan has ${total} (${terms}).`,
      });
    }
  }
  return issues;
}

/**
 * Whole-plan grad-credit caps (grad-courses.ts): graduate-only credits (9 warns, 12 -- the
 * petitioned cap -- errors) and the BS/MS double-count cap (35% of `plan.mastersCredits`, or an
 * info note with no total set). One issue each, at the term of the last occurrence in plan order
 * (matching repeatIssues' convention), since these are totals across the whole plan.
 */
function gradCapIssues(plan: Plan, creditsOf: (c: PlanCourse) => number): PlanIssue[] {
  const issues: PlanIssue[] = [];
  const byTag = (tag: GradCreditTag) => {
    const occurrences: { term: string; credits: number }[] = [];
    for (const term of plan.terms) {
      for (const course of term.courses) if (course.gradTag === tag) occurrences.push({ term: term.name, credits: creditsOf(course) });
    }
    return occurrences;
  };

  const graduateOnly = byTag("graduate-only");
  const graduateOnlyTotal = graduateOnly.reduce((t, o) => t + o.credits, 0);
  if (graduateOnlyTotal > GRADUATE_ONLY_MAX_CREDITS) {
    issues.push({
      kind: "grad-only-cap",
      severity: "error",
      term: graduateOnly.at(-1)!.term,
      message: `Your plan has ${graduateOnlyTotal} graduate-only credits, over the petitioned ${GRADUATE_ONLY_MAX_CREDITS}-credit cap (${GRADUATE_ONLY_WARN_CREDITS} plus up to 3 more by petition).`,
    });
  } else if (graduateOnlyTotal > GRADUATE_ONLY_WARN_CREDITS) {
    issues.push({
      kind: "grad-only-cap",
      severity: "warning",
      term: graduateOnly.at(-1)!.term,
      message: `Your plan has ${graduateOnlyTotal} graduate-only credits, over the usual ${GRADUATE_ONLY_WARN_CREDITS}-credit cap. A petition can add up to 3 more credits (up to ${GRADUATE_ONLY_MAX_CREDITS}).`,
    });
  }

  const bsMs = byTag("bs-ms");
  const bsMsTotal = bsMs.reduce((t, o) => t + o.credits, 0);
  if (bsMsTotal > 0) {
    const term = bsMs.at(-1)!.term;
    const cap = bsMsCap(plan.mastersCredits);
    if (cap === null) {
      issues.push({
        kind: "grad-double-count-cap",
        severity: "info",
        term,
        message: `${bsMsTotal} credits are tagged to double-count toward a BS/MS. Add your master's-credit total to check the 35% cap.`,
      });
    } else if (bsMsTotal > cap) {
      issues.push({
        kind: "grad-double-count-cap",
        severity: "warning",
        term,
        message: `${bsMsTotal} credits are tagged to double-count toward a BS/MS, over the 35% cap of ${cap} credits for a ${plan.mastersCredits}-credit master's.`,
      });
    }
  }
  return issues;
}
