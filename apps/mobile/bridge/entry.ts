// Engine bridge page. Runs inside a hidden WebView (or any browser context) and answers
// { id, job } requests with { id, ok, result | error } (protocol: src/engine/protocol.ts). Replies go to
// window.ReactNativeWebView.postMessage (react-native-webview) or window.parent. Nothing here may
// fetch from the network: the highs WASM, pdfjs worker, tesseract worker/core/language data and
// the export libraries are all inside this one bundle.
import { runAnalysis } from "@turboterp/app-core/analysis";
import { buildPdf } from "@turboterp/app-core/export/pdf";
import { buildXlsx } from "@turboterp/app-core/export/xlsx";
import { setHighsLoader } from "@turboterp/audit";
import loadHighs from "highs";
// @ts-expect-error bundler alias, binary import
import highsWasm from "highs-wasm";
import { checkJobSize, engineError, type EngineError, type Job, type Request, type Response } from "../src/engine/protocol";
import { ocrImage, ocrPdf } from "./ocr";
import { extractPdfText } from "./pdf";
import { JobError, toBase64 } from "./util";

// This highs build ignores `wasmBinary`; only Emscripten's `instantiateWasm` hook is honored.
setHighsLoader(() =>
  loadHighs({
    instantiateWasm: (imports: WebAssembly.Imports, done: (i: WebAssembly.Instance, m: WebAssembly.Module) => void) => {
      void WebAssembly.instantiate(highsWasm as BufferSource, imports).then((r) => done(r.instance, r.module));
      return {};
    },
  } as never),
);

function reply(msg: unknown) {
  const text = JSON.stringify(msg);
  const rn = (window as unknown as { ReactNativeWebView?: { postMessage(s: string): void } }).ReactNativeWebView;
  if (rn) rn.postMessage(text);
  else window.parent.postMessage(text, "*");
}

async function run(job: Job): Promise<unknown> {
  const tooBig = checkJobSize(job);
  if (tooBig) throw new JobError(tooBig.error.code, tooBig.error.message);
  switch (job.type) {
    case "audit":
      return runAnalysis({ plan: job.input.plan, catalog: new Map(job.input.catalog), priorCourses: job.input.priorCourses });
    case "transcriptPdf":
      return extractPdfText(job.pdfBase64);
    case "transcriptOcr":
      return job.source === "pdf" ? ocrPdf(job.dataBase64) : ocrImage(job.dataBase64);
    case "exportPdf": {
      const doc = await buildPdf(job.plan);
      return { base64: toBase64(new Uint8Array(doc.output("arraybuffer"))), mime: "application/pdf", fileName: "turboterp-plan.pdf" };
    }
    case "exportXlsx":
      return {
        base64: toBase64(new Uint8Array(await buildXlsx(job.plan))),
        mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileName: "turboterp-plan.xlsx",
      };
    default:
      throw new JobError("bad-input", "Unknown job.");
  }
}

async function handle(req: Request) {
  try {
    const result = await run(req.job);
    reply({ id: req.id, ok: true, result } satisfies Response);
  } catch (e) {
    const error: EngineError = e instanceof JobError ? { code: e.code, message: e.message } : engineError("engine-failed", String((e as Error)?.message ?? e)).error;
    reply({ id: req.id, ok: false, error } satisfies Response);
  }
}

function onMessage(ev: MessageEvent) {
  try {
    const req = (typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data) as Request;
    if (req && typeof req.id === "number" && req.job) void handle(req);
  } catch {
    /* ignore foreign messages */
  }
}
window.addEventListener("message", onMessage);
document.addEventListener("message", onMessage as EventListener); // Android WebView delivers here
reply({ ready: true });
