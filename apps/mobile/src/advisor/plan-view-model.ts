// Turns the stored plan + checker output into what the plan grid renders: one section per term,
// grouped by academic year. Pure (no React Native), so it is unit-tested in Node.
import type { PlanIssue } from "@turboterp/plan/check";
import { isGraduateCourse } from "@turboterp/plan/grad-courses";
import { cardNote, courseKey, SEVERITY, type IssueGroups, type Severity } from "@turboterp/app-core/issues";
import type { AdvisorPlan } from "@turboterp/app-core/plan-state";
import type { RowCategory } from "@turboterp/app-core/row-category";
import { academicYears, parseTerm } from "@turboterp/app-core/terms";

export type CourseRow = {
  id: string;
  title: string;
  /** null when neither the plan nor the catalog knows the credits. */
  credits: number | null;
  category: RowCategory;
  severity: Severity | null;
  /** The one-line note for the course's worst issue, or null. */
  note: string | null;
  grad: boolean;
  completed: boolean;
};

export type TermSection = {
  name: string;
  /** Winter and summer can be removed; fall and spring are the plan's backbone. */
  optional: boolean;
  credits: number;
  /** Some course's credits are unknown, so `credits` is a lower bound ("12+"). */
  creditsApprox: boolean;
  /** Errors and warnings for the whole term (credit load), in plain language. */
  issues: { severity: Severity; label: string; message: string }[];
  difficulty: { score: number; sentence: string } | null;
  courses: CourseRow[];
};

export type YearSection = { number: number; label: string; terms: TermSection[] };

export type PlanViewModel = {
  years: YearSection[];
  totalCredits: number;
  /** "1 to fix", "2 to check": empty when the plan has none. */
  countLabels: { severity: "error" | "warning"; text: string }[];
};

export type PlanViewInput = {
  plan: AdvisorPlan;
  /** The catalog's title and minimum credits for a course, if the catalog is loaded and has it. */
  lookup: (id: string) => { title: string; credits: number } | null;
  groups: IssueGroups | null;
  categoryOf: (id: string) => RowCategory;
  difficulty?: ReadonlyMap<string, { score: number; sentence: string }>;
};

export function buildPlanView(input: PlanViewInput): PlanViewModel {
  const { plan, lookup, groups, categoryOf, difficulty } = input;
  const byName = new Map(plan.terms.map((t) => [t.name, t]));
  let totalCredits = 0;

  const section = (name: string): TermSection => {
    const term = byName.get(name)!;
    const season = parseTerm(name)?.season;
    let credits = 0;
    let creditsApprox = false;
    const courses: CourseRow[] = term.courses.map((c) => {
      const info = lookup(c.id);
      const cr = c.credits ?? info?.credits ?? null;
      if (cr === null) creditsApprox = true;
      else credits += cr;
      const issues = groups?.byCourse.get(courseKey(name, c.id)) ?? [];
      return {
        id: c.id,
        title: info?.title ?? "",
        credits: cr,
        category: categoryOf(c.id),
        severity: groups?.worstByCourse.get(courseKey(name, c.id)) ?? null,
        note: issues.length ? cardNote(issues) : null,
        grad: isGraduateCourse(c.id),
        completed: c.status === "completed",
      };
    });
    totalCredits += credits;
    // Info (a light term) is a tip, not a banner on every term.
    const termIssues = (groups?.byTerm.get(name) ?? []).filter((i: PlanIssue) => i.severity !== "info");
    return {
      name,
      optional: season === "Winter" || season === "Summer",
      credits,
      creditsApprox,
      issues: termIssues.map((i) => ({ severity: i.severity, label: SEVERITY[i.severity].label, message: i.message })),
      difficulty: difficulty?.get(name) ?? null,
      courses,
    };
  };

  const years = academicYears(plan.terms.map((t) => t.name)).map((y, i) => ({
    number: i + 1,
    label: y.label,
    terms: y.terms.map(section),
  }));
  const countLabels = (["error", "warning"] as const)
    .filter((s) => (groups?.counts[s] ?? 0) > 0)
    .map((s) => ({ severity: s, text: SEVERITY[s].plural(groups!.counts[s]) }));
  return { years, totalCredits, countLabels };
}

/** The term a "+ Add term" button adds after the last one (Fall -> Spring next year, else next Fall). */
export function nextMainTerm(last: string): string {
  const t = parseTerm(last)!;
  return t.season === "Fall" ? `Spring ${t.year + 1}` : `Fall ${t.year}`;
}

/** Terms a course can move to: every other term, in plan order. */
export const moveTargets = (plan: AdvisorPlan, from: string): string[] => plan.terms.map((t) => t.name).filter((n) => n !== from);

/** Pastel background and text color for each course category (the web's --cat-* variables). */
export const CATEGORY_COLORS: Record<"light" | "dark", Record<RowCategory, { bg: string; fg: string }>> = {
  light: {
    major: { bg: "#ffe1e6", fg: "#8a0a24" },
    gened: { bg: "#dcecff", fg: "#0b4a8f" },
    college: { bg: "#e3f5e1", fg: "#1f6b2a" },
    elective: { bg: "#fff0d1", fg: "#7a4a00" },
    other: { bg: "#efe7ff", fg: "#5b21b6" },
  },
  dark: {
    major: { bg: "#4a1522", fg: "#ffc2cf" },
    gened: { bg: "#10304f", fg: "#b9d9ff" },
    college: { bg: "#173a1c", fg: "#bfe8b8" },
    elective: { bg: "#3f2e0b", fg: "#ffd98a" },
    other: { bg: "#2b1f47", fg: "#d6c6ff" },
  },
};

export const CATEGORY_LABELS: Record<RowCategory, string> = {
  major: "Major",
  gened: "Gen Ed",
  college: "College",
  elective: "Elective",
  other: "Minor / other program",
};
