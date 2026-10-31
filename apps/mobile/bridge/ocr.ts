// Transcript OCR with tesseract.js, fully offline: the worker script, the LSTM-only core (WASM
// inlined in its .js) and the English traineddata are bundled into the page by build-bridge.mjs and
// handed to tesseract as blob URLs and bytes. Nothing is fetched (guideline 2.5.2).
import { createWorker, OEM } from "tesseract.js";
import { LIMITS, type TranscriptOcrResult } from "../src/engine/protocol";
import { renderPages } from "./pdf";
import { JobError, fromBase64 } from "./util";
// Resolved by build-bridge.mjs to the files in tesseract.js, tesseract.js-core and @tesseract.js-data/eng.
// @ts-expect-error bundler alias, text import
import workerSource from "tess-worker";
// @ts-expect-error bundler alias, text import
import coreSource from "tess-core";
// @ts-expect-error bundler alias, binary import
import engData from "tess-eng";

const blobUrl = (source: string) => URL.createObjectURL(new Blob([source], { type: "text/javascript" }));

async function recognizeAll(items: (() => Promise<HTMLCanvasElement | null>)[]): Promise<string[]> {
  const worker = await createWorker([{ code: "eng", data: engData as Uint8Array }] as never, OEM.LSTM_ONLY, {
    workerPath: blobUrl(workerSource as string),
    workerBlobURL: false,
    // tesseract.js treats a path ending in "js" as the exact core file; the fragment keeps the blob URL valid.
    corePath: `${blobUrl(coreSource as string)}#core.js`,
    cacheMethod: "none",
  } as never);
  try {
    const texts: string[] = [];
    for (const next of items) {
      const canvas = await next();
      if (!canvas) continue;
      texts.push((await worker.recognize(canvas)).data.text);
    }
    return texts;
  } finally {
    await worker.terminate();
  }
}

export async function ocrImage(base64: string): Promise<TranscriptOcrResult> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(new Blob([fromBase64(base64) as BlobPart]));
  } catch {
    throw new JobError("bad-input", "That image couldn't be read.");
  }
  if (bitmap.width * bitmap.height > LIMITS.maxImagePixels) {
    bitmap.close();
    throw new JobError("too-large", "That photo is too large to read; pick a smaller one.");
  }
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
  bitmap.close();
  const [text] = await recognizeAll([async () => canvas]);
  return { text: text ?? "", pageCount: 1 };
}

export async function ocrPdf(base64: string): Promise<TranscriptOcrResult> {
  // Render and read one page at a time so only one bitmap is alive.
  const worker = await createWorker([{ code: "eng", data: engData as Uint8Array }] as never, OEM.LSTM_ONLY, {
    workerPath: blobUrl(workerSource as string),
    workerBlobURL: false,
    corePath: `${blobUrl(coreSource as string)}#core.js`,
    cacheMethod: "none",
  } as never);
  try {
    const texts = await renderPages(base64, async (canvas) => (await worker.recognize(canvas)).data.text);
    return { text: texts.join("\n"), pageCount: texts.length };
  } finally {
    await worker.terminate();
  }
}
