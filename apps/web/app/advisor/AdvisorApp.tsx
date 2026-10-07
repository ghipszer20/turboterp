"use client";

import { checkPlan } from "@turboterp/plan/check";
import { useEffect, useMemo, useRef, useState } from "react";
import { Segmented } from "@/components/Segmented";
import type { Analysis } from "@/lib/advisor/analysis";
import { checkerPlan } from "@/lib/advisor/checker";
import { hasConsent } from "@/lib/advisor/consent";
import { AccountLine } from "./SignInGate";
import { groupIssues } from "@/lib/advisor/issues";
import type { AdvisorPlan } from "@/lib/advisor/plan-state";
import { computePriorCredit } from "@/lib/advisor/prior-credit";
import { collegeOf, programsLabel } from "@/lib/advisor/programs";
import { termFromMatriculationId } from "@/lib/advisor/terms";
import { AuditView } from "./AuditView";
import { CourseSheet } from "./CourseSheet";
import { useCatalog, type CatalogState } from "./data";
import { DisclaimerGate } from "./DisclaimerGate";
import { ExportMenu } from "./ExportMenu";
import { ImportTranscriptView } from "./ImportTranscriptView";
import type { AcademicEvent } from "@turboterp/campus-data";
import { PlanView } from "./PlanView";
import { PriorCreditView } from "./PriorCreditView";
import { SetupView } from "./SetupView";
import { openView, savePlan, useAdvisorStore, useView, type View } from "./store";
import { WhatIfView } from "./WhatIfView";
import styles from "./advisor.module.css";

const VIEWS: { value: View; label: string }[] = [
  { value: "plan", label: "Plan" },
  { value: "credit", label: "Prior credit" },
  { value: "audit", label: "Audit" },
  { value: "what-if", label: "What if" },
];

/** Debounce for the audit and notices (HiGHS); the plan checker itself runs on every edit. */
const ANALYSIS_DELAY_MS = 350;

export type OpenCourse = { id: string; term: string | null };

export function AdvisorApp({ calendar }: { calendar: AcademicEvent[] }) {
  const store = useAdvisorStore();
  const catalog = useCatalog();

  if (store === null) return <Shell />;
  if (!store.consent || !hasConsent(store.consent)) return <DisclaimerGate />;
  if (!store.plan) return <SetupView plan={null} onDone={(plan) => savePlan(plan)} />;
  return <Planner plan={store.plan} catalog={catalog} signedBy={store.consent.name} signedAt={store.consent.acceptedAt} calendar={calendar} />;
}

function Shell() {
  return (
    <main className={styles.page} aria-busy="true">
      <header className={styles.header}>
        <h1 className={styles.title}>Advisor</h1>
      </header>
      <div className={styles.skeleton} />
    </main>
  );
}

