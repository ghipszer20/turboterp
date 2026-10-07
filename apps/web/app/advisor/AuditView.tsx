"use client";

// The degree audit, per program, the CS gateway, and pre-professional Tracks. Reads the debounced
// Analysis; never imports @turboterp/audit or @turboterp/tracks as a value (only types), so HiGHS
// stays out of this file's bundle — it's already loaded by lib/advisor/analysis.ts, which the app
// code-splits with import(). A Track's own data (name, categories, disclaimer, milestones) comes
// through as a value on analysis.result.tracks[].track, which isn't an import and so is fine.

import type { GatewayCourseStatus, GatewayOverallStatus, Requirement, RequirementResult } from "@turboterp/audit";
import type { MilestoneTiming } from "@turboterp/tracks";
import type { AdvisorPlan } from "@/lib/advisor/plan-state";
import { blockedNotice } from "@/lib/advisor/programs";
import { metText, REQ_STATUS_LABEL } from "@/lib/advisor/req-status";
import { showsScienceGpa } from "@/lib/advisor/tracks";
import { gatewayAttemptLimitNote } from "@/lib/advisor/what-if-display";
import type { AnalysisState, OpenCourse } from "./AdvisorApp";
import { dispatchPlan } from "./store";
import styles from "./advisor.module.css";

const REQ_STATUS = REQ_STATUS_LABEL;

type OpenSlot = Extract<Requirement, { kind: "openSlot" }>;

/** An Open Slot ("from an approved list" that isn't published): the student ticks it once their
 * advisor confirms it; the program isn't complete until then. The key matches @turboterp/audit's slotKey. */
function OpenSlotRow({ programId, slot, confirmed }: { programId: string; slot: OpenSlot; confirmed: boolean }) {
  const key = `${programId}/${slot.id}`;
  return (
    <li className={styles.reqRow}>
      <div className={styles.reqHead}>
        <span className={styles.reqName}>
          {slot.name}
          {slot.credits !== undefined ? <span className={styles.slotCredits}> · {slot.credits} credits</span> : null}
        </span>
        <span className={styles.reqStatus} data-status={confirmed ? "satisfied" : "confirm"}>
          {confirmed ? "Confirmed" : "Confirm with your advisor"}
        </span>
      </div>
      {slot.note ? <p className={styles.reqGap}>{slot.note}</p> : null}
      <label className={styles.slotCheck} data-checked={confirmed || undefined}>
        <input type="checkbox" checked={confirmed} onChange={() => dispatchPlan({ type: "toggle-slot", key })} />
        <span>My advisor confirmed my courses for this</span>
      </label>
    </li>
  );
}

