"use client";

// What-if program changes: switch a major, add one, or drop one, and see the effect before
// committing to it. Never imports @turboterp/plan/what-if (or @turboterp/audit) as a value at
// the top of this file -- only types -- so HiGHS stays out of the main bundle; the comparison
// itself is loaded with import() and run after the proposed set settles, like the Audit tab's
// analysis (AdvisorApp.tsx's useAnalysis).

import { useEffect, useRef, useState } from "react";
import type { GatewayCourseStatus, GatewayOverallStatus, GatewayResult } from "@turboterp/audit";
import { checkerPlan } from "@/lib/advisor/checker";
import type { AdvisorPlan } from "@/lib/advisor/plan-state";
import type { PriorCreditResult } from "@/lib/advisor/prior-credit";
import { PROGRAM_OPTIONS, programsLabel, toggleProgram } from "@/lib/advisor/programs";
import { ProgramPicker } from "./ProgramPicker";
import { addedProgramNotes, completedCreditTotals, gatewayAttemptLimitNote, gatewayRuleText } from "@/lib/advisor/what-if-display";
import type { CourseWhatIf, WhatIfResult } from "@/lib/advisor/what-if";
import type { CatalogState } from "./data";
import { dispatchPlan } from "./store";
import styles from "./advisor.module.css";

/** Debounce for the comparison (it's solver-backed, like the audit). */
const COMPARE_DELAY_MS = 350;

const arraysEqual = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

type CompareState = { status: "idle" | "running" | "ready" | "error"; result: WhatIfResult | null };

export function WhatIfView({ plan, catalog, prior }: { plan: AdvisorPlan; catalog: CatalogState; prior: PriorCreditResult }) {
  const [proposed, setProposed] = useState<string[]>(plan.programs);
  const [undoPrograms, setUndoPrograms] = useState<string[] | null>(null);
  const ready = catalog.status === "ready" ? catalog : null;

  // The plan's own majors changed underneath us (Apply, Undo, or Edit setup): match the picker so
  // a stale proposed set never lingers. Adjusted during render (not an effect): React's own
  // pattern for resetting state when a prop changes, without an extra render.
  const [syncedPrograms, setSyncedPrograms] = useState(plan.programs);
  if (!arraysEqual(plan.programs, syncedPrograms)) {
    setSyncedPrograms(plan.programs);
    setProposed(plan.programs);
  }

  const changed = !arraysEqual(proposed, plan.programs);
  const compare = useCompare(plan, prior, ready, proposed, changed);

  const apply = () => {
    setUndoPrograms(plan.programs);
    dispatchPlan({ type: "set-programs", programs: proposed });
  };
  const undo = () => {
    if (!undoPrograms) return;
    dispatchPlan({ type: "set-programs", programs: undoPrograms });
    setUndoPrograms(null);
  };

  return (
    <div className={styles.auditLayout}>
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>What if…</h2>
        <p className={styles.panelNote}>
          Switch a major, add a major or minor, or drop one to see the effect on your plan before committing to it. Your real plan (
          {programsLabel(plan.programs)}) doesn&apos;t change until you press Apply.
        </p>
        <ProgramPicker label="Proposed programs" selected={proposed} onToggle={(id) => setProposed((p) => toggleProgram(p, id))} />

        {undoPrograms ? (
          <p className={styles.banner}>
            Applied. Your plan now uses {programsLabel(plan.programs)}.{" "}
            <button type="button" className={styles.linkButton} onClick={undo}>
              Undo
            </button>
          </p>
        ) : null}

        <div className={styles.actions}>
          <button type="button" className={styles.primaryButton} onClick={apply} disabled={!changed || proposed.length === 0}>
            Apply
          </button>
        </div>
      </section>

      {!ready ? (
        <div className={styles.card}>
          <p className={styles.cardNote}>Course data isn&apos;t built on this server yet, so What-if can&apos;t run.</p>
        </div>
      ) : !changed ? (
        <div className={styles.card}>
          <p className={styles.cardNote}>Pick a different major, add one, or drop one above to compare it with your current plan.</p>
        </div>
      ) : (
        <CompareResult compare={compare} current={plan.programs} proposed={proposed} />
      )}
    </div>
  );
}

/** Runs the comparison after the proposed set settles; a newer edit always wins over an older,
 * slower run. Idle (no result, no spinner) whenever there's nothing to compare yet. */
