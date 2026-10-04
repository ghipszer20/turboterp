// The 4-year plan as a formatted .xlsx (terms as columns, category colors) that opens in Google
// Sheets. ExcelJS is lazy-loaded: it must never be imported at top level.

import { academicYears } from "../terms";
import { CATEGORY_COLORS, CATEGORY_LABELS, type Category, type PlanExport } from "./plan-export";

const fillOf = (hex: string) => ({ type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: `FF${hex}` } });

/** Returns the workbook bytes. */
export async function buildXlsx(t: PlanExport): Promise<ArrayBuffer> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "TurboTerp";
  const ws = wb.addWorksheet("Plan");

  const bold = { bold: true };
  ws.addRow(["TurboTerp 4-year plan"]).font = { bold: true, size: 14 };
  if (t.header.name) ws.addRow(["Name", t.header.name]);
  ws.addRow(["Date", t.header.date]);
  ws.addRow([t.header.disclaimer]).font = { italic: true };
  ws.addRow([]);

  const years = academicYears(t.terms.map((x) => x.name));
  const cols = years.flatMap((y) => y.terms.map((term) => ({ year: y.label, term })));
  const yearRow = ws.addRow(cols.map((c) => c.year));
  const termRow = ws.addRow(cols.map((c) => c.term));
  yearRow.font = bold;
  termRow.font = bold;
  for (const r of [yearRow, termRow]) r.alignment = { horizontal: "center" };

  const byName = new Map(t.terms.map((x) => [x.name, x]));
  const depth = Math.max(0, ...cols.map((c) => byName.get(c.term)?.courses.length ?? 0));
  for (let i = 0; i < depth; i++) {
    const row = ws.addRow([]);
    cols.forEach((c, j) => {
      const course = byName.get(c.term)?.courses[i];
      if (!course) return;
      const cell = row.getCell(j + 1);
      cell.value = `${course.id} (${course.credits} cr)${course.grade ? ` ${course.grade}` : ""}${course.title ? `\n${course.title}` : ""}`;
      cell.fill = fillOf(CATEGORY_COLORS[course.category]);
      cell.alignment = { wrapText: true, vertical: "top" };
    });
  }
  const totals = ws.addRow(cols.map((c) => `${byName.get(c.term)?.credits ?? 0} credits`));
  totals.font = bold;
  totals.alignment = { horizontal: "center" };
  ws.addRow([]);
  ws.addRow(["Legend"]).font = bold;
  for (const cat of Object.keys(CATEGORY_LABELS) as Category[]) {
    const cell = ws.addRow([CATEGORY_LABELS[cat]]).getCell(1);
    cell.fill = fillOf(CATEGORY_COLORS[cat]);
  }
  ws.columns.forEach((c) => (c.width = 26));

  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}