function Planner({ plan, catalog, signedBy, signedAt, calendar }: { plan: AdvisorPlan; catalog: CatalogState; signedBy: string; signedAt: string; calendar: AcademicEvent[] }) {
  const view = useView();
  const [editing, setEditing] = useState(() => initialSetup());
  const [importing, setImporting] = useState(() => initialImport());
  const [open, setOpen] = useState<OpenCourse | null>(() => initialCourse());
  const ready = catalog.status === "ready" ? catalog : null;

  // The student's own picks only: the analysis chooses for the awards left unpicked, and `prior`
  // below adds those picks (never saved in the plan, since they change as the plan changes).
  const ownPrior = useMemo(
    () => computePriorCredit(plan.prior, (id) => ready?.catalog.get(id)?.genEd ?? []),
    [plan.prior, ready],
  );
  const analysis = useAnalysis(plan, ready, ownPrior.courses);
  const autoChoices = analysis.result?.autoChoices;
  const prior = useMemo(
    () => (autoChoices && Object.keys(autoChoices).length ? computePriorCredit(plan.prior, (id) => ready?.catalog.get(id)?.genEd ?? [], autoChoices) : ownPrior),
    [plan.prior, ready, autoChoices, ownPrior],
  );
  const checked = useMemo(() => {
    if (!ready) return null;
    const issues = checkPlan(checkerPlan(plan, prior.courses), ready.catalog, { college: plan.college ?? collegeOf(plan.programs) });
    return { issues, groups: groupIssues(issues, plan.terms.map((x) => x.name)) };
  }, [plan, prior.courses, ready]);


  if (editing) return <SetupView plan={plan} onDone={(next) => (savePlan(next), setEditing(false))} onCancel={() => setEditing(false)} />;
  if (importing) return <ImportTranscriptView plan={plan} onDone={(next) => (savePlan(next), setImporting(false))} onCancel={() => setImporting(false)} />;

  const date = new Date(signedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>
            {programsLabel(plan.programs)} · Catalog {plan.catalogYear.replace("-", "–")}
          </p>
          <h1 className={styles.title}>Advisor</h1>
          <AccountLine />
        </div>
        <button type="button" className={styles.ghostButton} onClick={() => setImporting(true)}>
          Import transcript
        </button>
        <button type="button" className={styles.ghostButton} onClick={() => setEditing(true)}>
          Edit setup
        </button>
        <ExportMenu plan={plan} analysis={analysis} catalog={ready?.catalog ?? null} calendar={calendar} priorCredits={prior.totalCredits} />
      </header>

      <div className={styles.tabs}>
        <Segmented<View> label="Advisor view" options={VIEWS} value={view} onChange={openView} />
      </div>

      {catalog.status === "missing" ? (
        <p className={styles.banner} data-tone="warning">
          Course data isn&apos;t built on this server yet, so TurboTerp can&apos;t search courses or check prerequisites. Run{" "}
          <code>npm run advisor-data</code>.
        </p>
      ) : null}

      {view === "plan" ? (
        <PlanView plan={plan} catalog={catalog} checked={checked} analysis={analysis} prior={prior} calendar={calendar} onOpenCourse={setOpen} />
      ) : null}
      {view === "credit" ? <PriorCreditView plan={plan} prior={prior} catalog={catalog} /> : null}
      {view === "audit" ? <AuditView plan={plan} analysis={analysis} onOpenCourse={setOpen} /> : null}
      {view === "what-if" ? <WhatIfView plan={plan} catalog={catalog} prior={prior} /> : null}

      {open ? (
        <CourseSheet
          course={open}
          plan={plan}
          catalog={catalog}
          issues={open.term ? (checked?.groups.byCourse.get(`${open.term}|${open.id}`) ?? []) : []}
          onClose={() => setOpen(null)}
          onOpenCourse={setOpen}
        />
      ) : null}

      <footer className={styles.footer}>
        <p>
          Unofficial. Not affiliated with the University of Maryland. Not academic advising: confirm your plan with your advisor
          and UMD&apos;s official degree audit.
        </p>
        <p>
          Agreement signed by {signedBy} on {date}.
          {ready ? ` Course data: ${termsLabel(ready.terms)} Schedule${ready.terms.length > 1 ? "s" : ""} of Classes; courses in none of those terms show as unknown.` : ""}
        </p>
      </footer>
    </main>
  );
}

const termLabel = (id: string) => termFromMatriculationId(id) ?? "";
const termsLabel = (ids: string[]) => {
  const names = [...ids].sort().map(termLabel);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : (names[0] ?? "");
};

/** ?course=CMSC351 opens that course's sheet (a deep link; also used by screenshots). */
function initialCourse(): OpenCourse | null {
  if (typeof window === "undefined") return null;
  const id = new URLSearchParams(location.search).get("course");
  return id && /^[A-Z]{4}\d{3}[A-Z]?$/.test(id) ? { id, term: null } : null;
}

/** ?setup=1 opens Edit setup directly (a deep link; also used by screenshots). */
function initialSetup(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(location.search).get("setup") === "1";
}

/** ?import=1 opens Import transcript directly (a deep link; also used by screenshots). */
function initialImport(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(location.search).get("import") === "1";
}

export type AnalysisState = { status: "idle" | "running" | "ready" | "error"; result: Analysis | null };

/** Audit + notices after edits settle; a newer edit always wins over an older, slower run. */
function useAnalysis(plan: AdvisorPlan, ready: Extract<CatalogState, { status: "ready" }> | null, priorCourses: Parameters<typeof checkerPlan>[1]) {
  const [state, setState] = useState<AnalysisState>({ status: "idle", result: null });
  const run = useRef(0);
  useEffect(() => {
    if (!ready) return;
    const id = ++run.current;
    const timer = setTimeout(async () => {
      setState((s) => ({ ...s, status: "running" }));
      try {
        const { runAnalysis } = await import("@/lib/advisor/analysis");
        const result = await runAnalysis({ plan, catalog: ready.catalog, priorCourses });
        if (id === run.current) setState({ status: "ready", result });
      } catch {
        if (id === run.current) setState((s) => ({ status: "error", result: s.result }));
      }
    }, ANALYSIS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [plan, ready, priorCourses]);
  return state;
}
