// Plan exports: the engine renders the PDF/Excel file, it is written to the cache folder and handed
// to the iOS share sheet. "Email my plan" posts the PDF to the TurboTerp API for the signed-in
// account. Dependencies are passed in so this is tested with fakes.
import type { PlanExport } from "@turboterp/app-core/export/plan-export";
import type { EngineResult, FileResult, Job, JobResult } from "../engine/protocol";

export type ExportKind = "pdf" | "xlsx";
type Engine = { run<T extends Job["type"]>(job: Extract<Job, { type: T }>): Promise<EngineResult<JobResult<T>>> };

export interface FileDeps {
  /** Writes the file into the cache folder and returns its file:// uri. */
  writeBase64(fileName: string, base64: string): Promise<string>;
  /** Opens the share sheet for the file. Resolves when the sheet closes. */
  share(uri: string, mime: string, fileName: string): Promise<void>;
}

export type ExportOutcome = { ok: true } | { ok: false; message: string };

const FAILED = "Couldn't make that file. Try again.";

/** The file name becomes a path: keep it to one plain segment. */
export const safeFileName = (name: string): string => name.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^\.+/, "") || "plan";

async function render(kind: ExportKind, plan: PlanExport, engine: Engine): Promise<EngineResult<FileResult>> {
  return kind === "pdf" ? engine.run({ type: "exportPdf", plan }) : engine.run({ type: "exportXlsx", plan });
}

export async function exportPlanFile(kind: ExportKind, plan: PlanExport, engine: Engine, deps: FileDeps): Promise<ExportOutcome> {
  const r = await render(kind, plan, engine);
  if (!r.ok) return { ok: false, message: FAILED };
  try {
    const fileName = safeFileName(r.value.fileName);
    const uri = await deps.writeBase64(fileName, r.value.base64);
    await deps.share(uri, r.value.mime, fileName);
    return { ok: true };
  } catch {
    return { ok: false, message: "Couldn't open the share sheet. Try again." };
  }
}

/** Wording for the /api/email/plan status (same as the web). */
export function emailErrorText(status: number, code?: string): string {
  if (status === 429) return "You've emailed your plan 5 times today. Try again tomorrow.";
  if (status === 503 && code === "not-configured") return "Emailing isn't available yet.";
  if (status === 401) return "Sign in again to email your plan.";
  return "Couldn't email your plan. Try again.";
}

export type EmailDeps = {
  /** The signed-in session's access token, or null when signed out. */
  getToken(): Promise<string | null>;
  post(body: { pdfBase64: string; summary: string[] }, token: string): Promise<{ status: number; body: { email?: string; error?: string } }>;
};

export type EmailOutcome = { ok: true; email: string | null } | { ok: false; message: string; needsSignIn: boolean };

export async function emailPlan(plan: PlanExport, summary: string[], engine: Engine, deps: EmailDeps): Promise<EmailOutcome> {
  let token: string | null;
  try {
    token = await deps.getToken();
  } catch {
    token = null;
  }
  if (!token) return { ok: false, needsSignIn: true, message: "Sign in to email your plan. You can share the PDF instead." };
  const r = await engine.run({ type: "exportPdf", plan });
  if (!r.ok) return { ok: false, needsSignIn: false, message: FAILED };
  try {
    const res = await deps.post({ pdfBase64: r.value.base64, summary }, token);
    if (res.status >= 200 && res.status < 300) return { ok: true, email: res.body.email ?? null };
    return { ok: false, needsSignIn: res.status === 401, message: emailErrorText(res.status, res.body.error) };
  } catch {
    return { ok: false, needsSignIn: false, message: emailErrorText(0) };
  }
}