function useCompare(
  plan: AdvisorPlan,
  prior: PriorCreditResult,
  ready: Extract<CatalogState, { status: "ready" }> | null,
  proposed: string[],
  active: boolean,
): CompareState {
  const [state, setState] = useState<CompareState>({ status: "idle", result: null });
  const run = useRef(0);
  useEffect(() => {
    // Nothing to compare: the caller doesn't render the result while inactive, and a later
    // "active" run always starts its own fresh debounce, so it's fine to just skip without
    // resetting state here (avoids a synchronous setState in the effect body).
    if (!active || !ready) return;
    const id = ++run.current;
    const timer = setTimeout(async () => {
      setState((s) => ({ ...s, status: "running" }));
      try {
        const { runWhatIf } = await import("@/lib/advisor/what-if");
        const planForCheck = checkerPlan(plan, prior.courses);
        const result = await runWhatIf(planForCheck, ready.catalog, plan.programs, proposed, plan.startTerm, plan.gpa, plan.confirmedSlots);
        if (id === run.current) setState({ status: "ready", result });
      } catch {
        if (id === run.current) setState((s) => ({ status: "error", result: s.result }));
      }
    }, COMPARE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [plan, prior.courses, ready, proposed, active]);
  return state;
}

function CompareResult({ compare, current, proposed }: { compare: CompareState; current: string[]; proposed: string[] }) {
  if (!compare.result) {
    return (
      <div className={styles.card}>
        <p className={styles.cardNote}>{compare.status === "error" ? "Couldn't build the comparison right now. Try again in a moment." : "Comparing…"}</p>
      </div>
    );
  }
  const r = compare.result;
  const changedCourses = r.courses.filter((c) => c.currentStatus !== c.proposedStatus);
  const droppedPrograms = current.filter((id) => !proposed.includes(id)).map(programName);
  const addedPrograms = proposed.filter((id) => !current.includes(id));
  const addedNotes = addedProgramNotes(current, proposed);
  const totals = completedCreditTotals(r.courses);
  const hasExisting = totals.counts + totals.elective + totals.unused > 0;

  return (
    <div aria-busy={compare.status === "running"}>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Graduation date</h2>
        <p className={styles.cardNote}>
          At your typical pace ({r.graduation.typicalLoad} credits a term), your estimated finish term
          {r.graduation.deltaTerms === 0
            ? ` stays ${r.graduation.currentFinishTerm}.`
            : ` would move from ${r.graduation.currentFinishTerm} to ${r.graduation.proposedFinishTerm}${
                r.graduation.deltaTerms > 0 ? " -- later" : " -- earlier"
              }.`}
        </p>
      </section>

      {hasExisting ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Your existing credits</h2>
          <p className={styles.cardNote}>
            Of the credits you&apos;ve already earned (completed courses and prior credit), under {programsLabel(proposed)}
            {": "}
            {totals.counts} count toward a requirement, {totals.elective} become electives, and {totals.unused} go unused.
          </p>
        </section>
      ) : null}

      {addedNotes.length > 0 ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Catalog year</h2>
          <ul className={styles.reqList}>
            {addedNotes.map((n) => (
              <li key={n.id} className={styles.reqRow}>
                <div className={styles.reqHead}>
                  <span className={styles.reqName}>
                    {n.name}
                    {!n.verified ? <span className={styles.unverified}> Unverified</span> : null}
                  </span>
                  <span className={styles.reqStatus}>{n.catalogYear ? `Catalog ${n.catalogYear.replace("-", "–")}` : "Catalog year not on file"}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {r.freedCredits > 0 ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Freed credits</h2>
          <p className={styles.cardNote}>
            {r.freedCredits} credits of not-yet-taken courses would no longer be required{droppedPrograms.length > 0 ? ` after dropping ${listing(droppedPrograms)}` : ""}.
          </p>
        </section>
      ) : null}

      {r.orphaned.length > 0 ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Would count toward nothing</h2>
          <p className={styles.cardNote}>
            {listing(r.orphaned)} would no longer count toward any program or Gen Ed requirement. Keep {r.orphaned.length === 1 ? "it" : "them"} as
            {" "}free electives or swap {r.orphaned.length === 1 ? "it" : "them"} out.
          </p>
        </section>
      ) : null}

      {r.newlyMissing.length > 0 ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Still needed</h2>
          <ul className={styles.reqList}>
            {r.newlyMissing.map((m) => (
              <li key={m.program.id} className={styles.reqRow}>
                <div className={styles.reqHead}>
                  <span className={styles.reqName}>
                    {m.program.name}
                    {!m.program.verified ? <span className={styles.unverified}> Unverified</span> : null}
                  </span>
                  <span className={styles.reqStatus} data-status="missing">
                    {m.coursesShort} course{m.coursesShort === 1 ? "" : "s"} short
                  </span>
                </div>
                <p className={styles.reqGap}>{listing(m.missing)}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : addedPrograms.length > 0 ? (
        <section className={styles.card}>
          <p className={styles.cardNote}>Every newly added major is already satisfied by your current plan.</p>
        </section>
      ) : null}

      {r.gateway ? (
        <section className={styles.card} aria-label="CS gateway">
          <h2 className={styles.cardTitle}>CS gateway (Limited Enrollment Program)</h2>
          <p className={styles.cardNote}>{gatewayRuleText(r.gateway.rule)}</p>
          <ul className={styles.reqList}>
            {r.gateway.courses.map((c) => (
              <li key={c.id} className={styles.reqRow}>
                <div className={styles.reqHead}>
                  <span className={styles.reqName}>{c.name}</span>
                  <span className={styles.reqStatus} data-status={GATEWAY_TONE[c.status]}>
                    {GATEWAY_COURSE_LABEL[c.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className={styles.cardNote} data-severity={r.gateway.gpa === "below" ? "warning" : undefined}>
            GPA: {GPA_LABEL[r.gateway.gpa]}
            {r.gateway.gpa === "unknown" ? " -- enter it on the Audit tab." : ""}
          </p>
          <p className={styles.reqStatus} data-status={OVERALL_TONE[r.gateway.overall]}>
            {OVERALL_LABEL[r.gateway.overall]}
          </p>
          {gatewayAttemptLimitNote(r.gateway) ? (
            <p className={styles.cardNote} data-severity="warning">
              {gatewayAttemptLimitNote(r.gateway)}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>What changes for your courses</h2>
        {changedCourses.length === 0 ? (
          <p className={styles.cardNote}>No course&apos;s status changes.</p>
        ) : (
          <ul className={styles.reqList}>
            {changedCourses.map((c, i) => (
              <li key={`${c.id}-${i}`} className={styles.reqRow}>
                <div className={styles.reqHead}>
                  <span className={styles.reqName}>{c.id}</span>
                  <span>
                    <span className={styles.reqStatus} data-status={STATUS_TONE[c.currentStatus]}>
                      {STATUS_LABEL[c.currentStatus]}
                    </span>
                    {" → "}
                    <span className={styles.reqStatus} data-status={STATUS_TONE[c.proposedStatus]}>
                      {STATUS_LABEL[c.proposedStatus]}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className={styles.cardNote}>
          {r.courses.length - changedCourses.length} of {r.courses.length} courses are unaffected.
        </p>
      </section>
    </div>
  );
}

/** "A", "A and B", "A, B and C" */
function listing(items: string[]): string {
  return items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/** A program id's full name, e.g. "the Computer Science Major"; falls back to the id itself for
 * one this session's PROGRAM_OPTIONS doesn't recognize. */
function programName(id: string): string {
  return `the ${PROGRAM_OPTIONS.find((o) => o.id === id)?.name ?? id}`;
}

const STATUS_LABEL: Record<CourseWhatIf["currentStatus"], string> = { counts: "Counts", elective: "Elective", unused: "Unused" };
const STATUS_TONE: Record<CourseWhatIf["currentStatus"], "satisfied" | "partial" | "missing"> = {
  counts: "satisfied",
  elective: "partial",
  unused: "missing",
};

const GATEWAY_COURSE_LABEL: Record<GatewayCourseStatus, string> = {
  met: "Met",
  "below-minimum": "Below the minimum grade",
  planned: "Planned",
  missing: "Not planned",
};
const GATEWAY_TONE: Record<GatewayCourseStatus, "satisfied" | "partial" | "missing"> = {
  met: "satisfied",
  planned: "partial",
  missing: "missing",
  "below-minimum": "missing",
};
const OVERALL_LABEL: Record<GatewayOverallStatus, string> = {
  eligible: "Eligible to apply to the CS major",
  "not-yet": "Not eligible yet",
  ineligible: "Not eligible as your record stands",
};
const OVERALL_TONE: Record<GatewayOverallStatus, "satisfied" | "partial" | "missing"> = { eligible: "satisfied", "not-yet": "partial", ineligible: "missing" };
const GPA_LABEL: Record<GatewayResult["gpa"], string> = { met: "Meets the minimum", below: "Below the minimum", unknown: "Not entered" };
