"use client";

// Where the plan's checks show. Errors and warnings sit where they belong: on the term (TermIssue)
// or the course card (PlanView), counted in the summary bar (CheckCounts). Checks with no term or
// course (tracks, double major / double degree) go above the plan (ProgramChecks), and the things
// most students know go under it in small print (PlanTips). Owner, 2026-10-04: no Checks column.

import type { PlanIssue } from "@turboterp/plan/check";
// TrackIssue only exists on check.ts, but this is a type-only import (erased at compile time, so
// it never pulls @turboterp/tracks' solver-backed runtime code into this bundle).
import type { TrackIssue } from "@turboterp/tracks";
import type { AnalysisState, OpenCourse } from "./AdvisorApp";
import { planTips, SEVERITY, SEVERITY_ORDER, type IssueGroups, type Severity } from "@/lib/advisor/issues";
import styles from "./advisor.module.css";

type Checked = { issues: PlanIssue[]; groups: IssueGroups } | null;

const rank = (s: Severity) => SEVERITY_ORDER.indexOf(s);

/** "1 to fix", "2 to check": the plan's errors and warnings, counted in the summary bar. Each one
 * is shown where it belongs, on its term or its course card. */
export function CheckCounts({ checked }: { checked: Checked }) {
  if (!checked) return null;
  const shown = (["error", "warning"] as const).filter((s) => checked.groups.counts[s] > 0);
  if (shown.length === 0) return null;
  return (
    <span className={styles.severityCounts}>
      {shown.map((s) => (
        <span key={s} className={styles.severityCount} data-severity={s}>
          {SEVERITY[s].plural(checked.groups.counts[s])}
        </span>
      ))}
    </span>
  );
}

/** A whole-term issue (credit load), inside its term. */
export function TermIssue({ issue }: { issue: PlanIssue }) {
  return (
    <div className={styles.issueRow} data-severity={issue.severity}>
      <span className={styles.issueSeverity} data-severity={issue.severity}>
        {SEVERITY[issue.severity].label}
      </span>
      <span className={styles.issueText}>{issue.message}</span>
    </div>
  );
}

const needsAction = (s: Severity) => s === "error" || s === "warning";

/** Checks that belong to no term or course: each chosen track's errors and warnings and the double
 * major / double degree rules. Renders nothing when there are none. A track's notes (milestones,
 * things to confirm) are folded away under the plan (PlanTips). */
export function ProgramChecks({ analysis, onOpenCourse }: { analysis: AnalysisState; onOpenCourse: (c: OpenCourse) => void }) {
  const tracks = (analysis.result?.tracks ?? [])
    .map(({ track, result }) => ({ track, issues: result.issues.filter((i) => needsAction(i.severity)) }))
    .filter(({ issues }) => issues.length > 0);
  const degrees = analysis.result?.degrees ?? null;
  const degreeIssues = degrees ? degrees.issues.filter((i) => i.severity !== "info").sort((a, b) => rank(a.severity) - rank(b.severity)) : [];
  if (tracks.length === 0 && degreeIssues.length === 0) return null;
  return (
    <section className={styles.programChecks} aria-label="Program checks">
      {tracks.map(({ track, issues }) => (
        <div key={track.id} className={styles.trackGroup}>
          <h3 className={styles.trackGroupTitle}>{track.name}</h3>
          <ul className={styles.issueList}>
            {[...issues].sort((a, b) => rank(a.severity) - rank(b.severity)).map((issue, i) => (
              <TrackIssueRow key={i} issue={issue} onOpenCourse={onOpenCourse} />
            ))}
          </ul>
        </div>
      ))}
      {degreeIssues.length > 0 ? (
        <div className={styles.trackGroup}>
          <h3 className={styles.trackGroupTitle}>{degrees!.mode === "double-degree" ? "Double degree" : "Double major"}</h3>
          <ul className={styles.issueList}>
            {degreeIssues.map((issue, i) => (
              <li key={i} className={styles.issueRow} data-severity={issue.severity}>
                <span className={styles.issueSeverity} data-severity={issue.severity}>
                  {SEVERITY[issue.severity].label}
                </span>
                <span className={styles.issueText}>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

/** Small print under the plan: the full-time rule, double major and dual degree notes. */
export function PlanTips({ checked, analysis }: { checked: Checked; analysis: AnalysisState }) {
  const tips = planTips(checked?.issues ?? [], [
    ...(analysis.result?.notices ?? []).map((n) => n.message),
    ...(analysis.result?.degrees?.issues ?? []).filter((i) => i.severity === "info").map((i) => i.message),
  ]);
  const trackNotes = (analysis.result?.tracks ?? [])
    .map(({ track, result }) => ({ track, notes: result.issues.filter((i) => !needsAction(i.severity)) }))
    .filter(({ notes }) => notes.length > 0);
  if (tips.length === 0 && trackNotes.length === 0) return null;
  return (
    <div className={styles.tips}>
      {tips.length > 0 ? (
        <>
          <h3 className={styles.tipsTitle}>Tips</h3>
          <ul className={styles.tipList}>
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </>
      ) : null}
      {trackNotes.map(({ track, notes }) => (
        <details key={track.id} className={styles.trackNotes}>
          <summary>
            {track.name}: {notes.length} {notes.length === 1 ? "note" : "notes"}
          </summary>
          <ul className={styles.tipList}>
            {notes.map((n, i) => (
              <li key={i}>{n.message}</li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}

/** A checkTrack issue: same severity styling as a plan issue, but only a course id (no term), so
 * it opens the course sheet without pre-selecting a term. */
function TrackIssueRow({ issue, onOpenCourse }: { issue: TrackIssue; onOpenCourse: (c: OpenCourse) => void }) {
  const body = (
    <>
      <span className={styles.issueSeverity} data-severity={issue.severity}>
        {SEVERITY[issue.severity].label}
      </span>
      <span className={styles.issueText}>{issue.message}</span>
    </>
  );
  if (!issue.course) {
    return (
      <li className={styles.issueRow} data-severity={issue.severity}>
        {body}
      </li>
    );
  }
  return (
    <li className={styles.issueRow} data-severity={issue.severity}>
      <button type="button" className={styles.issueButton} onClick={() => onOpenCourse({ id: issue.course!, term: null })}>
        {body}
      </button>
    </li>
  );
}

/** The program analysis's own state, shown only while it has nothing yet or failed; its notices
 * (double major, dual degree, close-to-major) are tips under the plan. */
export function Notices({ analysis }: { analysis: AnalysisState }) {
  if (analysis.result) return null;
  if (analysis.status === "error") return <p className={styles.cardNote}>Couldn&apos;t check your programs and the CS gateway right now.</p>;
  if (analysis.status === "running") return <p className={styles.cardNote}>Checking your programs…</p>;
  return null;
}
