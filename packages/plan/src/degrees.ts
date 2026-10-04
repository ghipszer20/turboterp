// A Student's Degrees, each holding Programs (docs/project/feature-modules.md): "Gen Ed and
// university rules apply once; college rules apply per degree." Checks a Plan against all of them
// in one audit (so every program's Sharing Limits hold at once) and reports what a double major
// or double degree still needs, plus the declaration deadline. Solver-backed and async, like
// notices.ts: run it after edits settle.
//
//   Double major:  1 degree, 2 majors, 120 credits (the university layer checks the 120).
//   Double degree: 2 degrees, 150 credits, and 18 credits in each degree not used for the other.
//   Either one must be declared at least one full academic year before graduation.

import { auditStudent, earnsCredit, type AuditResult, type Program } from "@turboterp/audit";
import type { PlanCatalog } from "./catalog.ts";
import type { Plan } from "./check.ts";
import { DUAL_DEGREE_CREDITS, DUAL_DEGREE_UNIQUE_CREDITS, planCourses } from "./notices.ts";

export type ProgramStatus = "declared" | "planned" | "what-if" | "dropped";
export type ProgramKind = "major" | "minor" | "certificate" | "special";

/** A Program the student holds in one Degree. Its catalog year is the Program's own. */
export type DegreeProgram = { program: Program; kind: ProgramKind; status: ProgramStatus };

/** One Degree: its programs and its college's rules (a Requirement Layer applied per degree). */
export type Degree = { programs: DegreeProgram[]; collegeRules?: Program[] };

export type DegreeMode = "single" | "double-major" | "double-degree";

export const SINGLE_DEGREE_CREDITS = 120;
/** Days before the declaration deadline when its note becomes a warning. The owner may change it. */
export const DECLARE_WARNING_DAYS = 180;

export type DegreeIssue = {
  kind: "double-degree-credits" | "double-degree-unique" | "declaration-deadline";
  severity: "error" | "warning" | "info";
  programs: string[];
  message: string;
};

export type DegreeAudit = {
  program: Program;
  /** Index of the degree it belongs to; null for a layer every degree shares (Gen Ed, university). */
  degree: number | null;
  result: AuditResult;
};

export type DegreeCheck = {
  mode: DegreeMode;
  totalCredits: number;
  minimumCredits: number;
  /** Double degree only: per degree, credits its programs use that the other degree doesn't. */
  uniqueCredits?: number[];
  audits: DegreeAudit[];
  issues: DegreeIssue[];
};

const active = (d: Degree) => d.programs.filter((p) => p.status !== "dropped");
/** A degree's majors, or all its programs if it has none (what names the degree). */
const degreeMajors = (d: Degree) => {
  const majors = active(d).filter((p) => p.kind === "major");
  return majors.length > 0 ? majors : active(d);
};

export function degreeMode(degrees: Degree[]): DegreeMode {
  const live = degrees.filter((d) => active(d).length > 0);
  if (live.length >= 2) return "double-degree";
  return (live[0] ? active(live[0]).filter((p) => p.kind === "major").length : 0) >= 2 ? "double-major" : "single";
}

const SEASON_END: Record<string, string> = { Winter: "01-31", Spring: "05-31", Summer: "08-31", Fall: "12-31" };

/** One full academic year before the plan's last term: the same season, a year earlier. */
export function declarationDeadline(plan: Plan): { term: string; graduation: string; date: string } | null {
  const graduation = plan.terms.at(-1)?.name.trim() ?? "";
  const m = /^(Winter|Spring|Summer|Fall)\s+(\d{4})$/.exec(graduation);
  if (!m) return null;
  const year = Number(m[2]) - 1;
  return { term: `${m[1]} ${year}`, graduation, date: `${year}-${SEASON_END[m[1]!]}` };
}

