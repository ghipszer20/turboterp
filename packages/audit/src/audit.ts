// Degree audit. Vocabulary follows CONTEXT.md: a Program has Requirements;
// an Audit makes an Assignment of the student's courses to Requirements and
// reports Gaps and Overshoot. Assignment is solved as an optimization
// problem (docs/adr/0001-audit-assigns-courses-by-optimization.md).

import loadHighs from "highs";

/** Which courses can count toward a requirement. */
export type CourseFilter = {
  courses?: string[];
  departments?: string[];
  /**
   * Inclusive course-number bounds, e.g. 400–499 for "400-level". A range that reaches 499 also
   * takes graduate courses (see `inNumberRange`).
   */
  minNumber?: number;
  maxNumber?: number;
  /** Graduate courses never count, e.g. a program that reserves 600+ courses for graduate students. */
  noGraduateCourses?: boolean;
  exclude?: string[];
  /** Courses carrying any of these Gen Ed codes, e.g. ["DSHU"]. */
  genEd?: string[];
  /** Every course matches (e.g. the university's 120-credit total). */
  anyCourse?: boolean;
};

/** A distribution area: a course list, a course filter (a department, a level range), or both. */
export type Area = { name: string; courses?: string[]; from?: CourseFilter };

/** One member of a course set: a specific course, or `count` courses matching a filter ("two 400-level AOSC courses"). */
export type SetMember = string | { count: number; from: CourseFilter };

export type Requirement = RequirementRule & {
  /**
   * An overlay counts courses without using them up, e.g. Math's "eight 400-level
   * courses, which must include MATH410…": MATH410 counts toward both.
   */
  overlay?: boolean;
  /**
   * Ids of requirements in the same program: an overlay with `within` counts a course only if that
   * course is also assigned (using it up) to one of them, e.g. Gen Ed's Big Question courses must
   * be among the Distributive Studies courses.
   */
  within?: string[];
  /** Lowest grade a completed course needs for this requirement only, e.g. Academic Writing's "C-". */
  minGrade?: string;
  /**
   * Lowest credit-weighted GPA (UMD 4.0 scale) over the completed letter-graded courses assigned
   * to this requirement, e.g. the CS Upper Level Concentration's 1.7. Below it with nothing
   * planned for the requirement, a satisfied requirement drops to partial; with planned courses
   * assigned it is only flagged at risk. The solver prefers higher-graded courses (a tie-break).
   */
  minGpa?: number;
  /**
   * The source's list isn't closed ("or an equivalent", "not limited to these examples", "other
   * courses may be approved"): the audit accepts only the listed courses, and the Advisor tells the
   * student that other courses may count with advisor approval (owner ruling, rulings.md "Minors").
   */
  advisorMayApprove?: true;
};

export type RequirementRule =
  /** One course from a short list (usually just one), e.g. "CMSC351". */
  | { kind: "course"; id: string; name: string; options: string[] }
  /**
   * N courses, or N credits, matching a filter, e.g. "12 credits of 400-level CMSC".
   * Alternatives are "or" groups among the courses: at most one course of each group
   * counts, e.g. "Select two of: CMSC426, CMSC460 or CMSC466, …" has [["CMSC460", "CMSC466"]].
   */
  | { kind: "choose"; id: string; name: string; count?: number; credits?: number; minCredits?: number; from: CourseFilter; alternatives?: string[][] }
  /** N courses spread over areas, e.g. "five courses from at least three areas, at most three per area". */
  | { kind: "distribution"; id: string; name: string; count: number; minAreas: number; maxPerArea: number; areas: Area[] }
  /** N credits in a number range, all from ONE department, e.g. CS's "12 credits of 300–400 level courses from one discipline outside CMSC". */
  | {
      kind: "concentration";
      id: string;
      name: string;
      credits: number;
      minNumber: number;
      maxNumber: number;
      noGraduateCourses?: boolean;
      excludeDepartments?: string[];
      /** Individually-ineligible courses, e.g. a course "credit only granted for" one in the excluded department. */
      exclude?: string[];
      /**
       * Departments that count as ONE discipline for the "one discipline" rule, e.g. CS's ULC
       * lets MATH and STAT (or LGBT and WGSS) mix and match: `[["MATH", "STAT"], ["LGBT", "WGSS"]]`.
       * A department not listed in any group is its own discipline, as before.
       */
      disciplineGroups?: string[][];
    }
  /**
   * Every course of one set, e.g. Math's depth sequence "MATH410 & MATH411 or MATH403 & MATH404";
   * or of `count` different sets (default 1), e.g. "Select two of: ENST301 & ENST302 & ENST303, ENST415, ENST423".
   * A member may be a filter part, e.g. ["AOSC200", "AOSC201", { count: 2, from: 400-level AOSC }].
   * A course counts toward one set, and one member of it, only.
   */
  | { kind: "sets"; id: string; name: string; options: SetMember[][]; count?: number }
  /**
   * An Open Slot: "from an approved list" the department doesn't publish. It holds no courses and
   * the audit assigns none to it; it's satisfied only once the student confirms it with their
   * advisor (AuditOptions.confirmed), so the program isn't complete until then.
   */
  | { kind: "openSlot"; id: string; name: string; credits?: number; note?: string };

