// The 4-year plan as a Letter PDF, generated in the browser. jsPDF and jspdf-autotable are
// lazy-loaded: never import them at top level.

import { academicYears } from "../terms";
import { CATEGORY_COLORS, CATEGORY_LABELS, FOOTER, type Category, type PlanExport } from "./plan-export";

const rgb = (hex: string): [number, number, number] => [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];

export async function buildPdf(t: PlanExport) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "landscape" });
  const margin = 36;
  let y = margin;
  const tableEnd = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  const line = (text: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal").setFontSize(10).setTextColor(60);
    const lines = doc.splitTextToSize(text, doc.internal.pageSize.getWidth() - margin * 2) as string[];
    doc.text(lines, margin, y);
    y += lines.length * 13;
  };

  // Header
  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(20).text("TurboTerp 4-year plan", margin, y + 6);
  y += 26;
  line(`${t.header.name ? `Name: ${t.header.name}    ` : ""}Date: ${t.header.date}`);
  line(t.header.disclaimer, true);
  if (t.header.gradesHidden) line("Grades hidden.");
  y += 8;

  // Plan grid: one column per term, grouped by academic year.
  const years = academicYears(t.terms.map((x) => x.name));
  const cols = years.flatMap((yr) => yr.terms.map((name) => ({ year: yr.label, name })));
  const byName = new Map(t.terms.map((x) => [x.name, x]));
  const depth = Math.max(0, ...cols.map((c) => byName.get(c.name)?.courses.length ?? 0));
  const body = Array.from({ length: depth }, (_, i) =>
    cols.map((c) => {
      const course = byName.get(c.name)?.courses[i];
      if (!course) return "";
      return { content: `${course.id} (${course.credits})${course.grade ? ` ${course.grade}` : ""}`, styles: { fillColor: rgb(CATEGORY_COLORS[course.category]) } };
    }),
  );
  body.push(cols.map((c) => ({ content: `${byName.get(c.name)?.credits ?? 0} credits`, styles: { fontStyle: "bold" } })) as never);
  autoTable(doc, {
    margin: { left: margin, right: margin, bottom: 44 },
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [60, 60, 67], textColor: 255 },
    startY: y,
    head: [years.map((yr) => ({ content: yr.label, colSpan: yr.terms.length })), cols.map((c) => c.name)],
    body,
    theme: "grid",
  });
  y = tableEnd() + 18;
  line("Legend: " + (Object.keys(CATEGORY_LABELS) as Category[]).map((c) => CATEGORY_LABELS[c]).join(" | "));

  // Footer on every page.
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(110);
    doc.text(FOOTER, margin, h - 20);
    doc.text(`Page ${i} of ${pages}`, doc.internal.pageSize.getWidth() - margin, h - 20, { align: "right" });
  }
  return doc;
}
