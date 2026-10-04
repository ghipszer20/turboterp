"use client";

// A course's detail: catalog facts, prerequisites as printed, the course-wide grade distribution,
// and (when the course is actually in the plan) the actions HTML5 drag-and-drop can't reach on a
// phone: move to another term, mark completed with a grade, or remove it.

import type { PlanIssue } from "@turboterp/plan/check";
import { GRAD_CREDIT_TAGS, isGraduateCourse, type GradCreditTag } from "@turboterp/plan/grad-courses";
import { useEffect, useState } from "react";
import type { CourseDetails } from "@/lib/advisor/course-details";
import { gradeBars, gradeSummary, termSpan } from "@/lib/advisor/grades";
import { SEVERITY } from "@/lib/advisor/issues";
import type { AdvisorPlan } from "@/lib/advisor/plan-state";
import { genEdName } from "@/lib/advisor/words";
import type { CourseGrades } from "@turboterp/ratings";
import type { OpenCourse } from "./AdvisorApp";
import { loadCourseDetails, loadCourseGrades, type CatalogState } from "./data";
import { dispatchPlan } from "./store";
import styles from "./advisor.module.css";

const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "P", "S", "W", "I"];

const GRAD_TAG_LABEL: Record<GradCreditTag, string> = {
  "graduate-only": "Graduate-only (max 9 credits)",
  "bs-ms": "BS/MS double-count",
};