export type Program = {
  id: string;
  name: string;
  requirements: Requirement[];
  /** Lowest grade a completed course needs to count toward this program, e.g. "C-". */
  minGrade?: string;
  /**
   * Lowest credit-weighted GPA (UMD 4.0 scale) over every completed letter-graded course the
   * program uses, each course counted once even if it fills an overlay requirement too. Audited as
   * one extra result, id `program-gpa`, appended after the program's requirements.
   */
  minGpa?: number;
  /**
   * Caps on exam credit: of the courses assigned to any of `requirements` (ids in this program),
   * at most `courses` may be StudentCourse.exam courses, each counted once. E.g. Gen Ed's "only 6
   * of the 8 Distributive Studies courses can be AP or IB credit".
   */
  examLimits?: { requirements: string[]; courses: number }[];
  /** Catalog edition these rules come from, e.g. "2026-27". */
  catalogYear?: string;
  /** Where the rules came from. */
  source?: string;
  /** True only after the owner has reviewed and signed off (a Verified Program). */
  verified?: boolean;
  /** Interpretations the owner must check before verifying. */
  reviewNotes?: string[];
  /**
   * Sharing Limits this program sets (the rule format's `max_shared_with`): at most `courses`
   * courses, and/or `credits` credits, of this program may also count toward the named other
   * programs (by id), or toward every other program when `programs` is omitted. Requirement
   * Layers (Gen Ed, university, college rules) never count as sharing. Overlay requirements don't
   * use courses up, so they're outside these limits (as with `maxSharedCourses`).
   * E.g. a minor's "at most 2 courses may also count toward the major": [{ courses: 2 }].
   */
  maxSharedWith?: SharingLimit[];
  /** Set on a Requirement Layer (rules every student in scope gets, not a declared program). */
  layer?: "university" | "gen-ed" | "college";
};

export type SharingLimit = { programs?: string[]; courses?: number; credits?: number };

/**
 * Picker metadata a program file declares next to each exported Program: everything ProgramEntry
 * (@turboterp/programs) needs beyond the Program itself (id/name/catalogYear/verified come from
 * the Program). The registry generator (packages/programs/scripts/build-registry.ts) pairs a
 * `<name>Meta` export with the `<name>` Program export in the same module.
 *
 * Lives here (not in @turboterp/programs, which depends on @turboterp/audit and @turboterp/catalog)
 * so program files in both packages can import it without a circular package dependency. `college`
 * repeats @turboterp/plan's `College` union rather than importing it, for the same reason (plan
 * depends on audit).
 */
export type ProgramMeta = {
  kind: "major" | "minor" | "certificate" | "special";
  /** The college that owns the program's catalog page (`colleges-schools/<slug>/` in its URL);
   * the Advisor's default for the credit-cap check. Special programs run by Undergraduate Studies
   * or the Honors College use UGST. */
  college: "AGNR" | "ARCH" | "ARHU" | "BSOS" | "BMGT" | "CMNS" | "EDUC" | "ENGR" | "INFO" | "JOUR" | "PLCY" | "SPHL" | "UGST" | "USG";
  /** Short name for headers, e.g. "Math (Applied)". Defaults to the Program's own name. */
  short?: string;
  /** Tracks of one major share this key; a student has one track per major. Defaults to the
   * Program's own id. */
  major?: string;
  /** Name of the track within its major, if any. */
  track?: string;
  /** Set on exactly one track per major that has more than one: the registry generator lists it
   * first among that major's tracks (the Advisor's default track for a major before the student
   * has picked one, e.g. which track an undeclared-major notice offers). */
  defaultTrack?: true;
  /** The catalog page and the department's own page (the department page wins where they differ). */
  sources: { catalog?: string; department?: string };
  /** Eligibility gate (owner ruling, docs/project/rulings.md "Minors"): the majors this minor or
   * certificate is closed to; the Advisor blocks it for students who have declared one.
   * `programs` holds program ids (one track, e.g. "bsci-major-phnb") or major keys (every track,
   * e.g. "astr"); `colleges` means every major that college owns; `reason` is one plain sentence
   * from the source. */
  notOpenTo?: NotOpenTo;
  /** The inverse gate: the program is open ONLY to students with a declared major matching this
   * (same shape and matching as `notOpenTo`). A student with no declared major isn't blocked
   * (they may still be heading into an eligible major). */
  onlyOpenTo?: NotOpenTo;
};

export type NotOpenTo = { programs?: string[]; colleges?: ProgramMeta["college"][]; reason: string };

export type StudentCourse = {
  id: string;
  credits: number;
  status: "completed" | "planned";
  grade?: string;
  /** Gen Ed codes the course carries (from the Schedule of Classes). */
  genEd?: string[];
  /** Credits this course brings to Gen Ed credit minimums when it differs from `credits`: a lab-science lecture whose paired lab is on record carries both. */
  genEdCredits?: number;
  /** The credit comes from an AP or IB exam (see Program.examLimits). */
  exam?: true;
};