/** "A", "A and B", "A, B and C" */
const listing = (items: string[]) => (items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`);

export async function checkDegrees(
  plan: Plan,
  catalog: PlanCatalog,
  degrees: Degree[],
  layers: Program[],
  options: { today?: Date; confirmed?: string[] } = {},
): Promise<DegreeCheck> {
  const mode = degreeMode(degrees);
  const courses = planCourses(plan, catalog);
  const totalCredits = courses.filter(earnsCredit).reduce((t, c) => t + c.credits, 0);

  // Layers once (no degree), then each degree's programs and its own college rules.
  const entries: { program: Program; degree: number | null }[] = layers.map((program) => ({ program, degree: null }));
  degrees.forEach((d, g) => {
    for (const p of active(d)) entries.push({ program: p.program, degree: g });
    for (const rules of d.collegeRules ?? []) entries.push({ program: rules, degree: g });
  });
  const groups = degrees.map((_, g) => entries.flatMap((e, i) => (e.degree === g ? [i] : [])));
  const double = mode === "double-degree";
  const { results, uniqueCredits } = await auditStudent(
    entries.map((e) => e.program),
    courses,
    {
      ...(double ? { degrees: groups, minUniqueCredits: DUAL_DEGREE_UNIQUE_CREDITS } : {}),
      ...(options.confirmed ? { confirmed: options.confirmed } : {}),
    },
  );
  const audits = entries.map((e, i) => ({ ...e, result: results[i]! }));

  const issues: DegreeIssue[] = [];
  const majors = degrees.flatMap((d) => active(d).filter((p) => p.kind === "major"));
  const majorIds = majors.map((p) => p.program.id);

  if (double) {
    if (totalCredits < DUAL_DEGREE_CREDITS) {
      issues.push({
        kind: "double-degree-credits",
        severity: "error",
        programs: majorIds,
        message: `A double degree needs at least ${DUAL_DEGREE_CREDITS} credits. Your plan has ${totalCredits}: add ${DUAL_DEGREE_CREDITS - totalCredits} more.`,
      });
    }
    const short = degrees.flatMap((d, g) => (uniqueCredits![g]! < DUAL_DEGREE_UNIQUE_CREDITS && active(d).length > 0 ? [{ d, n: uniqueCredits![g]! }] : []));
    if (short.length > 0) {
      const text = short.map(({ d, n }) => `${listing(degreeMajors(d).map((p) => `the ${p.program.name}`))} degree has ${n}`).join("; ");
      issues.push({
        kind: "double-degree-unique",
        severity: "error",
        programs: short.flatMap(({ d }) => degreeMajors(d).map((p) => p.program.id)),
        message: `A double degree needs at least ${DUAL_DEGREE_UNIQUE_CREDITS} credits in each degree that don't count toward the other. ${text.charAt(0).toUpperCase()}${text.slice(1)}.`,
      });
    }
  }

  const deadline = declarationDeadline(plan);
  if (mode !== "single" && deadline && majors.some((p) => p.status !== "declared")) {
    const what = mode === "double-major" ? "double major" : "double degree";
    const daysLeft = options.today ? (Date.parse(`${deadline.date}T23:59:59`) - options.today.getTime()) / 86_400_000 : Infinity;
    issues.push(
      daysLeft < 0
        ? {
            kind: "declaration-deadline",
            severity: "error",
            programs: majorIds,
            message: `The deadline to declare your ${what} (end of ${deadline.term}) has passed for a ${deadline.graduation} graduation. Talk to your advisor.`,
          }
        : {
            kind: "declaration-deadline",
            severity: daysLeft <= DECLARE_WARNING_DAYS ? "warning" : "info",
            programs: majorIds,
            message: `Declare your ${what} by the end of ${deadline.term}: it has to be declared at least one full academic year before you graduate (${deadline.graduation}).`,
          },
    );
  }

  return {
    mode,
    totalCredits,
    minimumCredits: double ? DUAL_DEGREE_CREDITS : SINGLE_DEGREE_CREDITS,
    ...(double ? { uniqueCredits: uniqueCredits! } : {}),
    audits,
    issues,
  };
}
