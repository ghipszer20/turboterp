// Good news about a Plan, never warnings: it completes a second major (a double major), it
// qualifies for a dual degree, or it comes within a course or two of another major.
// Runs the degree audit (@turboterp/audit, an integer program), so it's async and slower than
// checkPlan; run it after edits settle, not on every keystroke.

import { auditPrograms, earnsCredit, matchesFilter, type AuditResult, type Program, type StudentCourse } from "@turboterp/audit";
import { allowsRetake } from "./check.ts";
import type { CatalogCourse, PlanCatalog } from "./catalog.ts";
import type { Plan } from "./check.ts";
import { allTwins, twinIndex } from "./twins.ts";

/** Double Degree minimums (CONTEXT.md; docs/project/feature-modules.md). */
export const DUAL_DEGREE_CREDITS = 150;
export const DUAL_DEGREE_UNIQUE_CREDITS = 18;
/** "Close" to another major: at most this many courses short. The owner may change it. */
export const CLOSE_COURSES = 2;

/**
 * A major to test the plan against: one the student declared, or a candidate the app suggests
 * (the app passes Verified Programs only). Each candidate is treated as its own degree for the
 * dual-degree check.
 */
export type ProgramCandidate = { program: Program; declared: boolean };

export type ProgramNotice =
  | {
      kind: "double-major";
      severity: "info";
      /** The student's (first declared) major, then the other one. */
      programs: string[];
      /** Whether the second major is already declared. */
      declared: boolean;
      message: string;
    }
  | {
      kind: "dual-degree";
      severity: "info";
      programs: string[];
      eligible: boolean;
      totalCredits: number;
      /** Credits still needed to reach DUAL_DEGREE_CREDITS (0 when there). */
      creditsShort: number;
      /** Per program id: credits counted toward that degree and not toward the other. */
      uniqueCredits: Record<string, number>;
      message: string;
    }
  | {
      kind: "close-to-major";
      severity: "info";
      programs: string[];
      coursesShort: number;
      /** What's still needed: course ids ("CMSC131 or CMSC141") or requirement names. */
      missing: string[];
      message: string;
    };

/**
 * The plan's courses as the audit sees them: prior credit and completed courses as completed,
 * the rest planned. A course counts once, however many times it appears -- except a legitimate
 * retake (owner ruling: a course may appear twice in a plan only after a failed or withdrawn
 * attempt), which keeps both occurrences, so the audit can assign a passing retake and leave the
 * failed or withdrawn attempt unused rather than have it silently win by appearing first.
 */
export function planCourses(plan: Plan, catalog: PlanCatalog): StudentCourse[] {
  const courses: StudentCourse[] = [];
  const seen = new Set<string>();
  const retakable = new Set<string>();
  // UMD grants credit for only one of a set of Twins: a later Twin of a course already counted is
  // left out, unless the earlier one was a completed F or W attempt (the same exception as a retake).
  const twinsOf = twinIndex(catalog);
  const twinCounted = (id: string) => allTwins(twinsOf(id)).some((t) => seen.has(t) && !retakable.has(t));

  for (const c of plan.priorCredit ?? []) {
    if (seen.has(c.id) || twinCounted(c.id)) continue; // Prior credit is never a retake of an earlier attempt here.
    seen.add(c.id);
    courses.push({
      id: c.id,
      credits: c.credits,
      status: "completed",
      ...(c.grade ? { grade: c.grade } : {}),
      // Without a term to pair a lab in, a lab-science lecture's DSNL can't be confirmed, so it's dropped.
      genEd: c.genEd ?? withoutUnpairedLab(catalog.get(c.id)),
      ...(c.genEdCredits !== undefined ? { genEdCredits: c.genEdCredits } : {}),
      // AP and IB credit (source labels from @turboterp/credit); dual enrollment isn't exam credit.
      ...(/^(AP|IB) /.test(c.source ?? "") ? { exam: true as const } : {}),
    });
  }
  for (const term of plan.terms) {
    for (const c of term.courses) {
      if (seen.has(c.id) && !retakable.has(c.id)) continue;
      if (!seen.has(c.id) && twinCounted(c.id)) continue;
      retakable.delete(c.id);
      seen.add(c.id);
      // Graduate-only credit (grad-courses.ts) is master's credit only: it never counts toward
      // the undergrad degree, so it's left out of the audit's course list entirely (not just its
      // credits) -- it can't satisfy a program requirement either.
      if (c.gradTag === "graduate-only") continue;
      const info = catalog.get(c.id);
      courses.push({
        id: c.id,
        credits: c.credits ?? info?.credits.min ?? 0,
        status: c.status === "completed" ? "completed" : "planned",
        ...(c.grade ? { grade: c.grade } : {}),
        ...labScience(info, term, catalog),
      });
      if (allowsRetake(c)) retakable.add(c.id);
    }
  }
  return courses;
}