export function AuditView({
  plan,
  analysis,
  onOpenCourse,
}: {
  plan: AdvisorPlan;
  analysis: AnalysisState;
  onOpenCourse: (c: OpenCourse) => void;
}) {
  if (!analysis.result) {
    return (
      <div className={styles.card}>
        <p className={styles.cardNote}>
          {analysis.status === "error" ? "Couldn't build the audit right now. Try again in a moment." : "Building your audit…"}
        </p>
      </div>
    );
  }
  const { audits, gateway, tracks, scienceGpa } = analysis.result;
  const termOrder = plan.terms.map((t) => t.name);

  return (
    <div className={styles.auditLayout} aria-busy={analysis.status === "running"}>
      {audits.map((audit) => (
        <section key={audit.program.id} className={styles.card}>
          <div className={styles.auditHead}>
            <h2 className={styles.cardTitle}>{audit.program.name}</h2>
            {!audit.program.verified ? <span className={styles.unverified}>Unverified</span> : null}
          </div>
          <p className={styles.cardNote}>
            {blockedNotice(audit.program.id, plan.programs) ?? metText(audit.satisfied, audit.total, audit.inProgress)}
          </p>
          <ul className={styles.reqList}>
            {audit.requirements.map(({ requirement, result, display, gap }) =>
              requirement.kind === "openSlot" ? (
                <OpenSlotRow key={requirement.id} programId={audit.program.id} slot={requirement} confirmed={result.status === "satisfied"} />
              ) : (
              <li key={requirement.id} className={styles.reqRow}>
                <div className={styles.reqHead}>
                  <span className={styles.reqName}>{requirement.name}</span>
                  <span className={styles.reqStatus} data-status={display}>
                    {REQ_STATUS[display]}
                  </span>
                </div>
                <GradeNotes result={result} />
                {result.assigned.length > 0 ? (
                  <p className={styles.reqAssigned}>
                    Counted: <CourseChips ids={result.assigned} onOpenCourse={onOpenCourse} />
                  </p>
                ) : null}
                {gap ? (
                  <p className={styles.reqGap}>
                    Still needed: {gap.need}
                    {gap.suggestions.length > 0 ? (
                      <>
                        {" "}
                        For example: <CourseChips ids={gap.suggestions} onOpenCourse={onOpenCourse} />
                      </>
                    ) : null}
                    {gap.note ? ` ${gap.note}` : null}
                  </p>
                ) : null}
              </li>
              ),
            )}
            {audit.gpa ? (
              <li className={styles.reqRow}>
                <div className={styles.reqHead}>
                  <span className={styles.reqName}>{audit.gpa.name}</span>
                  <span className={styles.reqStatus} data-status={audit.gpa.status}>
                    {REQ_STATUS[audit.gpa.status]}
                  </span>
                </div>
                <GradeNotes result={audit.gpa} />
              </li>
            ) : null}
          </ul>
        </section>
      ))}

      {gateway ? (
        <section className={styles.card} aria-label="CS gateway">
          <h2 className={styles.cardTitle}>CS gateway (Limited Enrollment Program)</h2>
          <p className={styles.cardNote}>
            {gateway.rule.name === "fall-2024-or-later"
              ? `Matriculated Fall 2024 or later: every gateway course ${gateway.rule.minGrade} or better, cumulative GPA ${gateway.rule.minGpa.toFixed(1)} or higher.`
              : `Matriculated before Fall 2024: every gateway course ${gateway.rule.minGrade} or better, cumulative GPA ${gateway.rule.minGpa.toFixed(1)} or higher.`}
          </p>
          <ul className={styles.reqList}>
            {gateway.courses.map((c) => (
              <li key={c.id} className={styles.reqRow}>
                <div className={styles.reqHead}>
                  <span className={styles.reqName}>
                    {c.name} ({c.options.join(" or ")})
                  </span>
                  <span className={styles.reqStatus} data-status={GATEWAY_TONE[c.status]}>
                    {GATEWAY_COURSE_LABEL[c.status]}
                    {c.satisfiedBy ? ` (${c.satisfiedBy})` : ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Cumulative UMD GPA (a transcript import fills this in from your transcript; you can edit it)</span>
            <input
              className={styles.input}
              type="number"
              min={0}
              max={4}
              step={0.01}
              value={plan.gpa ?? ""}
              placeholder="Not entered"
              onChange={(e) => dispatchPlan({ type: "set-gpa", gpa: e.target.value === "" ? undefined : Number(e.target.value) })}
            />
          </label>
          <p className={styles.cardNote} data-severity={gateway.gpa === "below" ? "warning" : undefined}>
            GPA: {GPA_LABEL[gateway.gpa]}
          </p>
          <p className={styles.reqStatus} data-status={OVERALL_TONE[gateway.overall]}>
            {OVERALL_LABEL[gateway.overall]}
          </p>
          {gatewayAttemptLimitNote(gateway) ? (
            <p className={styles.cardNote} data-severity="warning">
              {gatewayAttemptLimitNote(gateway)}
            </p>
          ) : null}
        </section>
      ) : null}

      {tracks.length > 0 ? (
        <section aria-label="Tracks" className={styles.trackSection}>
          <h2 className={styles.trackSectionTitle}>Tracks</h2>
          <p className={styles.cardNote}>
            Prerequisites for applying to a professional school, on top of any major -- never a UMD graduation requirement.
          </p>
          {tracks.map(({ track, requirements, satisfied, inProgress, milestones }) => {
            const manual = track.categories.filter((c) => !c.requirement);
            return (
              <section key={track.id} className={styles.card}>
                <div className={styles.auditHead}>
                  <h3 className={styles.cardTitle}>{track.name}</h3>
                  {!track.verified ? <span className={styles.unverified}>Unverified</span> : null}
                </div>

                {requirements.length > 0 ? (
                  <>
                    <p className={styles.cardNote}>
                      {metText(satisfied, requirements.length, inProgress)}
                    </p>
                    <ul className={styles.reqList}>
                      {requirements.map(({ requirement, result, display, gap }) => (
                        <li key={requirement.id} className={styles.reqRow}>
                          <div className={styles.reqHead}>
                            <span className={styles.reqName}>{requirement.name}</span>
                            <span className={styles.reqStatus} data-status={display}>
                              {REQ_STATUS[display]}
                            </span>
                          </div>
                          <GradeNotes result={result} />
                          {result.assigned.length > 0 ? (
                            <p className={styles.reqAssigned}>
                              Counted: <CourseChips ids={result.assigned} onOpenCourse={onOpenCourse} />
                            </p>
                          ) : null}
                          {gap ? (
                            <p className={styles.reqGap}>
                              Still needed: {gap.need}
                              {gap.suggestions.length > 0 ? (
                                <>
                                  {" "}
                                  For example: <CourseChips ids={gap.suggestions} onOpenCourse={onOpenCourse} />
                                </>
                              ) : null}
                              {gap.note ? ` ${gap.note}` : null}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className={styles.cardNote}>No required UMD courses -- {track.schools} weigh GPA, admission tests and the rest of the application.</p>
                )}
                {manual.length > 0 ? (
                  <p className={styles.cardNote}>Also confirm yourself: {manual.map((c) => c.name ?? c.source).join(", ")}.</p>
                ) : null}

                {showsScienceGpa(track) && scienceGpa.gpa !== null ? (
                  <p className={styles.cardNote}>
                    Science GPA (BCPM): {scienceGpa.gpa.toFixed(2)} ({scienceGpa.credits} credits)
                  </p>
                ) : null}
                {showsScienceGpa(track) && scienceGpa.gpa !== null ? (
                  <p className={styles.cardNote}>
                    {BCPM_CATEGORIES.filter((k) => scienceGpa.byCategory[k].gpa !== null)
                      .map((k) => `${BCPM_LABEL[k]} ${scienceGpa.byCategory[k].gpa!.toFixed(2)}`)
                      .join(" · ")}
                  </p>
                ) : null}

                {milestones.length > 0 ? (
                  <div className={styles.milestoneTimeline}>
                    <h4 className={styles.trackGroupTitle}>Milestones on your plan</h4>
                    {milestoneBuckets(milestones, termOrder).map((bucket) => (
                      <div key={bucket.label} className={styles.milestoneBucket}>
                        <p className={styles.milestoneBucketLabel}>{bucket.label}</p>
                        <ul className={styles.issueList}>
                          {bucket.items.map((m) => (
                            <li key={m.milestone.id} className={styles.issueRow} data-severity="info">
                              <span className={styles.issueSeverity} data-severity="info">
                                {m.monthName} {m.year}
                              </span>
                              <span className={styles.issueText}>
                                <strong>{m.milestone.name}.</strong> {m.milestone.detail}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : null}

                <p className={styles.cardNote}>{track.disclaimer}</p>
              </section>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}

/** Groups a track's milestones onto the plan's own timeline: one bucket per plan term (in the
 * plan's order) that has a milestone, then any milestones after the plan's last term, then any
 * that fall in a season the plan doesn't have a term for (e.g. an unplanned Winter or Summer). */
function milestoneBuckets(milestones: MilestoneTiming[], termOrder: string[]): { label: string; items: MilestoneTiming[] }[] {
  const byTerm = new Map<string, MilestoneTiming[]>();
  const other: MilestoneTiming[] = [];
  const after: MilestoneTiming[] = [];
  for (const m of milestones) {
    if (m.term) byTerm.set(m.term, [...(byTerm.get(m.term) ?? []), m]);
    else if (m.afterLast) after.push(m);
    else other.push(m);
  }
  const buckets = termOrder.filter((name) => byTerm.has(name)).map((name) => ({ label: name, items: byTerm.get(name)! }));
  if (other.length) buckets.unshift({ label: "Not on a planned term", items: other.sort((a, b) => a.year - b.year) });
  if (after.length) buckets.push({ label: "After your last planned term", items: after.sort((a, b) => a.year - b.year) });
  return buckets;
}

const BCPM_CATEGORIES = ["biology", "chemistry", "physics", "math"] as const;
const BCPM_LABEL = { biology: "Biology", chemistry: "Chemistry", physics: "Physics", math: "Math" };

/** Grade notes on a requirement: completed courses that miss its minimum grade, and its minimum-GPA check. */
function GradeNotes({ result }: { result: RequirementResult }) {
  return (
    <>
      {result.belowMinimum?.map((b) => (
        <p key={b.course} className={styles.reqGap}>
          {b.course} ({b.grade}) doesn&apos;t count: this requirement needs {b.minGrade} or better.
        </p>
      ))}
      {result.gpa ? (
        <p className={styles.reqGap} data-severity={result.gpa.value < result.gpa.min ? "warning" : undefined}>
          GPA in these courses: {result.gpa.value.toFixed(2)} (needs {result.gpa.min.toFixed(1)} or higher).
          {result.gpa.atRisk ? " Below the minimum so far: the courses you still have planned need to raise it." : ""}
        </p>
      ) : null}
    </>
  );
}

function CourseChips({ ids, onOpenCourse }: { ids: string[]; onOpenCourse: (c: OpenCourse) => void }) {
  return (
    <>
      {ids.map((id, i) => (
        <span key={id}>
          <button type="button" className={styles.courseLink} onClick={() => onOpenCourse({ id, term: null })}>
            {id}
          </button>
          {i < ids.length - 1 ? ", " : ""}
        </span>
      ))}
    </>
  );
}

const GATEWAY_COURSE_LABEL: Record<GatewayCourseStatus, string> = {
  met: "Met",
  "below-minimum": "Below the minimum grade",
  planned: "Planned",
  missing: "Not planned",
};
const GATEWAY_TONE: Record<GatewayCourseStatus, RequirementResult["status"]> = {
  met: "satisfied",
  planned: "partial",
  missing: "missing",
  "below-minimum": "missing",
};
const GPA_LABEL: Record<"met" | "below" | "unknown", string> = { met: "Meets the minimum", below: "Below the minimum", unknown: "Not entered" };
const OVERALL_LABEL: Record<GatewayOverallStatus, string> = {
  eligible: "Eligible to apply to the CS major",
  "not-yet": "Not eligible yet",
  ineligible: "Not eligible as your record stands",
};
const OVERALL_TONE: Record<GatewayOverallStatus, RequirementResult["status"]> = { eligible: "satisfied", "not-yet": "partial", ineligible: "missing" };
