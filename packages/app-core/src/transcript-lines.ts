// Reconstructs reading-order lines from pdfjs's flat list of positioned text items (pdfjs gives
// one item per run of same-styled text, in PDF content-stream order, which is not reading order
// for a table). Pulled out as pure functions -- no pdfjs import here -- so the trickiest part of
// the "read directly with pdfjs" input path is unit-testable with plain fake items, no real PDF or
// pdfjs runtime needed.

export type PdfTextItem = { str: string; transform: number[] };

/** Items within this many PDF points of each other's y count as the same visual line (handles
 * sub-pixel jitter pdfjs sometimes reports for glyphs drawn by different font runs on one row). */
const SAME_LINE_TOLERANCE = 1;

/** Groups items into lines (top to bottom), each line's items ordered left to right, and joins
 * each line's text. Blank lines are dropped. */
export function groupItemsIntoLines(items: PdfTextItem[]): string[] {
  type Row = { y: number; parts: { x: number; str: string }[] };
  const rows: Row[] = [];
  for (const item of items) {
    const x = item.transform[4] ?? 0;
    const y = item.transform[5] ?? 0;
    const row = rows.find((r) => Math.abs(r.y - y) <= SAME_LINE_TOLERANCE);
    if (row) row.parts.push({ x, str: item.str });
    else rows.push({ y, parts: [{ x, str: item.str }] });
  }
  return rows
    .sort((a, b) => b.y - a.y)
    .map((r) =>
      r.parts
        .sort((a, b) => a.x - b.x)
        .map((p) => p.str)
        .join(""),
    )
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** A page with a real text layer has many items with real characters; a vector-outline PDF (the
 * shape Testudo's own download button produces) has none, or only a stray few (e.g. a watermark),
 * so the OCR fallback should run instead. */
export function looksLikeTextLayer(items: PdfTextItem[]): boolean {
  const chars = items.reduce((n, it) => n + it.str.trim().length, 0);
  return items.length >= 5 && chars >= 20;
}