export function CourseSheet({
  course,
  plan,
  catalog,
  issues,
  onClose,
  onOpenCourse,
}: {
  course: OpenCourse;
  plan: AdvisorPlan;
  catalog: CatalogState;
  issues: PlanIssue[];
  onClose: () => void;
  onOpenCourse: (c: OpenCourse) => void;
}) {
  const [detailsState, setDetailsState] = useState<{ id: string; data: CourseDetails | null } | null>(null);
  const [gradesState, setGradesState] = useState<{ id: string; data: CourseGrades | null } | null>(null);
  const details = detailsState?.id === course.id ? detailsState.data : "loading";
  const grades = gradesState?.id === course.id ? gradesState.data : "loading";
  const ready = catalog.status === "ready" ? catalog : null;
  const info = ready?.catalog.get(course.id);

  const term = plan.terms.find((t) => t.courses.some((c) => c.id === course.id));
  const planned = term?.courses.find((c) => c.id === course.id);

  useEffect(() => {
    let live = true;
    loadCourseDetails(course.id).then((d) => {
      if (live) setDetailsState({ id: course.id, data: d });
    });
    loadCourseGrades(course.id).then((g) => {
      if (live) setGradesState({ id: course.id, data: g });
    });
    return () => {
      live = false;
    };
  }, [course.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const credits = planned?.credits ?? info?.credits.min ?? null;
  const otherTerms = plan.terms.map((t) => t.name).filter((n) => n !== term?.name);

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={course.id}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.sheetHead}>
          <div>
            <p className={styles.sheetId}>{course.id}</p>
            <h2 className={styles.sheetTitle}>{info?.title ?? (ready ? "Not in TurboTerp's course data" : "Loading…")}</h2>
          </div>
          <button type="button" className={styles.iconButton} aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.sheetMeta}>
          {isGraduateCourse(course.id) ? <span className={styles.gradBadge}>Grad</span> : null}
          {credits !== null ? <span>{credits} credits</span> : null}
          {info?.genEd.map((g) => (
            <span key={g} className={styles.tag}>
              {genEdName(g)}
            </span>
          ))}
          {term ? <span>{term.name}</span> : <span>Not in your plan</span>}
        </div>

        {issues.length > 0 ? (
          <ul className={styles.sheetIssues}>
            {issues.map((issue, i) => (
              <li key={i} className={styles.inlineIssue} data-severity={issue.severity}>
                <strong>{SEVERITY[issue.severity].label}.</strong> {issue.message}
              </li>
            ))}
          </ul>
        ) : null}

        <section className={styles.sheetSection}>
          <h3 className={styles.sheetHeading}>Details</h3>
          {details === "loading" ? (
            <p className={styles.cardNote}>Loading…</p>
          ) : details === null ? (
            <p className={styles.cardNote}>No description on file for this course.</p>
          ) : (
            <>
              {details.description ? <p className={styles.sheetText}>{details.description}</p> : null}
              <dl className={styles.sheetFacts}>
                {details.prerequisite ? <Fact label="Prerequisite" value={details.prerequisite} onOpenCourse={onOpenCourse} /> : null}
                {details.corequisite ? <Fact label="Corequisite" value={details.corequisite} onOpenCourse={onOpenCourse} /> : null}
                {details.restriction ? <Fact label="Restriction" value={details.restriction} onOpenCourse={onOpenCourse} /> : null}
                {details.creditOnlyGrantedFor ? (
                  <Fact label="Credit only granted for" value={details.creditOnlyGrantedFor} onOpenCourse={onOpenCourse} />
                ) : null}
              </dl>
            </>
          )}
        </section>

        <section className={styles.sheetSection}>
          <h3 className={styles.sheetHeading}>Grades</h3>
          {grades === "loading" ? (
            <p className={styles.cardNote}>Loading…</p>
          ) : grades === null ? (
            <p className={styles.cardNote}>No grade data</p>
          ) : (
            <GradeChart grades={grades} />
          )}
        </section>

        {term ? (
          <section className={styles.sheetSection}>
            <h3 className={styles.sheetHeading}>Actions</h3>
            <div className={styles.sheetActions}>
              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={planned?.status === "completed"}
                  onChange={(e) =>
                    dispatchPlan({
                      type: "set-course",
                      term: term.name,
                      id: course.id,
                      status: e.target.checked ? "completed" : undefined,
                      grade: e.target.checked ? planned?.grade : undefined,
                    })
                  }
                />
                <span>Completed</span>
              </label>
              {planned?.status === "completed" ? (
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Grade</span>
                  <select
                    className={styles.input}
                    value={planned.grade ?? ""}
                    onChange={(e) =>
                      dispatchPlan({ type: "set-course", term: term.name, id: course.id, status: "completed", grade: e.target.value || undefined })
                    }
                  >
                    <option value="">Not entered</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              {isGraduateCourse(course.id) ? (
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Credit counts as</span>
                  <select
                    className={styles.input}
                    value={planned?.gradTag ?? "undergrad"}
                    onChange={(e) => {
                      const value = e.target.value;
                      dispatchPlan({
                        type: "set-grad-tag",
                        term: term.name,
                        id: course.id,
                        gradTag: value === "undergrad" ? undefined : (value as GradCreditTag),
                      });
                    }}
                  >
                    <option value="undergrad">Undergrad credit</option>
                    {GRAD_CREDIT_TAGS.map((tag) => (
                      <option key={tag} value={tag}>
                        {GRAD_TAG_LABEL[tag]}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              {planned?.gradTag === "bs-ms" ? (
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Master&apos;s credits (for the 35% BS/MS cap)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={0}
                    step={1}
                    value={plan.mastersCredits ?? ""}
                    placeholder="Not entered"
                    onChange={(e) =>
                      dispatchPlan({
                        type: "set-masters-credits",
                        mastersCredits: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </label>
              ) : null}
              {otherTerms.length > 0 ? (
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Move to</span>
                  <select
                    className={styles.input}
                    value=""
                    onChange={(e) => {
                      if (e.target.value) dispatchPlan({ type: "move-course", id: course.id, from: term.name, to: e.target.value });
                    }}
                  >
                    <option value="">Choose a term…</option>
                    {otherTerms.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <button
                type="button"
                className={styles.dangerButton}
                onClick={() => {
                  dispatchPlan({ type: "remove-course", term: term.name, id: course.id });
                  onClose();
                }}
              >
                Remove from {term.name}
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

const COURSE_ID = /\b[A-Z]{4}\d{3}[A-Z]?\b/g;

/** As-printed requirement text, with course codes as buttons that open that course's sheet. */
function Fact({ label, value, onOpenCourse }: { label: string; value: string; onOpenCourse: (c: OpenCourse) => void }) {
  const parts = value.split(COURSE_ID);
  const codes = value.match(COURSE_ID) ?? [];
  return (
    <div className={styles.sheetFact}>
      <dt>{label}</dt>
      <dd>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {codes[i] ? (
              <button type="button" className={styles.courseLink} onClick={() => onOpenCourse({ id: codes[i]!, term: null })}>
                {codes[i]}
              </button>
            ) : null}
          </span>
        ))}
      </dd>
    </div>
  );
}

function GradeChart({ grades }: { grades: CourseGrades }) {
  const bars = gradeBars(grades.overall);
  const summary = gradeSummary(grades.overall);
  return (
    <div>
      <p className={styles.gradeSummary}>
        {summary.gpa ? <span>Average GPA {summary.gpa}</span> : null}
        <span>{summary.students}</span>
        <span>{termSpan(grades.terms)}</span>
      </p>
      <div className={styles.gradeBars} role="img" aria-label="Grade distribution">
        {bars.map((b) => (
          <div key={b.label} className={styles.gradeBar}>
            <span className={styles.gradeBarFill} style={{ height: `${Math.round(b.height * 100)}%` }} />
            <span className={styles.gradeBarLabel}>{b.label}</span>
            <span className={styles.gradeBarShare}>{Math.round(b.share * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
