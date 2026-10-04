"use client";

// The plan's checks: a summary list (worst first), each chosen track's checkTrack issues grouped
// under its name, and the program notices. checkPlan's issues are synchronous and run on every
// edit; track issues and notices come from the debounced audit (AnalysisState).

import type { PlanIssue } from "@turboterp/plan/check";
// TrackIssue only exists on check.ts, but this is a type-only import (erased at compile time, so
// it never pulls @turboterp/tracks' solver-backed runtime code into this bundle).
import type { TrackIssue } from "@turboterp/tracks";
import type { AnalysisState, OpenCourse } from "./AdvisorApp";
import type { CatalogState } from "./data";
import { SEVERITY, SEVERITY_ORDER, type IssueGroups, type Severity } from "@/lib/advisor/issues";
import styles from "./advisor.module.css";

type Checked = { issues: PlanIssue[]; groups: IssueGroups } | null;

export function ChecksPanel({
  checked,
  catalogStatus,
  analysis,
  onOpenCourse,
}: {
  checked: Checked;
  catalogStatus: CatalogState["status"];
  analysis: AnalysisState;
  onOpenCourse: (c: OpenCourse) => void;
}) {
  const tracks = analysis.result?.tracks ?? [];
  const degrees = analysis.result?.degrees ?? null;
  const degreeIssues = degrees ? [...degrees.issues].sort((a, b) => rank(a.severity) - rank(b.severity)) : [];
  const noPlanIssues = !checked || checked.issues.length === 0;
  const loadingTracks = tracks.length === 0 && analysis.status === "running";

  return (
    <section className={styles.card} aria-label="Checks">
      <h2 className={styles.cardTitle}>Checks</h2>
      {catalogStatus === "loading" && !checked ? (
        <p className={styles.cardNote}>Loading course data…</p>
      ) : catalogStatus === "missing" ? (
        <p className={styles.cardNote}>Build the course data to check prerequisites and credit loads.</p>
      ) : (
        <>
          {noPlanIssues && tracks.length === 0 && degreeIssues.length === 0 && !loadingTracks ? (
            <p className={styles.cardNote}>No issues found. TurboTerp checks prerequisites, corequisites, repeats and credit loads on every edit.</p>
          ) : null}
          {!noPlanIssues ? (
            <>
              <div className={styles.severityCounts}>
                {SEVERITY_ORDER.filter((s) => checked!.groups.counts[s] > 0).map((s) => (
                  <span key={s} className={styles.severityCount} data-severity={s}>
                    {SEVERITY[s].plural(checked!.groups.counts[s])}
                  </span>
                ))}
              </div>
              <ul className={styles.issueList}>
                {checked!.groups.summary.map((issue, i) => (
                  <IssueRow key={i} issue={issue} onOpenCourse={onOpenCourse} />
                ))}
              </ul>
            </>
          ) : null}
          {tracks.map(({ track, result }) =>
            result.issues.length > 0 ? (
              <div key={track.id} className={styles.trackGroup}>
                <h3 className={styles.trackGroupTitle}>{track.name}</h3>
                <ul className={styles.issueList}>
                  {[...result.issues].sort((a, b) => rank(a.severity) - rank(b.severity)).map((issue, i) => (
                    <TrackIssueRow key={i} issue={issue} onOpenCourse={onOpenCourse} />
                  ))}
                </ul>
              </div>
            ) : null,
          )}
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
        </>
      )}
    </section>
  );
}

const rank = (s: Severity) => SEVERITY_ORDER.indexOf(s);

function IssueRow({ issue, onOpenCourse }: { issue: PlanIssue; onOpenCourse: (c: OpenCourse) => void }) {
  const body = (
    <>
      <span className={styles.issueSeverity} data-severity={issue.severity}>
        {SEVERITY[issue.severity].label}
      </span>
      <span className={styles.issueText}>
        <span className={styles.issueWhere}>{issue.course ? `${issue.course} · ${issue.term}` : issue.term}</span>
        {issue.message}
      </span>
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
      <button type="button" className={styles.issueButton} onClick={() => onOpenCourse({ id: issue.course!, term: issue.term })}>
        {body}
      </button>
    </li>
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

/** Program notices: always info, never a warning (double major, dual degree, close-to-major). */
export function Notices({ analysis }: { analysis: AnalysisState }) {
  if (analysis.status === "error" && !analysis.result) {
    return (
      <section className={styles.card} aria-label="Program notices">
        <p className={styles.cardNote}>Couldn&apos;t check your programs and the CS gateway right now.</p>
      </section>
    );
  }
  const notices = analysis.result?.notices ?? [];
  if (notices.length === 0) {
    if (analysis.status === "running" && !analysis.result) {
      return (
        <section className={styles.card} aria-label="Program notices">
          <p className={styles.cardNote}>Checking your programs…</p>
        </section>
      );
    }
    return null;
  }
  return (
    <section className={styles.card} aria-label="Program notices" aria-busy={analysis.status === "running"}>
      <h2 className={styles.cardTitle}>Good to know</h2>
      <ul className={styles.noticeList}>
        {notices.map((n, i) => (
          <li key={i} className={styles.notice} data-severity="info">
            {n.message}
          </li>
        ))}
      </ul>
    </section>
  );
}