/** A catalog course's Gen Ed codes without DSNL, when Testudo makes DSNL depend on a lab ("DSNL (if taken with CHEM132)"). */
function withoutUnpairedLab(info: CatalogCourse | undefined): string[] {
  const genEd = info?.genEd ?? [];
  return info?.labPair ? genEd.filter((g) => g !== info.labPair!.code) : genEd;
}

/**
 * The genEd (and genEdCredits) of a course taken in a term. A lab-science lecture keeps DSNL only
 * when its paired lab is on record in the same term ("only when taken concurrently"), and then
 * brings the lab's credits too. The lab course itself carries no Gen Ed codes.
 */
function labScience(info: CatalogCourse | undefined, term: Plan["terms"][number], catalog: PlanCatalog): Pick<StudentCourse, "genEd" | "genEdCredits"> {
  if (!info) return { genEd: [] };
  const pair = info.labPair;
  if (!pair) {
    for (const other of catalog.values()) if (other.labPair?.with === info.id) return { genEd: [] };
    return { genEd: info.genEd };
  }
  // A withdrawn or failed lab doesn't make the pair (earnsCredit: F and W earn nothing).
  const lab = term.courses.find(
    (x) => x.id === pair.with && x.gradTag !== "graduate-only" && earnsCredit({ status: x.status === "completed" ? "completed" : "planned", ...(x.grade ? { grade: x.grade } : {}) }),
  );
  if (!lab) return { genEd: withoutUnpairedLab(info) };
  const own = term.courses.find((x) => x.id === info.id)?.credits ?? info.credits.min;
  const labCredits = lab.credits ?? catalog.get(lab.id)?.credits.min ?? 0;
  return { genEd: info.genEd, genEdCredits: own + labCredits };
}

const complete = (result: AuditResult) => result.requirements.every((r) => r.status === "satisfied");

