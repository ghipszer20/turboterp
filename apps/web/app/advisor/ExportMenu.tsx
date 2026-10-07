"use client";

import { useState } from "react";
import type { AnalysisState } from "./AdvisorApp";
import type { PlanCatalog } from "@turboterp/plan/catalog";
import type { AdvisorPlan } from "@/lib/advisor/plan-state";
import { PROGRAM_OPTIONS, programsLabel } from "@/lib/advisor/programs";
import { formatKeyDates, termKeyDates } from "@/lib/calendar";
import type { AcademicEvent } from "@turboterp/campus-data";
import { getAuthClient } from "@/lib/auth/client";
import { useSession } from "@/lib/auth/use-session";
import { emailErrorText } from "@/lib/email/plan-messages";
import styles from "./advisor.module.css";

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Export button + menu: the 4-year plan as PDF or Excel. The renderers (ExcelJS, jsPDF)
 * load only when a download is clicked. */
export function ExportMenu({ plan, analysis, catalog, calendar = [], priorCredits = 0 }: { plan: AdvisorPlan; analysis: AnalysisState; catalog: PlanCatalog | null; calendar?: AcademicEvent[]; priorCredits?: number }) {
  const [open, setOpen] = useState(false);
  const [hideGrades, setHideGrades] = useState(false);
  const [busy, setBusy] = useState<"xlsx" | "pdf" | null>(null);
  const [error, setError] = useState(false);
  const [emailState, setEmailState] = useState<{ kind: "idle" | "sending" | "sent" | "error"; text?: string }>({ kind: "idle" });
  const session = useSession();
  const result = analysis.result;
  const ready = analysis.status === "ready" && result !== null && catalog !== null;

  async function makePlanExport() {
    if (!result || !catalog) throw new Error("not ready");
    const { buildPlanExport } = await import("@/lib/advisor/export/plan-export");
    return buildPlanExport({
      plan,
      analysis: result,
      catalog,
      programKinds: Object.fromEntries(PROGRAM_OPTIONS.map((p) => [p.id, p.kind])),
      today: new Date(),
      hideGrades,
      programsLabel: programsLabel(plan.programs),
      catalogYear: plan.catalogYear,
      priorCreditCredits: priorCredits,
      keyDates: Object.fromEntries(plan.terms.map((x, i, all) => [x.name, formatKeyDates(termKeyDates(calendar, x.name, i === all.length - 1))])),
    });
  }

  async function emailPlan() {
    if (!result || !catalog) return;
    setEmailState({ kind: "sending" });
    try {
      const planExport = await makePlanExport();
      const { buildPdf } = await import("@/lib/advisor/export/pdf");
      const { earnedCredits, planSummaryLines } = await import("@/lib/advisor/export/plan-summary");
      const doc = await buildPdf(planExport);
      const bytes = new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);
      let bin = "";
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      const earned = earnedCredits(plan.terms, (c) => c.credits ?? catalog.get(c.id)?.credits.min ?? 0);
      const summary = planSummaryLines({
        creditsEarned: earned + priorCredits,
        creditsPlanned: planExport.creditsPlanned,
        programs: result.audits.map((a) => ({ name: a.program.name, satisfied: a.satisfied, total: a.total, inProgress: a.inProgress })),
      });
      const client = await getAuthClient();
      const { data } = await client.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setEmailState({ kind: "error", text: emailErrorText(401) });
        return;
      }
      const res = await fetch("/api/email/plan", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ pdfBase64: btoa(bin), summary }),
      });
      if (res.ok) {
        const body = (await res.json().catch(() => ({}))) as { email?: string };
        setEmailState({ kind: "sent", text: `Sent to ${body.email ?? session.email ?? "your email"}` });
        return;
      }
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      setEmailState({ kind: "error", text: emailErrorText(res.status, err.error) });
    } catch {
      setEmailState({ kind: "error", text: emailErrorText(0) });
    }
  }

  async function run(kind: "xlsx" | "pdf") {
    if (!result || !catalog) return;
    setBusy(kind);
    setError(false);
    try {
      const { exportFileName } = await import("@/lib/advisor/export/plan-export");
      const planExport = await makePlanExport();
      const name = exportFileName(kind, planExport.header.date);
      if (kind === "xlsx") {
        const { buildXlsx } = await import("@/lib/advisor/export/xlsx");
        const bytes = await buildXlsx(planExport);
        download(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), name);
      } else {
        const { buildPdf } = await import("@/lib/advisor/export/pdf");
        const doc = await buildPdf(planExport);
        download(doc.output("blob"), name);
      }
      setOpen(false);
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={styles.exportWrap}>
      <button type="button" className={styles.ghostButton} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Export
      </button>
      {open ? (
        <div className={styles.exportMenu} role="menu" aria-label="Export">
          {!ready ? <p className={styles.exportHint}>Available once the audit finishes.</p> : null}
          <button type="button" role="menuitem" className={styles.ghostButton} disabled={!ready || busy !== null} onClick={() => run("xlsx")}>
            {busy === "xlsx" ? "Preparing…" : "4-year plan (Excel)"}
          </button>
          <button type="button" role="menuitem" className={styles.ghostButton} disabled={!ready || busy !== null} onClick={() => run("pdf")}>
            {busy === "pdf" ? "Preparing…" : "4-year plan (PDF)"}
          </button>
          {session.status === "signed-in" ? (
            <button type="button" role="menuitem" className={styles.ghostButton} disabled={!ready || emailState.kind === "sending"} onClick={emailPlan}>
              {emailState.kind === "sending" ? "Sending…" : "Email to me"}
            </button>
          ) : null}
          {emailState.kind === "sent" || emailState.kind === "error" ? (
            <p className={styles.exportHint} role="status">
              {emailState.text}
            </p>
          ) : null}
          <label className={styles.exportSwitch}>
            <input type="checkbox" role="switch" checked={hideGrades} onChange={(e) => setHideGrades(e.target.checked)} />
            Hide grades
          </label>
          {error ? <p className={styles.exportHint}>Export failed. Try again.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
