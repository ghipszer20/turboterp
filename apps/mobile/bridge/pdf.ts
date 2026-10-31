// pdfjs text extraction for the bridge. The worker is bundled (no CDN fetch, plan section 8) and
// run on the main thread via globalThis.pdfjsWorker, so no Worker or URL fetch is needed.
// @ts-expect-error legacy build ships .mjs without a matching types path
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
// @ts-expect-error same
import * as worker from "pdfjs-dist/legacy/build/pdf.worker.mjs";

(globalThis as unknown as { pdfjsWorker: unknown }).pdfjsWorker = worker;

export async function extractPdfText(base64: string): Promise<string> {
  const bin = atob(base64);
  const data = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
  const doc = await pdfjs.getDocument({ data, useSystemFonts: false, isEvalSupported: false }).promise;
  let out = "";
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    out += content.items.map((i: { str?: string }) => i.str ?? "").join(" ") + "\n";
  }
  return out.trim();
}
