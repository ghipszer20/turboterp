// Typed protocol between the app and the engine bridge page (apps/mobile/bridge). One request per
// job, one response per request, matched by id. Errors are values (EngineError), never throws, so
// the UI can show a message instead of crashing. The page and the host both import this file, so
// it must stay light: type-only imports of the shared packages, no runtime dependencies.
import type { Analysis } from "@turboterp/app-core/analysis";
import type { WhatIfResult } from "@turboterp/app-core/what-if";
import type { PlanExport } from "@turboterp/app-core/export/plan-export";
import type { AdvisorPlan } from "@turboterp/app-core/plan-state";
import type { CreditCourse } from "@turboterp/credit";
import type { CatalogCourse } from "@turboterp/plan/catalog";

/** A Map doesn't survive JSON, so the catalog travels as entries and the page rebuilds the Map. */
export type AuditInput = { plan: AdvisorPlan; catalog: [string, CatalogCourse][]; priorCourses: CreditCourse[] };

/** Explore: the saved plan compared with a proposed set of programs (ids from the program registry). */
export type WhatIfInput = AuditInput & { proposed: string[] };

export type Job =
  | { type: "audit"; input: AuditInput }
  | { type: "whatIf"; input: WhatIfInput }
  | { type: "transcriptPdf"; pdfBase64: string }
  /** `source` "image": a photo (png/jpeg/webp); "pdf": a scanned PDF whose pages are rendered, then read. */
  | { type: "transcriptOcr"; source: "image" | "pdf"; dataBase64: string }
  | { type: "exportPdf"; plan: PlanExport }
  | { type: "exportXlsx"; plan: PlanExport };

export type JobType = Job["type"];

export type TranscriptPdfResult = { text: string; hasTextLayer: boolean; pageCount: number };
export type TranscriptOcrResult = { text: string; pageCount: number };
/** A finished file, base64-encoded so it can cross the WebView boundary. */
export type FileResult = { base64: string; mime: string; fileName: string };

export type JobResults = {
  audit: Analysis;
  whatIf: WhatIfResult;
  transcriptPdf: TranscriptPdfResult;
  transcriptOcr: TranscriptOcrResult;
  exportPdf: FileResult;
  exportXlsx: FileResult;
};
export type JobResult<T extends JobType> = JobResults[T];

export type EngineErrorCode =
  | "timeout" // the job ran past its limit; the page is reloaded
  | "terminated" // iOS killed the WebView and the retry died too
  | "too-large" // input is over a cap
  | "bad-input" // unreadable file, wrong shape
  | "engine-failed" // the job threw inside the page
  | "unavailable"; // the page never became ready
export type EngineError = { code: EngineErrorCode; message: string };

export type EngineResult<T> = { ok: true; value: T } | { ok: false; error: EngineError };

export type Request = { id: number; job: Job };
export type Response = { id: number; ok: true; result: unknown } | { id: number; ok: false; error: EngineError };
/** First message the page sends once its handlers are installed. */
export type ReadyMessage = { ready: true };

/** Input caps, enforced in the host before sending and again in the page. */
export const LIMITS = {
  /** Base64 length; ~15 MB of file. */
  maxPdfBase64: 20_000_000,
  maxImageBase64: 20_000_000,
  /** Pages read from a PDF (text) or rendered (OCR). */
  maxPdfPages: 30,
  maxOcrPages: 6,
  /** Decoded image size; a 48 MP phone photo is over this and must be downscaled first. */
  maxImagePixels: 24_000_000,
  /** The whole audit request, as JSON text. */
  maxAuditJson: 20_000_000,
} as const;

/** Per-job timeouts (ms); the OCR budget covers a slow phone. */
export const TIMEOUT_MS: Record<JobType, number> = {
  audit: 60_000,
  whatIf: 60_000,
  transcriptPdf: 60_000,
  transcriptOcr: 240_000,
  exportPdf: 60_000,
  exportXlsx: 60_000,
};

export const engineError = (code: EngineErrorCode, message: string): { ok: false; error: EngineError } => ({ ok: false, error: { code, message } });

/** Cheap size checks that run before a job is sent (and again in the page). */
export function checkJobSize(job: Job): { ok: false; error: EngineError } | null {
  switch (job.type) {
    case "transcriptPdf":
      return job.pdfBase64.length > LIMITS.maxPdfBase64 ? engineError("too-large", "That PDF is too large to read on this device.") : null;
    case "transcriptOcr":
      return job.dataBase64.length > (job.source === "pdf" ? LIMITS.maxPdfBase64 : LIMITS.maxImageBase64)
        ? engineError("too-large", "That file is too large to read on this device.")
        : null;
    case "audit":
    case "whatIf":
      return JSON.stringify(job.input).length > LIMITS.maxAuditJson ? engineError("too-large", "That plan is too large to audit.") : null;
    default:
      return null;
  }
}