/** Every literal course id one requirement mentions -- never a department/number-range filter's
 * courses, since matching those needs the filter machinery, not a fixed id list. */
function requirementCourseIds(req: RequirementRule): string[] {
  if (req.kind === "course") return req.options;
  if (req.kind === "choose") return [...(req.from.courses ?? []), ...(req.alternatives?.flat() ?? [])];
  if (req.kind === "distribution") return req.areas.flatMap((a) => a.courses ?? []);
  if (req.kind === "concentration" || req.kind === "openSlot") return [];
  return req.options.flat().flatMap((m) => (typeof m === "string" ? [m] : (m.from.courses ?? [])));
}

/** Every literal course id a Program's requirements mention, deduped, in requirement order. Used
 * to build a per-program course set (@turboterp/programs) cheaply, without running the audit --
 * e.g. to pre-filter which undeclared majors are even worth auditing for a double-major notice. */
export function programCourseIds(program: Program): string[] {
  return [...new Set(program.requirements.flatMap(requirementCourseIds))];
}

// UMD letter grades, lowest to highest.
const GRADE_ORDER = ["F", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
const gradeRank = (g: string) => GRADE_ORDER.indexOf(g.trim().toUpperCase());
const GRADE_POINTS = [0, 0.7, 1, 1.3, 1.7, 2, 2.3, 2.7, 3, 3.3, 3.7, 4, 4];

/** Grade points on UMD's 4.0 scale (A+ = 4.0), or undefined for a non-letter grade (P, S, W...). */
export function gradePoints(grade: string | undefined): number | undefined {
  const rank = grade === undefined ? -1 : gradeRank(grade);
  return rank < 0 ? undefined : GRADE_POINTS[rank];
}

/**
 * A completed course graded F or W earns no credit (UMD grading; owner ruling: a course may be
 * retaken only after an F or a W), so it never satisfies any requirement -- even one with no
 * minimum grade, like the university's "any course" credit total or a Gen Ed category. Planned
 * courses, and completed courses with no grade (AP/IB/transfer credit) or a passing grade
 * (including P/S), earn credit as usual. Case- and whitespace-insensitive, like gradeRank.
 */
export function earnsCredit(course: Pick<StudentCourse, "status" | "grade">): boolean {
  if (course.status !== "completed" || !course.grade) return true;
  const g = course.grade.trim().toUpperCase();
  return g !== "F" && g !== "W";
}

function meetsGrade(course: StudentCourse, minGrade: string | undefined): boolean {
  if (!earnsCredit(course)) return false;
  if (!minGrade || course.status !== "completed" || !course.grade) return true;
  const rank = gradeRank(course.grade);
  // Non-letter grades (P, S…) don't meet a letter-grade minimum.
  return rank >= 0 && rank >= gradeRank(minGrade);
}

/** Id of the synthetic result a program with `minGpa` gets; it is not one of `program.requirements`. */
export const PROGRAM_GPA_ID = "program-gpa";

export type RequirementResult = {
  id: string;
  name: string;
  status: "satisfied" | "partial" | "missing";
  /** Courses the Assignment put toward this requirement. */
  assigned: string[];
  /** Only with a minGpa and at least one graded course assigned: the GPA of those completed courses. */
  gpa?: { value: number; min: number; atRisk?: boolean };
  /** Completed courses that would count toward this requirement if not for their grade. */
  belowMinimum?: { course: string; grade: string; minGrade: string }[];
};

export type AuditResult = {
  requirements: RequirementResult[];
  /** Courses no requirement needs (Overshoot). */
  unused: string[];
};

let solver: ReturnType<typeof loadHighs> | null = null;
const getSolver = () => (solver ??= loadHighs());

const COURSE_ID = /^([A-Z]{4})(\d{3})[A-Z]?$/;

/** 600–897, except 799 (thesis research): a graduate course an undergrad may take with permission. */
export function isGraduateCourseNumber(n: number): boolean {
  return n >= 600 && n <= 897 && n !== 799;
}

/**
 * Grad courses as an undergrad (owner, 2026-10-07; docs/project/rulings.md): with permission, a
 * graduate course counts toward any range that reaches the top of the 400 level ("400-level",
 * "upper level"), unless the program opts out. Narrower bands ("300-level") don't take them.
 */
export function rangeTakesGraduateCourses(min = 0, max = 999, noGraduateCourses = false): boolean {
  return !noGraduateCourses && min <= 499 && max >= 499;
}

/** Whether course number `n` is in a requirement's range, graduate courses included (above). */
function inNumberRange(n: number, min: number, max: number, noGraduateCourses = false): boolean {
  if (!isGraduateCourseNumber(n)) return n >= min && n <= max;
  if (noGraduateCourses) return false;
  return (n >= min && n <= max) || rangeTakesGraduateCourses(min, max);
}

export function matchesFilter(filter: CourseFilter, course: Pick<StudentCourse, "id" | "genEd">): boolean {
  const courseId = course.id;
  if (filter.exclude?.includes(courseId)) return false;
  if (filter.anyCourse) return true;
  if (filter.courses?.includes(courseId)) return true;
  if (filter.genEd) return filter.genEd.some((code) => course.genEd?.includes(code));
  const m = COURSE_ID.exec(courseId);
  if (!m) return false;
  if (!filter.departments) return false;
  if (!filter.departments.includes(m[1]!)) return false;
  const n = Number(m[2]);
  return inNumberRange(n, filter.minNumber ?? 0, filter.maxNumber ?? 999, filter.noGraduateCourses);
}

/** Whether a course belongs to a distribution area: it is in the area's list or matches its filter. */
export function inArea(area: Area, course: Pick<StudentCourse, "id" | "genEd">): boolean {
  return (area.courses?.includes(course.id) ?? false) || (area.from ? matchesFilter(area.from, course) : false);
}

/** How many courses completing a set takes. */
const setSize = (option: SetMember[]) => option.reduce((t, m) => t + (typeof m === "string" ? 1 : m.count), 0);

/** How much a requirement needs: courses, or credits for credit requirements. */
function need(req: Requirement): number {
  if (req.kind === "course") return 1;
  if (req.kind === "distribution") return req.count;
  if (req.kind === "concentration") return req.credits;
  if (req.kind === "openSlot") return 0;
  if (req.kind === "sets") {
    const sizes = req.options.map(setSize).sort((a, b) => a - b);
    return sizes.slice(0, req.count ?? 1).reduce((t, n) => t + n, 0);
  }
  return req.credits ?? req.count ?? 0;
}

/**
 * One way a course could count toward a requirement: through an area (distributions),
 * as one member of one option (sets; `area` holds the option index, `member` the member's),
 * or within a department (concentrations).
 */
type Pair = {
  p: number;
  c: number;
  r: number;
  area: number | null;
  member?: number;
  department: string | null;
  name: string;
  weight: number;
};

function pairsFor(req: Requirement, p: number, r: number, course: StudentCourse, c: number): Pair[] {
  const base = `x_${p}_${c}_${r}`;
  const plain = (weight: number): Pair[] => [{ p, c, r, area: null, department: null, name: base, weight }];
  if (req.kind === "openSlot") return [];
  if (req.kind === "course") return req.options.includes(course.id) ? plain(1) : [];
  if (req.kind === "choose") return matchesFilter(req.from, course) ? plain(req.credits ? course.credits : 1) : [];
  if (req.kind === "concentration") {
    const m = COURSE_ID.exec(course.id);
    if (!m || req.excludeDepartments?.includes(m[1]!) || req.exclude?.includes(course.id)) return [];
    const n = Number(m[2]);
    if (!inNumberRange(n, req.minNumber, req.maxNumber, req.noGraduateCourses)) return [];
    const dept = m[1]!;
    // Departments in the same disciplineGroup share one "discipline" key, so the one-department
    // pick below (onedept_) treats them as interchangeable instead of two separate disciplines.
    const group = req.disciplineGroups?.find((g) => g.includes(dept));
    // "_"-joined, not e.g. "MATH/STAT": department feeds into the "d_<id>_<dept>" LP variable
    // name below, and the solver's LP format doesn't accept "/" in an identifier.
    return [{ p, c, r, area: null, department: group ? group.join("_") : dept, name: base, weight: course.credits }];
  }
  if (req.kind === "sets") {
    return req.options.flatMap((option, k) =>
      option.flatMap((m, j): Pair[] => {
        if (typeof m === "string") return m === course.id ? [{ p, c, r, area: k, member: j, department: null, name: `${base}_${k}`, weight: 1 }] : [];
        return matchesFilter(m.from, course) ? [{ p, c, r, area: k, member: j, department: null, name: `${base}_${k}_f${j}`, weight: 1 }] : [];
      }),
    );
  }
  return req.areas.flatMap((area, a) =>
    inArea(area, course)
      ? [{ p, c, r, area: a, department: null, name: `${base}_${a}`, weight: 1 }]
      : [],
  );
}

/** Completed courses that would pair with the requirement but for the program's or requirement's minimum grade. */
function belowMinimumFor(program: Program, req: Requirement, p: number, r: number, courses: StudentCourse[], assigned: Pair[]) {
  const found: NonNullable<RequirementResult["belowMinimum"]> = [];
  courses.forEach((course, c) => {
    if (course.status !== "completed" || !course.grade || !earnsCredit(course) || found.some((f) => f.course === course.id)) return;
    const minGrade = [program.minGrade, req.minGrade].find((m) => m !== undefined && !meetsGrade(course, m));
    if (!minGrade) return;
    // A retake that does count (same course, passing grade) makes the failed attempt irrelevant.
    if (assigned.some((q) => courses[q.c]!.id === course.id)) return;
    if (pairsFor(req, p, r, course, c).length > 0) found.push({ course: course.id, grade: course.grade.trim().toUpperCase(), minGrade });
  });
  return found;
}

/** Credits a course brings to a Gen Ed credit minimum. */
const genEdCredits = (course: StudentCourse) => course.genEdCredits ?? course.credits;
const sum = (ps: Pair[]) => ps.map((q) => `${q.weight} ${q.name}`).join(" + ");

export type AuditOptions = {
  /** How many courses may count toward more than one program (a Sharing Limit). Unlimited if omitted. */
  maxSharedCourses?: number;
  /**
   * A Double Degree: the program indices each Degree holds (its majors, minors and its own college
   * rules). Programs in no group (Gen Ed, the university rules) belong to every degree at once.
   * With `minUniqueCredits`, the audit prefers an assignment that gives every degree at least that
   * many credits used by it and not by any other degree (worth less than one requirement).
   */
  degrees?: number[][];
  minUniqueCredits?: number;
  /** Open Slots the student confirmed with their advisor, as "<programId>/<requirementId>". */
  confirmed?: string[];
};

/** The key an Open Slot is confirmed by: requirement ids repeat across programs. */
export const slotKey = (programId: string, requirementId: string) => `${programId}/${requirementId}`;

export type StudentAudit = {
  results: AuditResult[];
  /** Per degree (only with `degrees`): credits its programs use that no other degree uses. */
  uniqueCredits?: number[];
};

/**
 * Integer program (ADR 0001), over every program at once:
 *   x[p,c,r(,a)] = 1 when course c counts toward requirement r of program p (through area a)
 *   y[p,r]       = 1 when requirement r of program p is satisfied
 *   z[p,r,a]     = 1 when distribution r of program p uses area a
 *   s[c]         = 1 when course c counts toward more than one program
 *   within a program each course counts once; across programs, sharing is limited;
 *   each requirement takes at most what it needs, and is satisfied only with enough;
 *   distributions cap each area and need enough areas to be satisfied;
 *   o[p,r,k] / w[p,r,k] = 1 when set k of a sets requirement is pursued / complete: at most `count`
 *   are pursued, `count` must be complete, each course fills one member of one set, and a filter
 *   part takes at most its count; a choose's "or" group contributes at most one course;
 *   maximize satisfied requirements first, then total progress.
 */
export async function auditPrograms(
  programs: Program[],
  courses: StudentCourse[],
  options: AuditOptions = {},
): Promise<AuditResult[]> {
  return (await auditStudent(programs, courses, options)).results;
}

/**
 * auditPrograms plus per-program Sharing Limits (Program.maxSharedWith) and, for a Double Degree,
 * each degree's unique credits. One integer program over every program at once; see auditPrograms.
 *   t[p,l,c] = 1 when course c counts toward program p and a program its limit l names
 *   q[g,c]   = 1 when course c counts toward degree g and no other degree
 *   u[g]     = 1 when degree g has at least minUniqueCredits of those credits
 */
export async function auditStudent(
  programs: Program[],
  courses: StudentCourse[],
  options: AuditOptions = {},
): Promise<StudentAudit> {
  const pairs = programs.flatMap((program, p) =>
    courses.flatMap((course, c) =>
      meetsGrade(course, program.minGrade)
        ? program.requirements.flatMap((req, r) => (meetsGrade(course, req.minGrade) ? pairsFor(req, p, r, course, c) : []))
        : [],
    ),
  );
  const y = (p: number, r: number) => `y_${p}_${r}`;
  const binaries = [...programs.flatMap((pr, p) => pr.requirements.map((_, r) => y(p, r))), ...pairs.map((q) => q.name)];
  const constraints: string[] = [];

  // Overlay requirements count courses without using them up, so they're left
  // out of the "once" and sharing limits below.
  const consumes = (q: Pair) => !programs[q.p]!.requirements[q.r]!.overlay;

  // Within one program, a course counts toward at most one requirement.
  programs.forEach((_, p) =>
    courses.forEach((_, c) => {
      const mine = pairs.filter((q) => q.p === p && q.c === c && consumes(q));
      if (mine.length > 1) constraints.push(` once_${p}_${c}: ${mine.map((q) => q.name).join(" + ")} <= 1`);
    }),
  );

  // An overlay with `within` counts a course only if it also fills one of those requirements.
  programs.forEach((program, p) => {
    const index = (ids: string[]) => ids.map((id) => program.requirements.findIndex((req) => req.id === id)).filter((r) => r >= 0);
    program.requirements.forEach((req, r) => {
      if (!req.within) return;
      const targets = index(req.within);
      pairs
        .filter((q) => q.p === p && q.r === r)
        .forEach((q) => {
          const hosts = pairs.filter((w) => w.p === p && w.c === q.c && targets.includes(w.r) && consumes(w));
          constraints.push(` within_${q.name}: ${[q.name, ...hosts.map((w) => `- ${w.name}`)].join(" ")} <= 0`);
        });
    });
  });

  // Exam credit limits (Program.examLimits): a helper binary per exam course, so one counts once.
  programs.forEach((program, p) =>
    program.examLimits?.forEach((limit, l) => {
      const targets = limit.requirements.map((id) => program.requirements.findIndex((req) => req.id === id));
      const flags: string[] = [];
      courses.forEach((course, c) => {
        if (!course.exam) return;
        const mine = pairs.filter((q) => q.p === p && q.c === c && targets.includes(q.r));
        if (mine.length === 0) return;
        const e = `e_${p}_${l}_${c}`;
        binaries.push(e);
        flags.push(e);
        mine.forEach((q) => constraints.push(` exam_${e}_${q.name}: ${q.name} - ${e} <= 0`));
      });
      if (flags.length > 0) constraints.push(` examcap_${p}_${l}: ${flags.join(" + ")} <= ${limit.courses}`);
    }),
  );

  // Across programs: a course used by k programs needs k-1 "shares"; shares are limited.
  if (options.maxSharedCourses !== undefined && programs.length > 1) {
    const shares: string[] = [];
    courses.forEach((_, c) => {
      const uses = pairs.filter((q) => q.c === c && consumes(q));
      if (new Set(uses.map((q) => q.p)).size < 2) return;
      const s = `s_${c}`;
      binaries.push(s);
      shares.push(s);
      constraints.push(` share_${c}: ${uses.map((q) => q.name).join(" + ")} - ${programs.length - 1} ${s} <= 1`);
    });
    if (shares.length > 0) constraints.push(` shared: ${shares.join(" + ")} <= ${options.maxSharedCourses}`);
  }

  // Consuming uses of course c by program p (at most one, by the "once" rule above).
  const usesOf = (p: number, c: number) => pairs.filter((q) => q.p === p && q.c === c && consumes(q));

  // Per-program Sharing Limits (maxSharedWith).
  programs.forEach((program, p) =>
    program.maxSharedWith?.forEach((limit, l) => {
      const others = programs
        .map((o, i) => ({ o, i }))
        .filter(({ o, i }) => i !== p && !o.layer && (limit.programs ? limit.programs.includes(o.id) : true))
        .map(({ i }) => i);
      const shared: { t: string; credits: number }[] = [];
      courses.forEach((course, c) => {
        const mine = usesOf(p, c);
        if (mine.length === 0) return;
        const theirs = others.map((i) => usesOf(i, c)).filter((u) => u.length > 0);
        if (theirs.length === 0) return;
        const t = `t_${p}_${l}_${c}`;
        binaries.push(t);
        shared.push({ t, credits: course.credits });
        theirs.forEach((u, k) => constraints.push(` lim_${p}_${l}_${c}_${k}: ${[...mine, ...u].map((q) => q.name).join(" + ")} - ${t} <= 1`));
      });
      if (shared.length === 0) return;
      if (limit.courses !== undefined) constraints.push(` limc_${p}_${l}: ${shared.map((x) => x.t).join(" + ")} <= ${limit.courses}`);
      if (limit.credits !== undefined) constraints.push(` limk_${p}_${l}: ${shared.map((x) => `${x.credits} ${x.t}`).join(" + ")} <= ${limit.credits}`);
    }),
  );

  // Double Degree: each degree's unique credits (see StudentAudit).
  const degrees = options.degrees ?? [];
  const uniqueGoal: string[] = [];
  if (options.minUniqueCredits !== undefined) {
    degrees.forEach((group, g) => {
      const outside = programs.map((_, i) => i).filter((i) => !group.includes(i) && degrees.some((d) => d.includes(i)));
      const terms: string[] = [];
      courses.forEach((course, c) => {
        const mine = group.flatMap((p) => usesOf(p, c));
        if (mine.length === 0 || course.credits <= 0) return;
        const q = `q_${g}_${c}`;
        binaries.push(q);
        terms.push(`${course.credits} ${q}`);
        constraints.push(` uq_${g}_${c}: ${q} - ${mine.map((x) => x.name).join(" - ")} <= 0`);
        outside.flatMap((i) => usesOf(i, c)).forEach((x, k) => constraints.push(` ux_${g}_${c}_${k}: ${q} + ${x.name} <= 1`));
      });
      const u = `u_${g}`;
      binaries.push(u);
      uniqueGoal.push(u);
      constraints.push(terms.length > 0 ? ` uniq_${g}: ${terms.join(" + ")} - ${options.minUniqueCredits} ${u} >= 0` : ` uniq_${g}: ${u} <= 0`);
    });
  }

  programs.forEach((program, p) =>
    program.requirements.forEach((req, r) => {
      const mine = pairs.filter((q) => q.p === p && q.r === r);
      const n = need(req);
      const id = `${p}_${r}`;
      if (mine.length === 0) {
        constraints.push(` sat_${id}: ${y(p, r)} <= 0`);
        return;
      }
      if (req.kind === "sets") {
        // o[k]: option k is the one being pursued; w[k]: option k is complete.
        const picked: string[] = [];
        const complete: string[] = [];
        req.options.forEach((option, k) => {
          const inOption = mine.filter((q) => q.area === k);
          if (inOption.length === 0) return;
          const o = `o_${id}_${k}`;
          const w = `w_${id}_${k}`;
          binaries.push(o, w);
          picked.push(o);
          complete.push(w);
          inOption.forEach((q, i) => constraints.push(` pick_${id}_${k}_${i}: ${q.name} - ${o} <= 0`));
          if (option.every((m) => typeof m === "string")) {
            constraints.push(` done_${id}_${k}: ${sum(inOption)} - ${option.length} ${w} >= 0`);
          } else {
            // With a filter part, each member is filled on its own: a fixed course once, a filter part up to its count.
            option.forEach((m, j) => {
              const n = typeof m === "string" ? 1 : m.count;
              const inMember = inOption.filter((q) => q.member === j);
              if (inMember.length === 0) {
                constraints.push(` done_${id}_${k}_${j}: ${w} <= 0`);
                return;
              }
              constraints.push(` fill_${id}_${k}_${j}: ${sum(inMember)} <= ${n}`);
              constraints.push(` done_${id}_${k}_${j}: ${sum(inMember)} - ${n} ${w} >= 0`);
            });
          }
          constraints.push(` doneonly_${id}_${k}: ${w} - ${o} <= 0`);
        });
        const count = req.count ?? 1;
        constraints.push(` onepick_${id}: ${picked.join(" + ")} <= ${count}`);
        constraints.push(` sat_${id}: ${count} ${y(p, r)} - ${complete.join(" - ")} <= 0`);
        // A course counts toward one set and one member only. Implied when one set of plain courses is
        // picked; needed for several sets or a filter part, overlay or not.
        courses.forEach((_, c) => {
          const uses = mine.filter((q) => q.c === c);
          if (uses.length > 1 && (count > 1 || uses.some((q) => typeof req.options[q.area!]![q.member!] !== "string"))) constraints.push(` oneset_${id}_${c}: ${uses.map((q) => q.name).join(" + ")} <= 1`);
        });
        return;
      }
      // A credit requirement may overshoot by less than one course (e.g. 4 credits toward the last 3).
      const slack = Math.max(0, ...mine.map((q) => q.weight)) - 1;
      if (!(req.kind === "choose" && req.minCredits !== undefined && !req.credits)) constraints.push(` cap_${id}: ${sum(mine)} <= ${n + slack}`);
      constraints.push(` sat_${id}: ${sum(mine)} - ${n} ${y(p, r)} >= 0`);

      if (req.kind === "choose" && req.minCredits !== undefined && !req.credits) {
        // `count` courses AND `minCredits` credits (Gen Ed: "2 courses, 6 credits"). More than `count` courses
        // may be assigned to reach the credits, but never past the credits plus one course.
        const cr = (q: Pair) => genEdCredits(courses[q.c]!);
        const credit = mine.map((q) => `${cr(q)} ${q.name}`).join(" + ");
        const least = Math.max(1, Math.min(...mine.map(cr)));
        constraints.push(` mincr_${id}: ${credit} - ${req.minCredits} ${y(p, r)} >= 0`);
        constraints.push(` mincap_${id}: ${credit} <= ${req.minCredits + Math.max(...mine.map(cr)) - 1}`);
        constraints.push(` cap_${id}_n: ${sum(mine)} <= ${Math.max(n, Math.ceil(req.minCredits / least))}`);
      }

      if (req.kind === "choose") {
        // At most one course of each "or" group counts.
        req.alternatives?.forEach((group, g) => {
          const inGroup = mine.filter((q) => group.includes(courses[q.c]!.id));
          if (inGroup.length > 1) constraints.push(` alt_${id}_${g}: ${inGroup.map((q) => q.name).join(" + ")} <= 1`);
        });
      }

      if (req.kind === "distribution") {
        const used: string[] = [];
        req.areas.forEach((_, a) => {
          const inArea = mine.filter((q) => q.area === a);
          if (inArea.length === 0) return;
          const z = `z_${id}_${a}`;
          binaries.push(z);
          used.push(z);
          constraints.push(` area_${id}_${a}: ${sum(inArea)} <= ${req.maxPerArea}`);
          constraints.push(` used_${id}_${a}: ${sum(inArea)} - ${z} >= 0`);
        });
        constraints.push(` areas_${id}: ${[...used, `- ${req.minAreas} ${y(p, r)}`].join(" + ").replace("+ -", "-")} >= 0`);
      }

      if (req.kind === "concentration") {
        // Pick one department; only its courses count.
        const departments = [...new Set(mine.map((q) => q.department!))];
        const d = (dept: string) => `d_${id}_${dept}`;
        departments.forEach((dept) => {
          binaries.push(d(dept));
          mine
            .filter((q) => q.department === dept)
            .forEach((q, i) => constraints.push(` dept_${id}_${dept}_${i}: ${q.name} - ${d(dept)} <= 0`));
        });
        constraints.push(` onedept_${id}: ${departments.map(d).join(" + ")} <= 1`);
      }
    }),
  );

  const objective = [
    ...programs.flatMap((pr, p) => pr.requirements.map((_, r) => `1000 ${y(p, r)}`)),
    ...pairs.map((q) => `1 ${q.name}`),
    // A tie-break far below one course-use: among equally good assignments, prefer higher grades for a minGpa requirement.
    ...pairs.flatMap((q) => {
      const points = programs[q.p]!.minGpa === undefined && programs[q.p]!.requirements[q.r]!.minGpa === undefined ? undefined : gradePoints(courses[q.c]!.grade);
      return points === undefined || courses[q.c]!.status !== "completed" ? [] : [`${(points * 0.01).toFixed(4)} ${q.name}`];
    }),
    // Below a requirement (1000), above any course-use tie-break: never give up a requirement for it.
    ...uniqueGoal.map((u) => `500 ${u}`),
  ].join(" + ");
  const model = ["Maximize", ` obj: ${objective || "0 y_0_0"}`, "Subject To", ...constraints, "Binary", ` ${binaries.join(" ")}`, "End"];

  const highs = await getSolver();
  const solution = highs.solve(model.join("\n"), {
    output_flag: false,
    // The grade tie-break is far below the default relative gap on the 1000-point requirement terms.
    ...(programs.some((pr) => pr.minGpa !== undefined || pr.requirements.some((req) => req.minGpa !== undefined)) ? { mip_rel_gap: 0 } : {}),
  });
  if (solution.Status !== "Optimal") throw new Error(`Audit solver ended with status ${solution.Status}`);
  const chosen = (name: string) => (solution.Columns[name]?.Primal ?? 0) > 0.5;

  // GPA over the completed letter-graded courses in `assigned`, each course once. `failed`: below the
  // minimum with nothing planned (a planned course only flags it at risk).
  const gpaCheck = (assigned: Pair[], min: number): { gpa?: NonNullable<RequirementResult["gpa"]>; failed: boolean } => {
    const graded = [...new Set(assigned.filter((q) => courses[q.c]!.status === "completed" && gradePoints(courses[q.c]!.grade) !== undefined).map((q) => q.c))];
    const credits = graded.reduce((t, c) => t + courses[c]!.credits, 0);
    if (credits === 0) return { failed: false };
    const points = graded.reduce((t, c) => t + gradePoints(courses[c]!.grade)! * courses[c]!.credits, 0);
    const gpa: NonNullable<RequirementResult["gpa"]> = { value: Math.round((points / credits) * 100) / 100, min };
    if (gpa.value >= min) return { gpa, failed: false };
    if (assigned.some((q) => courses[q.c]!.status === "planned")) return { gpa: { ...gpa, atRisk: true }, failed: false };
    return { gpa, failed: true };
  };

  const confirmed = new Set(options.confirmed ?? []);
  const results = programs.map((program, p) => {
    const used = new Set<number>();
    const requirements = program.requirements.map((req, r): RequirementResult => {
      if (req.kind === "openSlot") {
        const ok = confirmed.has(slotKey(program.id, req.id));
        return { id: req.id, name: req.name, status: ok ? "satisfied" : "missing", assigned: [] };
      }
      const assigned = pairs.filter((q) => q.p === p && q.r === r && chosen(q.name));
      assigned.forEach((q) => used.add(q.c));
      const progress = assigned.reduce((t, q) => t + q.weight, 0);
      let satisfied = chosen(y(p, r)) && progress >= need(req);
      if (req.kind === "choose" && req.minCredits !== undefined && !req.credits && assigned.reduce((t, q) => t + genEdCredits(courses[q.c]!), 0) < req.minCredits) satisfied = false;
      const check = req.minGpa === undefined ? undefined : gpaCheck(assigned, req.minGpa);
      if (check?.failed) satisfied = false;
      const gpa = check?.gpa;
      const belowMinimum = belowMinimumFor(program, req, p, r, courses, assigned);
      return {
        id: req.id,
        name: req.name,
        status: satisfied ? "satisfied" : progress > 0 ? "partial" : "missing",
        assigned: assigned.map((q) => courses[q.c]!.id),
        ...(gpa ? { gpa } : {}),
        ...(belowMinimum.length > 0 ? { belowMinimum } : {}),
      };
    });
    if (program.minGpa !== undefined) {
      const assigned = pairs.filter((q) => q.p === p && chosen(q.name));
      const check = gpaCheck(assigned, program.minGpa);
      const gradedCourses = [...new Set(assigned.map((q) => q.c))].filter((c) => courses[c]!.status === "completed" && gradePoints(courses[c]!.grade) !== undefined);
      const min = program.minGpa;
      requirements.push({
        id: PROGRAM_GPA_ID,
        name: `Program GPA (at least ${Number.isInteger(min) ? min.toFixed(1) : min})`,
        status: check.failed ? "missing" : "satisfied",
        assigned: gradedCourses.map((c) => courses[c]!.id),
        ...(check.gpa ? { gpa: check.gpa } : {}),
      });
    }
    return { requirements, unused: courses.filter((_, c) => !used.has(c)).map((c) => c.id) };
  });

  if (degrees.length === 0) return { results };
  // Unique credits from the chosen assignment: used (not as an overlay) by the degree, by no other.
  const byDegree = degrees.map((group) => new Set(pairs.filter((q) => group.includes(q.p) && consumes(q) && chosen(q.name)).map((q) => q.c)));
  const uniqueCredits = byDegree.map((mine, g) =>
    [...mine].filter((c) => byDegree.every((other, h) => h === g || !other.has(c))).reduce((t, c) => t + courses[c]!.credits, 0),
  );
  return { results, uniqueCredits };
}

export async function auditProgram(program: Program, courses: StudentCourse[], options: AuditOptions = {}): Promise<AuditResult> {
  const [result] = await auditPrograms([program], courses, options);
  return result!;
}
