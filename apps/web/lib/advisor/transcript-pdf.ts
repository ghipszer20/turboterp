// Thin pdfjs I/O for transcript import: extracts text directly from a text-bearing PDF (one of the
// three input paths), and renders a page to a canvas for the OCR fallback when there's no usable
// text layer (Testudo's own download button produces PDFs with letters drawn as vector outlines --
// no text -- which is exactly this case). All parsing logic lives in transcript-parse.ts /
// transcript-lines.ts, which this only feeds; kept intentionally thin and not deeply unit-tested
// per the brief -- pdfjs's own worker doesn't run under vitest's environment.

import { groupItemsIntoLines, looksLikeTextLayer, type PdfTextItem } from "@turboterp/app-core/transcript-lines";

export type ExtractedPdf = { text: string; hasTextLayer: boolean; pageCount: number };

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  // Self-hosted (see scripts/copy-pdfjs-worker.mjs): the file never leaves the browser to fetch a
  // worker from a CDN, matching the owner's "parse in the student's browser only" ruling.
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
  return pdfjs;
}

async function toBytes(file: Blob | ArrayBuffer): Promise<Uint8Array> {
  return file instanceof ArrayBuffer ? new Uint8Array(file) : new Uint8Array(await file.arrayBuffer());
}

/** Extracts text in reading order from every page. `hasTextLayer` is true if any page had a real
 * text layer; false means every page needs the OCR fallback (transcript-ocr.ts). */
export async function extractPdfText(file: Blob | ArrayBuffer): Promise<ExtractedPdf> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await toBytes(file) }).promise;
  const lines: string[] = [];
  let hasTextLayer = false;
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as PdfTextItem[];
    if (looksLikeTextLayer(items)) hasTextLayer = true;
    lines.push(...groupItemsIntoLines(items));
  }
  return { text: lines.join("\n"), hasTextLayer, pageCount: doc.numPages };
}

/** Renders one page to an off-DOM canvas at `scale`x, for OCR. */
export async function renderPdfPageToCanvas(file: Blob | ArrayBuffer, pageNumber: number, scale = 2): Promise<HTMLCanvasElement> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await toBytes(file) }).promise;
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const canvasContext = canvas.getContext("2d")!;
  await page.render({ canvasContext, canvas, viewport }).promise;
  return canvas;
}

export async function pdfPageCount(file: Blob | ArrayBuffer): Promise<number> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await toBytes(file) }).promise;
  return doc.numPages;
}
