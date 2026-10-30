// Plan checker issues → where the UI shows them: on the course card, on the term header, and in
// the summary list (worst first).

import { FULL_TIME_CREDITS, type PlanIssue } from "@turboterp/plan/check";

export type Severity = PlanIssue["severity"];

export const SEVERITY_ORDER: Severity[] = ["error", "warning", "confirm", "info"];

export const SEVERITY: Record<Severity, { label: string; plural: (n: number) => string }> = {
  error: { label: "Must fix", plural: (n) => `${n} to fix` },
  warning: { label: "Check", plural: (n) => `${n} to check` },
  confirm: { label: "Confirm yourself", plural: (n) => `${n} to confirm` },
  info: { label: "Good to know", plural: (n) => `${n} ${n === 1 ? "note" : "notes"}` },
};

export const courseKey = (term: string, course: string) => `${term}|${course}`;

export type IssueGroups = {
  byCourse: Map<string, PlanIssue[]>;
  byTerm: Map<string, PlanIssue[]>;
  worstByCourse: Map<string, Severity>;
  worstByTerm: Map<string, Severity>;
  summary: PlanIssue[];
  /** The summary's errors and warnings: what the Checks list shows. Confirm items sit on their
   * course card and info becomes a tip (planTips), so neither is repeated there. */
  checks: PlanIssue[];
  counts: Record<Severity, number>;
};

const rank = (s: Severity) => SEVERITY_ORDER.indexOf(s);
const worse = (a: Severity | undefined, b: Severity) => (a === undefined || rank(b) < rank(a) ? b : a);

/** `termOrder` is the plan's term names in order. Worst-by-term includes the term's courses. */
export function groupIssues(issues: PlanIssue[], termOrder: string[]): IssueGroups {
  const g: IssueGroups = {
    byCourse: new Map(),
    byTerm: new Map(),
    worstByCourse: new Map(),
    worstByTerm: new Map(),
    summary: [],
    checks: [],
    counts: { error: 0, warning: 0, confirm: 0, info: 0 },
  };
  for (const issue of issues) {
    g.counts[issue.severity]++;
    if (issue.course) {
      const key = courseKey(issue.term, issue.course);
      g.byCourse.set(key, [...(g.byCourse.get(key) ?? []), issue]);
      g.worstByCourse.set(key, worse(g.worstByCourse.get(key), issue.severity));
    } else {
      g.byTerm.set(issue.term, [...(g.byTerm.get(issue.term) ?? []), issue]);
    }
    g.worstByTerm.set(issue.term, worse(g.worstByTerm.get(issue.term), issue.severity));
  }
  const termIndex = (t: string) => {
    const i = termOrder.indexOf(t);
    return i < 0 ? termOrder.length : i;
  };
  g.summary = issues
    .map((issue, i) => ({ issue, i }))
    .sort((a, b) => rank(a.issue.severity) - rank(b.issue.severity) || termIndex(a.issue.term) - termIndex(b.issue.term) || a.i - b.i)
    .map((x) => x.issue);
  g.checks = g.summary.filter((i) => i.severity === "error" || i.severity === "warning");
  return g;
}

/** The one line a course card has room for: its most severe issue (the short form if it has one). */
export function cardNote(issues: PlanIssue[]): string {
  // The most severe issue, so the text matches the card's color (the first one wins a tie).
  const first = issues.reduce((a, b) => (rank(b.severity) < rank(a.severity) ? b : a));
  return `${first.short ?? first.message}${issues.length > 1 ? ` (+${issues.length - 1} more)` : ""}`;
}

/** Small print under Checks: things most students know, said once. `notes` are the program
 * notices and info-level degree notes (double major, dual degree, declaration deadlines). */
export function planTips(issues: PlanIssue[], notes: string[]): string[] {
  const tips = issues.some((i) => i.kind === "light-load")
    ? [`Full-time is at least ${FULL_TIME_CREDITS} credits in a fall or spring term. Fewer can affect financial aid, housing and your graduation date.`]
    : [];
  return [...new Set([...tips, ...notes])];
}
