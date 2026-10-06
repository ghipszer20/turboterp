// The 4-year plan as a Letter portrait PDF ("light with red rules"), generated in the browser.
// jsPDF and jspdf-autotable are lazy-loaded: never import them at top level. The rows come from
// pdf-rows.ts (pure); this file only draws.

import { FOOTER, type PlanExport } from "./plan-export";
import { PDF_CATEGORY_COLORS, PDF_CATEGORY_LABELS, pdfRows, type PdfCategory, type PdfTerm } from "./pdf-rows";

const RED = "#BA0C2F";
const HAIRLINE = "#e5e5ea";
const GRAY = "#6e6e73";
const INK = "#1c1c1e";

const MARGIN = 36;
const YEAR_W = 112;
const GAP = 12;
const ROW_H = 15;
const HEAD_H = 20;
const COLS_H = 14;
const TOTAL_H = 17;
const BAND_GAP = 14;
const FOOT_Y_FROM_BOTTOM = 24;

const termHeight = (t: PdfTerm) => HEAD_H + COLS_H + t.rows.length * ROW_H + TOTAL_H;

export async function buildPdf(t: PlanExport) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const width = pageW - MARGIN * 2;
  const termW = (width - YEAR_W - GAP * 2) / 2;
  let y = MARGIN;

  // Header: title, then programs + catalog + credits, then name, date and the disclaimer.
  doc.setFont("helvetica", "bold").setFontSize(22).setTextColor(INK).text("4-year plan", MARGIN, y + 18);
  y += 36;
  const prior = t.priorCreditCredits > 0 ? ` (${t.priorCreditCredits} from prior credit)` : "";
  const meta = [t.catalogYear ? `Catalog ${t.catalogYear}` : "", `${t.creditsPlanned} credits planned${prior}`].filter(Boolean).join(" · ");
  doc.setFontSize(10.5);
  let x = MARGIN;
  if (t.programsLabel) {
    doc.setFont("helvetica", "bold").setTextColor(INK);
    const lines = doc.splitTextToSize(t.programsLabel, width) as string[];
    doc.text(lines, MARGIN, y);
    const last = lines[lines.length - 1]!;
    x = MARGIN + doc.getTextWidth(last);
    y += (lines.length - 1) * 13;
    doc.setFont("helvetica", "normal").setTextColor(GRAY);
    doc.text(` · ${meta}`, x, y);
  } else {
    doc.setFont("helvetica", "normal").setTextColor(GRAY).text(meta, MARGIN, y);
  }
  y += 14;
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(GRAY);
  const second = [t.header.name, t.header.date, FOOTER].filter(Boolean).join(" · ");
  const secondLines = doc.splitTextToSize(second, width) as string[];
  doc.text(secondLines, MARGIN, y);
  y += secondLines.length * 10 + 10;

  const { years, legend } = pdfRows(t);
  const limit = pageH - MARGIN - FOOT_Y_FROM_BOTTOM;

  const drawTerm = (term: PdfTerm, left: number, top: number) => {
    const cols = { code: 0, title: 1, cr: 2, grade: 3 };
    autoTable(doc, {
      startY: top,
      margin: { left, right: pageW - left - termW },
      tableWidth: termW,
      theme: "plain",
      styles: { font: "helvetica", fontSize: 8.5, cellPadding: { top: 1, bottom: 1, left: 2, right: 2 }, textColor: INK, valign: "middle", overflow: "ellipsize", minCellHeight: ROW_H },
      columnStyles: {
        [cols.code]: { cellWidth: 62, fontStyle: "bold", cellPadding: { top: 1, bottom: 1, left: 12, right: 2 } },
        [cols.cr]: { cellWidth: 24, halign: "right" },
        [cols.grade]: { cellWidth: 32, halign: "center" },
      },
      head: [
        [{ content: term.name, colSpan: 4, styles: { fontStyle: "bold", fontSize: 11.5, textColor: RED, minCellHeight: HEAD_H, halign: "left", cellPadding: { top: 1, bottom: 3, left: 0, right: 0 } } }],
        ["COURSE", "", "CR", "GRADE"].map((c, i) => ({ content: c, styles: { fontStyle: "normal" as const, fontSize: 7, textColor: GRAY, minCellHeight: COLS_H, halign: i === 2 ? ("right" as const) : i === 3 ? ("center" as const) : ("left" as const), ...(i === 0 ? { cellPadding: { top: 1, bottom: 1, left: 12, right: 2 } } : {}) } })),
      ],
      body: [
        ...term.rows.map((r) => [r.code, r.title, String(r.credits), r.grade]),
        [{ content: "", styles: {} }, { content: "Total", styles: { fontStyle: "bold" as const } }, { content: String(term.total), styles: { fontStyle: "bold" as const, halign: "right" as const } }, ""],
      ],
      didParseCell: (d) => {
        if (d.section === "body" && d.column.index === cols.title && d.row.index < term.rows.length) {
          // Cut with an ellipsis so the title never wraps.
          const avail = d.cell.width - 4;
          let s = d.cell.text.join("");
          doc.setFont("helvetica", "normal").setFontSize(8.5);
          if (doc.getTextWidth(s) > avail) {
            while (s.length > 1 && doc.getTextWidth(s.replace(/…$/, "") + "…") > avail) s = s.replace(/…$/, "").slice(0, -1) + "…";
            d.cell.text = [s];
          }
        }
        if (d.section === "body" && d.row.index === term.rows.length) d.cell.styles.minCellHeight = TOTAL_H;
      },
      didDrawCell: (d) => {
        const { x: cx, y: cy, width: cw, height: ch } = d.cell;
        if (d.section === "head" && d.row.index === 0 && d.column.index === 0) {
          doc.setDrawColor(RED).setLineWidth(2).line(left, cy + ch, left + termW, cy + ch);
        }
        if (d.section === "body" && d.row.index < term.rows.length) {
          doc.setDrawColor(HAIRLINE).setLineWidth(0.5).line(cx, cy + ch, cx + cw, cy + ch);
          if (d.column.index === cols.code) {
            doc.setFillColor("#" + PDF_CATEGORY_COLORS[term.rows[d.row.index]!.category]).circle(cx + 5, cy + ch / 2, 3, "F");
          }
        }
        if (d.section === "body" && d.row.index === term.rows.length && d.column.index === 0) {
          doc.setDrawColor(RED).setLineWidth(1).line(left, cy, left + termW, cy);
        }
      },
    });
  };

  for (const year of years) {
    const rowsOfTerms = [year.terms.filter((x) => /^(Fall|Spring)/.test(x.name)), year.terms.filter((x) => !/^(Fall|Spring)/.test(x.name))].filter((r) => r.length > 0);
    const heights = rowsOfTerms.map((r) => Math.max(...r.map(termHeight)));
    const bandH = heights.reduce((s, h) => s + h, 0) + (heights.length - 1) * 10;
    if (y + bandH > limit && y > MARGIN + 1) {
      doc.addPage();
      y = MARGIN;
    }
    // Left cell: year label over a red rule, academic year, credits, key dates.
    doc.setDrawColor(RED).setLineWidth(2).line(MARGIN, y + 2, MARGIN + YEAR_W - 12, y + 2);
    doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(RED).text(year.label, MARGIN, y + 18);
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(INK).text(year.academicYear, MARGIN, y + 31);
    doc.setTextColor(GRAY).text(`${year.credits} credits`, MARGIN, y + 43);
    const dates = year.terms.filter((x) => x.keyDates).map((x) => `${x.name.split(" ")[0]}: ${x.keyDates}`);
    if (dates.length) {
      doc.setFontSize(6.5);
      const lines = (doc.splitTextToSize(dates.join("\n"), YEAR_W - 12) as string[]).slice(0, Math.floor((bandH - 56) / 8));
      doc.text(lines, MARGIN, y + 56);
    }
    let top = y;
    rowsOfTerms.forEach((r, i) => {
      r.forEach((term, j) => drawTerm(term, MARGIN + YEAR_W + GAP + j * (termW + GAP), top));
      top += heights[i]! + 10;
    });
    y += bandH + BAND_GAP;
  }

  // Legend of the categories present.
  if (legend.length) {
    if (y + 16 > limit) {
      doc.addPage();
      y = MARGIN;
    }
    let lx = MARGIN;
    doc.setFont("helvetica", "normal").setFontSize(8.5);
    for (const c of legend as PdfCategory[]) {
      doc.setFillColor("#" + PDF_CATEGORY_COLORS[c]).circle(lx + 3, y + 4, 3, "F");
      doc.setTextColor(INK).text(PDF_CATEGORY_LABELS[c], lx + 10, y + 7);
      lx += 10 + doc.getTextWidth(PDF_CATEGORY_LABELS[c]) + 16;
    }
  }

  // Footer on every page.
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(GRAY);
    doc.text("TurboTerp · turboterp.com", MARGIN, pageH - FOOT_Y_FROM_BOTTOM + 8);
    doc.text(`Page ${i} of ${pages}`, pageW - MARGIN, pageH - FOOT_Y_FROM_BOTTOM + 8, { align: "right" });
  }
  return doc;
}
