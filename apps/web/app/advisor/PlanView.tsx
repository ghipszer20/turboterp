"use client";

import type { AcademicEvent } from "@turboterp/campus-data";
import type { PlanIssue } from "@turboterp/plan/check";
import { isGraduateCourse } from "@turboterp/plan/grad-courses";
import type { TermDifficulty } from "@turboterp/plan/difficulty";
import { useEffect, useMemo, useState } from "react";
import { planDifficulty } from "@/lib/advisor/difficulty";
import { cardNote, courseKey, type IssueGroups, type Severity } from "@/lib/advisor/issues";
import type { AdvisorPlan, PlanTermState } from "@/lib/advisor/plan-state";
import type { PriorCreditResult } from "@/lib/advisor/prior-credit";
import { formatKeyDates, termKeyDates } from "@/lib/calendar";
import { PROGRAM_OPTIONS } from "@/lib/advisor/programs";
import { legendCategories, rowCategory, type RowCategory } from "@/lib/advisor/row-category";
import { searchCourses } from "@/lib/advisor/search";
import { academicYears, parseTerm } from "@/lib/advisor/terms";
import type { AnalysisState, OpenCourse } from "./AdvisorApp";
import { CheckCounts, Notices, PlanTips, ProgramChecks, TermIssue } from "./ChecksPanel";
import { loadCourseGrades, type CatalogState } from "./data";
import { dispatchPlan, openView } from "./store";
import styles from "./advisor.module.css";

type Checked = { issues: PlanIssue[]; groups: IssueGroups } | null;

