// The 4-year plan export's data (header + plan grid only), built once from what the Advisor already
// computed and rendered as .xlsx (xlsx.ts) or PDF (pdf.ts). Pure: no solver runs here.

import type { Analysis } from "../analysis";
import type { AdvisorPlan } from "../plan-state";
import { sortTerms } from "../terms";

export const DISCLAIMER = "Unofficial, not affiliated with UMD, verify with your advisor";
export const FOOTER = "Unofficial. Not affiliated with the University of Maryland. Verify with your advisor and UMD's official degree audit.";

export type Category = "major" | "minor" | "gen-ed" | "other" | "elective";
export const CATEGORY_LABELS: Record<Category, string> = {
  major: "Major",
  minor: "Minor",
  "gen-ed": "Gen Ed",
  other: "Other program",
  elective: "Elective (not assigned)",
};
/** One pastel per category (hex, no #). */
export const CATEGORY_COLORS: Record<Category, string> = {
  major: "CFE2FF",
  minor: "D9F2D0",
  "gen-ed": "FFF0BF",
  other: "E8DAF5",
  elective: "EDEDED",
};
const RANK: Category[] = ["major", "minor", "gen-ed", "other", "elective"];

type CatalogLike = ReadonlyMap<string, { title: string; credits: { min: number } }>;

export type PlanExportInput = {
  plan: Pick<AdvisorPlan, "terms">;
  /** Only the audits are used, to color each course by the kind of program that assigned it. */
  analysis: Pick<Analysis, "audits">;
  catalog?: CatalogLike;
  /** Program id -> kind, from the registry; anything not listed and not a Requirement Layer counts as "other". */
  programKinds?: Record<string, string>;
  name?: string;
  today: Date;
  hideGrades?: boolean;
  /** Shown on the PDF's first line, e.g. "Computer Science"; the Advisor's own programsLabel. */
  programsLabel?: string;
  /** e.g. "2026-27". */
  catalogYear?: string;
  /** Credits earned before the plan (AP/IB/transfer), for the "(N from prior credit)" note. */
  priorCreditCredits?: number;
  /** Formatted key dates by term name (see lib/calendar formatKeyDates). */
  keyDates?: Record<string, string>;
};

export type PlanExportCourse = { id: string; title: string; credits: number; grade: string; category: Category };

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const layerOf = (p: unknown) => (p as { layer?: string }).layer;

/** Category per course: the best-ranked kind of program that assigned it. Courses no audit assigned are absent. */
export function courseCategories(analysis: Pick<Analysis, "audits">, programKinds?: Record<string, string>): Map<string, Category> {
  const best = new Map<string, Category>();
  for (const a of analysis.audits) {
    const layer = layerOf(a.program);
    const kind = programKinds?.[a.program.id];
    const cat: Category = layer === "gen-ed" ? "gen-ed" : layer ? "other" : kind === "major" ? "major" : kind === "minor" ? "minor" : "other";
    for (const r of a.requirements) {
      for (const id of r.result.assigned) {
        const prev = best.get(id);
        if (!prev || RANK.indexOf(cat) < RANK.indexOf(prev)) best.set(id, cat);
      }
    }
  }
  return best;
}

export function buildPlanExport(input: PlanExportInput) {
  const { plan, catalog, hideGrades } = input;

  const best = courseCategories(input.analysis, input.programKinds);

  const order = sortTerms(plan.terms.map((t) => t.name));
  const terms = order.map((name) => {
    const t = plan.terms.find((x) => x.name === name)!;
    const courses: PlanExportCourse[] = t.courses.map((c) => ({
      id: c.id,
      title: catalog?.get(c.id)?.title ?? "",
      credits: c.credits ?? catalog?.get(c.id)?.credits.min ?? 0,
      grade: hideGrades ? "" : (c.grade ?? ""),
      category: best.get(c.id) ?? "elective",
    }));
    const keyDates = input.keyDates?.[name];
    return { name, courses, credits: courses.reduce((s, c) => s + c.credits, 0), ...(keyDates ? { keyDates } : {}) };
  });

  return {
    header: { name: input.name ?? "", date: iso(input.today), disclaimer: DISCLAIMER, gradesHidden: !!hideGrades },
    programsLabel: input.programsLabel ?? "",
    catalogYear: (input.catalogYear ?? "").replace("-", "\u2013"),
    creditsPlanned: terms.reduce((s, t) => s + t.credits, 0),
    priorCreditCredits: input.priorCreditCredits ?? 0,
    terms,
  };
}

export type PlanExport = ReturnType<typeof buildPlanExport>;

/** The download's file name, dated by the export's header date. */
export const exportFileName = (kind: "xlsx" | "pdf", date: string) => `turboterp-4-year-plan-${date}.${kind}`;
