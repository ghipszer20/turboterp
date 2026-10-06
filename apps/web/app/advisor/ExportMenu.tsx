"use client";

import { useState } from "react";
import type { AnalysisState } from "./AdvisorApp";
import type { PlanCatalog } from "@turboterp/plan/catalog";
import type { AdvisorPlan } from "@/lib/advisor/plan-state";
import { PROGRAM_OPTIONS, programsLabel } from "@/lib/advisor/programs";
import { formatKeyDates, termKeyDates } from "@/lib/calendar";
import type { AcademicEvent } from "@turboterp/campus-data";
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
  const result = analysis.result;
  const ready = analysis.status === "ready" && result !== null && catalog !== null;

  async function run(kind: "xlsx" | "pdf") {
    if (!result || !catalog) return;
    setBusy(kind);
    setError(false);
    try {
      const today = new Date();
      const { buildPlanExport, exportFileName } = await import("@/lib/advisor/export/plan-export");
      const planExport = buildPlanExport({
        plan,
        analysis: result,
        catalog,
        programKinds: Object.fromEntries(PROGRAM_OPTIONS.map((p) => [p.id, p.kind])),
        today,
        hideGrades,
        programsLabel: programsLabel(plan.programs),
        catalogYear: plan.catalogYear,
        priorCreditCredits: priorCredits,
        keyDates: Object.fromEntries(plan.terms.map((x, i, all) => [x.name, formatKeyDates(termKeyDates(calendar, x.name, i === all.length - 1))])),
      });
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