export function PlanView({
  plan,
  catalog,
  checked,
  analysis,
  prior,
  calendar,
  onOpenCourse,
}: {
  plan: AdvisorPlan;
  catalog: CatalogState;
  checked: Checked;
  analysis: AnalysisState;
  prior: PriorCreditResult;
  calendar: AcademicEvent[];
  onOpenCourse: (c: OpenCourse) => void;
}) {
  const years = academicYears(plan.terms.map((t) => t.name));
  const byName = new Map(plan.terms.map((t) => [t.name, t]));
  const ready = catalog.status === "ready" ? catalog : null;
  const creditsOf = (id: string, own?: number) => own ?? ready?.catalog.get(id)?.credits.min ?? null;
  const total = plan.terms.reduce((t, term) => t + term.courses.reduce((s, c) => s + (creditsOf(c.id, c.credits) ?? 0), 0), 0);
  const lastTerm = plan.terms.at(-1)?.name;
  const [difficulty, setDifficulty] = useState<Map<string, TermDifficulty>>(new Map());
  useEffect(() => {
    if (!ready) return;
    let live = true;
    planDifficulty(plan, creditsOf, loadCourseGrades).then((d) => live && setDifficulty(d));
    return () => {
      live = false;
    };
    // creditsOf is derived from the catalog, so the plan and catalog status cover it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, ready]);

  const cats = useMemo(() => {
    const kinds = Object.fromEntries(PROGRAM_OPTIONS.map((p) => [p.id, p.kind]));
    const m = new Map<string, RowCategory>();
    if (analysis.result) for (const t of plan.terms) for (const c of t.courses) m.set(c.id, rowCategory(c.id, analysis.result, kinds));
    return m;
  }, [analysis.result, plan.terms]);
  const catOf = (id: string): RowCategory => cats.get(id) ?? "other";
  const legend = legendCategories(plan.terms.flatMap((t) => t.courses.map((c) => catOf(c.id))));

  return (
    <div>
      <div>
        <div className={styles.summaryBar}>
          <span className={styles.summaryMain}>
            <span>
              <strong>{total + prior.totalCredits}</strong> credits planned
              {prior.totalCredits > 0 ? ` (${prior.totalCredits} from prior credit)` : ""}
            </span>
            <CheckCounts checked={checked} />
          </span>
          <button type="button" className={styles.linkButton} onClick={() => openView("credit")}>
            {prior.entries.length ? "Edit prior credit" : "Add AP, IB or college credit"}
          </button>
        </div>
        <Notices analysis={analysis} />
        <ProgramChecks analysis={analysis} onOpenCourse={onOpenCourse} />

        {years.map((year, i) => (
          <section key={year.label} className={styles.year} aria-label={`Year ${i + 1}, ${year.label}`}>
            <h2 className={styles.yearTitle}>
              Year {i + 1} <span>{year.label}</span>
            </h2>
            <div className={styles.terms}>
              {year.terms.map((name) => (
                <TermColumn
                  key={name}
                  term={byName.get(name)!}
                  catalog={catalog}
                  groups={checked?.groups ?? null}
                  creditsOf={creditsOf}
                  catOf={catOf}
                  keyDates={formatKeyDates(termKeyDates(calendar, name, name === lastTerm))}
                  difficulty={difficulty.get(name)}
                  onOpenCourse={onOpenCourse}
                />
              ))}
            </div>
            <OptionalTerms yearTerms={year.terms} />
          </section>
        ))}
        {lastTerm ? (
          <div className={styles.optionalTerms}>
            <button type="button" className={styles.addTerm} onClick={() => dispatchPlan({ type: "add-term", name: nextMainTerm(lastTerm) })}>
              + Add {nextMainTerm(lastTerm)}
            </button>
            {plan.terms.length > 1 ? (
              <button
                type="button"
                className={styles.smallButton}
                onClick={() => {
                  const n = byName.get(lastTerm)!.courses.length;
                  if (n === 0 || confirm(`Are you sure you want to delete ${lastTerm} and its ${n} course(s)?`)) dispatchPlan({ type: "remove-term", name: lastTerm });
                }}
              >
                Remove {lastTerm}
              </button>
            ) : null}
          </div>
        ) : null}
        {legend.length ? (
          <div className={styles.legend} aria-label="Course colors">
            {legend.map((c) => (
              <span key={c} data-cat={c}>
                <i aria-hidden="true" />
                {LEGEND_LABELS[c]}
              </span>
            ))}
          </div>
        ) : null}
        <PlanTips checked={checked} analysis={analysis} />
      </div>
    </div>
  );
}

const LEGEND_LABELS: Record<RowCategory, string> = {
  major: "Major",
  gened: "Gen Ed",
  college: "College",
  elective: "Elective",
  other: "Other",
};

function nextMainTerm(last: string): string {
  const t = parseTerm(last)!;
  return t.season === "Fall" ? `Spring ${t.year + 1}` : `Fall ${t.year}`;
}

/** "+ Winter" and "+ Summer" for an academic year that doesn't have them. */
function OptionalTerms({ yearTerms }: { yearTerms: string[] }) {
  const fall = yearTerms.map(parseTerm).find((t) => t?.season === "Fall");
  const spring = yearTerms.map(parseTerm).find((t) => t?.season === "Spring");
  const next = fall ? fall.year + 1 : spring?.year;
  if (next === undefined) return null;
  const missing = [
    ...(fall && !yearTerms.includes(`Winter ${next}`) ? [`Winter ${next}`] : []),
    ...(!yearTerms.includes(`Summer ${next}`) ? [`Summer ${next}`] : []),
  ];
  if (missing.length === 0) return null;
  return (
    <div className={styles.optionalTerms}>
      {missing.map((name) => (
        <button key={name} type="button" className={styles.smallButton} onClick={() => dispatchPlan({ type: "add-term", name })}>
          + {name}
        </button>
      ))}
    </div>
  );
}

const DRAG_TYPE = "application/x-turboterp-course";

function TermColumn({
  term,
  catalog,
  groups,
  creditsOf,
  catOf,
  keyDates,
  difficulty,
  onOpenCourse,
}: {
  term: PlanTermState;
  catalog: CatalogState;
  groups: IssueGroups | null;
  creditsOf: (id: string, own?: number) => number | null;
  catOf: (id: string) => RowCategory;
  keyDates: string;
  difficulty: TermDifficulty | undefined;
  onOpenCourse: (c: OpenCourse) => void;
}) {
  const [over, setOver] = useState(false);
  const season = parseTerm(term.name)?.season;
  const optional = season === "Winter" || season === "Summer";
  const credits = term.courses.reduce((t, c) => t + (creditsOf(c.id, c.credits) ?? 0), 0);
  const unknown = term.courses.some((c) => creditsOf(c.id, c.credits) === null);
  // Info (a light term) is a tip in the Checks card, not a banner on every term.
  const termIssues = (groups?.byTerm.get(term.name) ?? []).filter((i) => i.severity !== "info");
  const ready = catalog.status === "ready" ? catalog : null;

  const drop = (e: React.DragEvent, index?: number) => {
    const raw = e.dataTransfer.getData(DRAG_TYPE);
    if (!raw) return;
    e.preventDefault();
    e.stopPropagation();
    setOver(false);
    const { id, from } = JSON.parse(raw) as { id: string; from: string };
    dispatchPlan({ type: "move-course", id, from, to: term.name, ...(index !== undefined ? { index } : {}) });
  };

  return (
    <div
      className={styles.term}
      data-optional={optional || undefined}
      data-error={termIssues.some((i) => i.severity === "error") || undefined}
      data-over={over || undefined}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(DRAG_TYPE)) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => drop(e)}
    >
      <div className={styles.termHead}>
        <h3 className={styles.termName}>{term.name}</h3>
        <span className={styles.termCredits} data-severity={termIssues.some((i) => i.kind === "credit-load") ? "error" : undefined}>
          {credits}
          {unknown ? "+" : ""} cr
        </span>
        {difficulty ? (
          <span
            className={styles.difficultyBadge}
            data-level={difficulty.score >= 8 ? "high" : undefined}
            title="An estimate from course averages, credit load and your grades"
          >
            Difficulty {difficulty.score}/10 · estimate
          </span>
        ) : null}
        {optional ? (
          <button
            type="button"
            className={styles.iconButton}
            aria-label={`Remove ${term.name}`}
            onClick={() => {
              if (term.courses.length === 0 || confirm(`Are you sure you want to delete ${term.name} and its ${term.courses.length} course(s)?`))
                dispatchPlan({ type: "remove-term", name: term.name });
            }}
          >
            ×
          </button>
        ) : null}
      </div>
      {keyDates ? <p className={styles.keyDates}>Key dates: {keyDates}</p> : null}
      {difficulty ? <p className={styles.difficultyText}>{difficulty.sentence}</p> : null}
      {termIssues.map((issue, i) => (
        <TermIssue key={i} issue={issue} />
      ))}
      <ul className={styles.courseList}>
        {term.courses.map((c, index) => {
          const key = courseKey(term.name, c.id);
          const issues = groups?.byCourse.get(key) ?? [];
          const worst: Severity | undefined = groups?.worstByCourse.get(key);
          const info = ready?.catalog.get(c.id);
          const cr = creditsOf(c.id, c.credits);
          return (
            <li
              key={c.id}
              className={styles.courseCard}
              data-severity={worst}
              data-cat={catOf(c.id)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(DRAG_TYPE, JSON.stringify({ id: c.id, from: term.name }));
                e.dataTransfer.effectAllowed = "move";
              }}
              onDrop={(e) => drop(e, index)}
            >
              <button type="button" className={styles.courseButton} onClick={() => onOpenCourse({ id: c.id, term: term.name })}>
                <span className={styles.courseTop}>
                  <span className={styles.courseIdRow}>
                    <span className={styles.courseId}>{c.id}</span>
                    {isGraduateCourse(c.id) ? <span className={styles.gradBadge}>Grad</span> : null}
                  </span>
                  <span className={styles.courseCredits}>{cr === null ? "?" : cr} cr</span>
                </span>
                <span className={styles.courseTitle}>{info?.title ?? (ready ? "Not in TurboTerp's course data" : " ")}</span>
                {issues.length > 0 ? (
                  <span className={styles.courseIssue} data-severity={worst}>
                    {cardNote(issues)}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <AddCourse term={term} catalog={catalog} />
    </div>
  );
}

function AddCourse({ term, catalog }: { term: PlanTermState; catalog: CatalogState }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const list = catalog.status === "ready" ? catalog.list : null;
  const results = useMemo(() => (list ? searchCourses(list, query, 8) : []), [list, query]);
  const typedId = query.replace(/\s+/g, "").toUpperCase();
  const looksLikeId = /^[A-Z]{4}\d{3}[A-Z]?$/.test(typedId) && !results.some((r) => r.id === typedId);

  const add = (id: string) => {
    dispatchPlan({ type: "add-course", term: term.name, id });
    setQuery("");
  };

  if (!open) {
    return (
      <button type="button" className={styles.addCourse} onClick={() => setOpen(true)}>
        + Add course
      </button>
    );
  }
  return (
    <div className={styles.search}>
      <input
        className={styles.input}
        autoFocus
        value={query}
        placeholder="Course or title, e.g. CMSC351"
        aria-label={`Add a course to ${term.name}`}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Enter") {
            e.preventDefault();
            if (results[0]) add(results[0].id);
            else if (looksLikeId) add(typedId);
          }
        }}
      />
      {query.trim() ? (
        <ul className={styles.results} role="listbox" aria-label="Matching courses">
          {results.map((r) => {
            const inTerm = term.courses.some((c) => c.id === r.id);
            return (
              <li key={r.id}>
                <button type="button" className={styles.result} disabled={inTerm} onClick={() => add(r.id)}>
                  <span className={styles.courseId}>{r.id}</span>
                  <span className={styles.resultTitle}>{r.title}</span>
                  <span className={styles.courseCredits}>{inTerm ? "Added" : `${r.credits} cr`}</span>
                </button>
              </li>
            );
          })}
          {looksLikeId ? (
            <li>
              <button type="button" className={styles.result} onClick={() => add(typedId)}>
                <span className={styles.courseId}>{typedId}</span>
                <span className={styles.resultTitle}>Add anyway (not in this term&apos;s Schedule of Classes)</span>
              </button>
            </li>
          ) : null}
          {results.length === 0 && !looksLikeId ? <li className={styles.noResults}>No matching courses</li> : null}
        </ul>
      ) : null}
      <button type="button" className={styles.linkButton} onClick={() => setOpen(false)}>
        Done
      </button>
    </div>
  );
}
