// Which fill a course row in the Advisor plan gets, from the audits already computed (no solver here).
// Reuses the export's course -> category logic so the screen and the exported plan agree.

import type { Analysis } from "./analysis";
import { courseCategories } from "./export/plan-export";

export type RowCategory = "major" | "gened" | "college" | "elective" | "other";
const ORDER: RowCategory[] = ["major", "gened", "college", "elective", "other"];

export function rowCategory(courseId: string, analysis: Pick<Analysis, "audits">, programKinds?: Record<string, string>): RowCategory {
  const cat = courseCategories(analysis, programKinds).get(courseId);
  if (cat === "major") return "major";
  if (cat === "gen-ed") return "gened";
  if (cat === "other") {
    const inCollege = analysis.audits.some(
      (a) => (a.program as { layer?: string }).layer === "college" && a.requirements.some((r) => r.result.assigned.includes(courseId)),
    );
    if (inCollege) return "college";
  }
  return "other";
}

/** The present categories, in the fixed legend order. */
export function legendCategories(categories: RowCategory[]): RowCategory[] {
  const have = new Set(categories);
  return ORDER.filter((c) => have.has(c));
}
