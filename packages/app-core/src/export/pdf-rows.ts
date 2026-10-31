// The PDF's rows, derived from the plan export: pure, so the layout can be tested without jsPDF.

import { academicYears } from "../terms";
import type { PlanExport } from "./plan-export";

/** The dot categories on the PDF; minor and other programs share one purple dot. */
export type PdfCategory = "major" | "gen-ed" | "college" | "elective" | "other";
export const PDF_CATEGORY_ORDER: PdfCategory[] = ["major", "gen-ed", "college", "elective", "other"];
export const PDF_CATEGORY_LABELS: Record<PdfCategory, string> = {
  major: "Major",
  "gen-ed": "Gen Ed",
  college: "College",
  elective: "Elective",
  other: "Minor / other program",
};
export const PDF_CATEGORY_COLORS: Record<PdfCategory, string> = {
  major: "BA0C2F",
  "gen-ed": "0B63C7",
  college: "1F8A4C",
  elective: "B08500",
  other: "6D28D9",
};

export const TITLE_MAX = 46;
export const cutTitle = (title: string) => (title.length > TITLE_MAX ? title.slice(0, TITLE_MAX) + "…" : title);

export type PdfRow = { code: string; title: string; credits: number; grade: string; category: PdfCategory };
export type PdfTerm = { name: string; rows: PdfRow[]; total: number; keyDates?: string };
export type PdfYear = { label: string; academicYear: string; credits: number; terms: PdfTerm[] };

export function pdfRows(t: PlanExport): { years: PdfYear[]; legend: PdfCategory[] } {
  const byName = new Map(t.terms.map((x) => [x.name, x]));
  const present = new Set<PdfCategory>();
  const years = academicYears(t.terms.map((x) => x.name)).map((yr, i): PdfYear => {
    const terms = yr.terms.map((name): PdfTerm => {
      const term = byName.get(name)!;
      const rows = term.courses.map((c): PdfRow => {
        const category: PdfCategory = c.category === "minor" ? "other" : c.category;
        present.add(category);
        return { code: c.id, title: cutTitle(c.title), credits: c.credits, grade: t.header.gradesHidden ? "" : c.grade, category };
      });
      const keyDates = (term as { keyDates?: string }).keyDates;
      return { name, rows, total: rows.reduce((s, r) => s + r.credits, 0), ...(keyDates ? { keyDates } : {}) };
    });
    return { label: `Year ${i + 1}`, academicYear: yr.label, credits: terms.reduce((s, x) => s + x.total, 0), terms };
  });
  return { years, legend: PDF_CATEGORY_ORDER.filter((c) => present.has(c)) };
}