/** "A", "A and B", "A, B and C" */
function listing(items: string[]): string {
  return items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/** "the Computer Science Major" */
const the = (program: Program) => `the ${program.name}`;

/** ": by the end of Spring 2029, since your plan ends in Spring 2030" (one full academic year earlier). */
function declareBy(plan: Plan): string {
  const last = plan.terms.at(-1)?.name.trim() ?? "";
  const m = /^(\w+)\s+(\d{4})$/.exec(last);
  if (!m) return "";
  return `: by the end of ${m[1]} ${Number(m[2]) - 1}, since your plan ends in ${last}`;
}

/**
 * How many courses a program's unmet requirements still need, and what to call them. A
 * requirement counted in credits is converted at 3 credits a course. Overlay requirements (which
 * reuse courses from other requirements) count only when they need more than the rest together.
 */
export function shortfall(program: Program, result: AuditResult, courses: StudentCourse[]): { count: number; missing: string[] } {
  const credits = new Map(courses.map((c) => [c.id, c.credits]));
  // A failed/withdrawn attempt earns no credit, so it doesn't count as "have" a fixed course or as
  // one of the courses filling an "any N from a filter" member.
  const have = new Set(courses.filter(earnsCredit).map((c) => c.id));
  let own = 0;
  let overlay = 0;
  const missing: string[] = [];
  program.requirements.forEach((req, i) => {
    const r = result.requirements[i]!;
    if (r.status === "satisfied") return;
    const assignedCredits = r.assigned.reduce((t, id) => t + (credits.get(id) ?? 0), 0);
    let n = 1;
    let names: string[] | null = null;
    if (req.kind === "course") names = [req.options.length <= 2 ? req.options.join(" or ") : req.name];
    else if (req.kind === "choose") {
      n = req.count !== undefined ? req.count - r.assigned.length : Math.ceil(((req.credits ?? 0) - assignedCredits) / 3);
    } else if (req.kind === "distribution") n = req.count - r.assigned.length;
    else if (req.kind === "concentration") n = Math.ceil((req.credits - assignedCredits) / 3);
    else if (req.kind === "openSlot") names = [`${req.name} (confirm with your advisor)`];
    else {
      // Each set's gap: its fixed courses not yet taken, plus what each "any N from a filter"
      // member still needs after the student's other matching courses. The requirement needs its
      // `count` (default 1) smallest gaps.
      const gaps = req.options.map((set) => {
        const fixed = new Set(set.filter((m): m is string => typeof m === "string"));
        const gap = { names: [...fixed].filter((id) => !have.has(id)), size: 0 };
        gap.size = gap.names.length;
        for (const m of set) {
          if (typeof m === "string") continue;
          const matching = courses.filter((c) => !fixed.has(c.id) && earnsCredit(c) && matchesFilter(m.from, c)).length;
          const short = Math.max(0, m.count - matching);
          if (short > 0) {
            gap.names.push(`${short} more for ${req.name}`);
            gap.size += short;
          }
        }
        return gap;
      });
      const needed = [...gaps].sort((a, b) => a.size - b.size).slice(0, req.count ?? 1);
      names = needed.flatMap((g) => g.names);
      n = needed.reduce((t, g) => t + g.size, 0);
    }
    n = Math.max(1, n);
    if (req.overlay) overlay = Math.max(overlay, n);
    else {
      own += n;
      missing.push(...(names ?? [n > 1 ? `${n} more for ${req.name}` : req.name]));
    }
  });
  return { count: Math.max(own, overlay), missing };
}

/**
 * Credits each of two programs uses that the other doesn't. Left alone, the audit shares
 * courses whenever it can, which would undercount; so this finds the fewest shared courses that
 * still complete both programs and counts from that assignment. Overlay requirements still
 * reuse courses freely, so the result can undercount a little, never overcount.
 */
async function uniqueCredits(a: Program, b: Program, courses: StudentCourse[], sharedAtMost: number): Promise<[number, number]> {
  const credits = new Map(courses.map((c) => [c.id, c.credits]));
  const used = (r: AuditResult) => new Set(r.requirements.flatMap((q) => q.assigned));
  const only = (x: Set<string>, y: Set<string>) => [...x].filter((id) => !y.has(id)).reduce((t, id) => t + (credits.get(id) ?? 0), 0);
  for (let k = 0; k <= sharedAtMost; k++) {
    const [ra, rb] = await auditPrograms([a, b], courses, { maxSharedCourses: k });
    if (!complete(ra!) || !complete(rb!)) continue;
    const ua = used(ra!);
    const ub = used(rb!);
    return [only(ua, ub), only(ub, ua)];
  }
  return [0, 0];
}

/**
 * The student's chosen mode for two or more declared majors (double major or double degree; see
 * degreeModeOf in the Advisor). Only affects notices about a pair of declared (chosen) majors --
 * an undeclared candidate's notices never change. Omit it (or pass null/undefined) to keep the
 * double-major behavior below, which is also right when the student hasn't chosen yet.
 */
export type ChosenDegreeMode = "double-major" | "double-degree";

/**
 * Info-level notices about the plan and the given majors (the student's declared ones plus
 * candidates to test). Uses completed, planned and prior-credit courses.
 */
export async function programNotices(
  plan: Plan,
  catalog: PlanCatalog,
  candidates: ProgramCandidate[],
  mode?: ChosenDegreeMode | null,
): Promise<ProgramNotice[]> {
  if (candidates.length === 0) return [];
  const courses = planCourses(plan, catalog);
  const results = await auditPrograms(
    candidates.map((c) => c.program),
    courses,
  );
  const done = results.map(complete);
  const notices: ProgramNotice[] = [];

  // Double major: every other completed major, next to the student's (first declared) one.
  const primary = Math.max(0, candidates.findIndex((c) => c.declared));
  const main = candidates[primary]!.program;
  candidates.forEach((other, i) => {
    if (i === primary || !done[i]) return;
    const programs = [main.id, other.program.id];
    if (!other.declared) {
      notices.push({
        kind: "double-major",
        severity: "info",
        programs,
        declared: false,
        message: `Your plan also completes ${the(other.program)}. You're eligible to declare it as a double major. A double major has to be declared at least one full academic year before you graduate${declareBy(plan)}.`,
      });
    } else if (done[primary] && mode !== "double-degree") {
      // The student chose double degree for this pair: that's a stronger claim than "a double
      // major", and checkDegrees (degrees.ts) already reports the real double-degree result, so
      // don't also claim "a double major" here.
      notices.push({
        kind: "double-major",
        severity: "info",
        programs,
        declared: true,
        message: `Your plan completes both ${the(main)} and ${the(other.program)}: a double major.`,
      });
    }
  });

  // Dual degree: any two completed majors, as two degrees. A failed/withdrawn attempt earns no
  // credit, so it never counts toward the 150-credit total.
  const totalCredits = courses.filter(earnsCredit).reduce((t, c) => t + c.credits, 0);
  const creditsShort = Math.max(0, DUAL_DEGREE_CREDITS - totalCredits);
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      if (!done[i] || !done[j]) continue;
      // The student already chose double degree for this pair (both declared): checkDegrees owns
      // the real result there (a different, degree-grouped solve with the 18-unique goal), and its
      // own "eligible" can disagree with this pairwise solve. Say nothing here rather than risk a
      // duplicate or contradicting notice; this also skips uniqueCredits' HiGHS runs for the pair.
      if (mode === "double-degree" && candidates[i]!.declared && candidates[j]!.declared) continue;
      const a = candidates[i]!.program;
      const b = candidates[j]!.program;
      const usedByB = new Set(results[j]!.requirements.flatMap((r) => r.assigned));
      const shared = new Set(results[i]!.requirements.flatMap((r) => r.assigned).filter((id) => usedByB.has(id)));
      const [ua, ub] = await uniqueCredits(a, b, courses, shared.size);
      const uniqueShort = [
        ...(ua < DUAL_DEGREE_UNIQUE_CREDITS ? [`${the(a)} has only ${ua}`] : []),
        ...(ub < DUAL_DEGREE_UNIQUE_CREDITS ? [`${the(b)} has only ${ub}`] : []),
      ];
      const eligible = creditsShort === 0 && uniqueShort.length === 0;
      const needs = [
        ...(creditsShort > 0 ? [`${DUAL_DEGREE_CREDITS} credits in all: ${creditsShort} more credits to reach ${DUAL_DEGREE_CREDITS}`] : []),
        ...(uniqueShort.length > 0
          ? [`${DUAL_DEGREE_UNIQUE_CREDITS} credits in each degree that don't count toward the other (${listing(uniqueShort)})`]
          : []),
      ];
      notices.push({
        kind: "dual-degree",
        severity: "info",
        programs: [a.id, b.id],
        eligible,
        totalCredits,
        creditsShort,
        uniqueCredits: { [a.id]: ua, [b.id]: ub },
        message: eligible
          ? `Your plan qualifies for a dual degree (two degrees) in ${the(a)} and ${the(b)}: ${totalCredits} credits in all, and at least ${DUAL_DEGREE_UNIQUE_CREDITS} credits in each degree that don't count toward the other. A dual degree has to be declared at least one full academic year before you graduate${declareBy(plan)}.`
          : `Your plan completes both ${the(a)} and ${the(b)}. A dual degree (two degrees) also needs ${needs.join("; and ")}.`,
      });
    }
  }

  // Close: an undeclared major within CLOSE_COURSES courses.
  candidates.forEach((c, i) => {
    if (c.declared || done[i]) return;
    const { count, missing } = shortfall(c.program, results[i]!, courses);
    if (count > CLOSE_COURSES) return;
    notices.push({
      kind: "close-to-major",
      severity: "info",
      programs: [c.program.id],
      coursesShort: count,
      missing,
      message: `You're ${count} course${count === 1 ? "" : "s"} from ${the(c.program)}: ${listing(missing)}.`,
    });
  });
  return notices;
}
