// pdfjs for the bridge: transcript text extraction and page rendering for OCR. The worker is bundled
// and run on the main thread via globalThis.pdfjsWorker, so no Worker, URL or CDN fetch is needed
// (plan section 8, guideline 2.5.2).
import { groupItemsIntoLines, looksLikeTextLayer, type PdfTextItem } from "@turboterp/app-core/transcript-lines";
import { LIMITS, type TranscriptPdfResult } from "../src/engine/protocol";
import { JobError, fromBase64 } from "./util";
// @ts-expect-error legacy build ships .mjs without a matching types path
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
// @ts-expect-error same
import * as worker from "pdfjs-dist/legacy/build/pdf.worker.mjs";

(globalThis as unknown as { pdfjsWorker: unknown }).pdfjsWorker = worker;

type PdfDoc = { numPages: number; getPage(n: number): Promise<any>; destroy(): Promise<void> };

export async function openPdf(base64: string): Promise<PdfDoc> {
  let doc: PdfDoc;
  try {
    doc = await pdfjs.getDocument({ data: fromBase64(base64), useSystemFonts: false, isEvalSupported: false }).promise;
  } catch {
    throw new JobError("bad-input", "That file couldn't be read as a PDF.");
  }
  return doc;
}

export async function extractPdfText(base64: string): Promise<TranscriptPdfResult> {
  const doc = await openPdf(base64);
  try {
    if (doc.numPages > LIMITS.maxPdfPages) throw new JobError("too-large", `That PDF has ${doc.numPages} pages; the limit is ${LIMITS.maxPdfPages}.`);
    const lines: string[] = [];
    let hasTextLayer = false;
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const items = (await page.getTextContent()).items as PdfTextItem[];
      if (looksLikeTextLayer(items)) hasTextLayer = true;
      lines.push(...groupItemsIntoLines(items));
    }
    return { text: lines.join("\n"), hasTextLayer, pageCount: doc.numPages };
  } finally {
    void doc.destroy();
  }
}

/** Renders each page (up to the OCR page cap) to a canvas at 2x, one at a time, calling `use` before the next. */
export async function renderPages<T>(base64: string, use: (canvas: HTMLCanvasElement) => Promise<T>): Promise<T[]> {
  const doc = await openPdf(base64);
  try {
    if (doc.numPages > LIMITS.maxOcrPages) throw new JobError("too-large", `That PDF has ${doc.numPages} pages; photo reading handles up to ${LIMITS.maxOcrPages}.`);
    const out: T[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const viewport = page.getViewport({ scale: 2 });
      if (viewport.width * viewport.height > LIMITS.maxImagePixels) throw new JobError("too-large", "That page is too large to read.");
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d")!, canvas, viewport }).promise;
      out.push(await use(canvas));
      canvas.width = canvas.height = 0; // free the bitmap before the next page
    }
    return out;
  } finally {
    void doc.destroy();
  }
}
