"use client";

import { useState } from "react";
import { newPlan, planReducer, type AdvisorPlan, type DegreeChoice } from "@/lib/advisor/plan-state";
import { Segmented } from "@/components/Segmented";
import { AUTOMATIC_PROGRAMS, CATALOG_YEARS, collegeOf, degreeModeOf, toggleProgram } from "@/lib/advisor/programs";
import { defaultTerms, startTermOptions } from "@/lib/advisor/terms";
import { examMilestone, toggleTrack, TRACKS, type Track } from "@/lib/advisor/tracks";
import { COLLEGES, type College } from "@turboterp/plan/credit-caps";
import type { Milestone } from "@turboterp/tracks/list";
import styles from "./advisor.module.css";
import { ProgramPicker } from "./ProgramPicker";

const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];

/** First run (plan = null) or editing: majors, catalog year, first term, and pre-professional
 * tracks (owner ruling: a track is a prerequisite for a professional school, not a degree
 * requirement -- it can be added to any major, alongside majors, not in place of one). */
export function SetupView({ plan, onDone, onCancel }: { plan: AdvisorPlan | null; onDone: (plan: AdvisorPlan) => void; onCancel?: () => void }) {
  const thisYear = new Date().getFullYear();
  const terms = startTermOptions(thisYear);
  const [programs, setPrograms] = useState<string[]>(plan?.programs ?? []);
  const [catalogYear, setCatalogYear] = useState<string>(plan?.catalogYear ?? CATALOG_YEARS[0]);
  const [startTerm, setStartTerm] = useState(plan?.startTerm ?? `Fall ${thisYear}`);
  const [college, setCollege] = useState<College>(plan?.college ?? collegeOf(plan?.programs ?? []) ?? COLLEGES[0]!.code);
  const [transfer, setTransfer] = useState(plan?.entry === "transfer");
  const [tracks, setTracks] = useState<string[]>(plan?.tracks ?? []);
  const [degreeChoice, setDegreeChoice] = useState<DegreeChoice | undefined>(plan?.degreeMode);
  const degreeMode = degreeModeOf(programs, degreeChoice);
  const [examTerms, setExamTerms] = useState<Record<string, string>>(plan?.examTerms ?? {});
  const [expectedGrades, setExpectedGrades] = useState<Record<string, Record<string, string>>>(plan?.expectedGrades ?? {});
  const moves = plan !== null && plan.startTerm !== startTerm && plan.terms.some((t) => t.courses.length > 0);

  const done = () => {
    const setup = { programs, catalogYear, startTerm, tracks, examTerms, expectedGrades, college, ...(degreeMode ? { degreeMode } : {}) };
    const entry = transfer ? ("transfer" as const) : ("freshman" as const);
    const next = plan ? planReducer(plan, { type: "setup", ...setup, entry }) : newPlan(setup);
    onDone(!plan && transfer ? { ...next, entry } : next);
  };

  const setExamTerm = (milestoneId: string, term: string) =>
    setExamTerms((prev) => {
      if (term) return { ...prev, [milestoneId]: term };
      const rest = { ...prev };
      delete rest[milestoneId];
      return rest;
    });

  const setExpectedGrade = (term: string, courseId: string, grade: string) =>
    setExpectedGrades((prev) => {
      const termGrades = { ...prev[term] };
      if (grade) termGrades[courseId] = grade;
      else delete termGrades[courseId];
      const next = { ...prev };
      if (Object.keys(termGrades).length) next[term] = termGrades;
      else delete next[term];
      return next;
    });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Advisor</p>
          <h1 className={styles.title}>{plan ? "Edit setup" : "Set up your plan"}</h1>
        </div>
      </header>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Your programs</h2>
        <p className={styles.panelNote}>Pick every major, minor or program you have or want. Tracks of one major replace each other.</p>
        <ProgramPicker label="Programs" selected={programs} onToggle={(id) => setPrograms((p) => toggleProgram(p, id))} />
        {degreeMode ? (
          <div className={styles.degreeChoice}>
            <Segmented<DegreeChoice>
              label="Two majors as"
              options={[
                { value: "double-major", label: "Double major" },
                { value: "double-degree", label: "Double degree" },
              ]}
              value={degreeMode}
              onChange={setDegreeChoice}
            />
            <p className={styles.panelNote}>
              {degreeMode === "double-major"
                ? "One degree with both majors: 120 credits, and courses may count toward both."
                : "Two degrees: 150 credits, with at least 18 credits in each degree that don't count toward the other."}
            </p>
          </div>
        ) : null}
        <p className={styles.panelNote}>
          Always included: {AUTOMATIC_PROGRAMS.map((p) => p.name).join(" and ")}.
        </p>
      </section>

      <section className={styles.panel}>
        <div className={styles.fieldRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Catalog year</span>
            <select className={styles.input} value={catalogYear} onChange={(e) => setCatalogYear(e.target.value)}>
              {CATALOG_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y.replace("-", "–")}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>First term at UMD</span>
            <select className={styles.input} value={startTerm} onChange={(e) => setStartTerm(e.target.value)}>
              {terms.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>College</span>
            <select className={styles.input} value={college} onChange={(e) => setCollege(e.target.value as College)}>
              {COLLEGES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className={styles.checkRow}>
          <input type="checkbox" checked={transfer} onChange={(e) => setTransfer(e.target.checked)} />
          <span>I started at UMD as a transfer student</span>
        </label>
        <p className={styles.panelNote}>
          The catalog year is usually the year you started or declared. Only 2026–27 is available so far. Your college sets
          how many credits you can take in a term before you need approval to go over.
        </p>
        {moves ? <p className={styles.banner} data-tone="warning">Changing your first term moves every course to the matching term.</p> : null}
      </section>

      <TracksPanel
        plan={plan}
        startTerm={startTerm}
        tracks={tracks}
        setTracks={setTracks}
        examTerms={examTerms}
        setExamTerm={setExamTerm}
        expectedGrades={expectedGrades}
        setExpectedGrade={setExpectedGrade}
      />

      <div className={styles.actions}>
        {onCancel ? (
          <button type="button" className={styles.ghostButton} onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button type="button" className={styles.primaryButton} onClick={done} disabled={programs.length === 0}>
          {plan ? "Save" : "Build my plan"}
        </button>
      </div>
      {programs.length === 0 ? <p className={styles.fine}>Pick at least one program to continue.</p> : null}
    </main>
  );
}

/** Every distinct exam a set of chosen tracks' categories point to (examMilestone), with which
 * track names share it -- pre-med and pre-podiatry both use "mcat", so they get one control. */
function sharedExamMilestones(chosen: Track[]): { milestone: Milestone; trackNames: string[] }[] {
  const byId = new Map<string, { milestone: Milestone; trackNames: string[] }>();
  for (const track of chosen) {
    const milestone = examMilestone(track);
    if (!milestone) continue;
    const entry = byId.get(milestone.id) ?? { milestone, trackNames: [] };
    entry.trackNames.push(track.name);
    byId.set(milestone.id, entry);
  }
  return [...byId.values()];
}

function TracksPanel({
  plan,
  startTerm,
  tracks,
  setTracks,
  examTerms,
  setExamTerm,
  expectedGrades,
  setExpectedGrade,
}: {
  plan: AdvisorPlan | null;
  startTerm: string;
  tracks: string[];
  setTracks: (f: (t: string[]) => string[]) => void;
  examTerms: Record<string, string>;
  setExamTerm: (milestoneId: string, term: string) => void;
  expectedGrades: Record<string, Record<string, string>>;
  setExpectedGrade: (term: string, courseId: string, grade: string) => void;
}) {
  const chosen = TRACKS.filter((t) => tracks.includes(t.id));
  const milestones = sharedExamMilestones(chosen);
  const planTerms = plan?.terms.map((t) => t.name) ?? defaultTerms(startTerm);
  const gpaProtectionOn = chosen.some((t) => t.gpaProtection);
  // Not-yet-completed courses, term by term, for expected-grade GPA protection: only meaningful
  // once the plan has courses, so first-run setup (plan === null) shows none of this.
  const plannedByTerm = (plan?.terms ?? [])
    .map((t) => ({ name: t.name, courses: t.courses.filter((c) => c.status !== "completed") }))
    .filter((t) => t.courses.length > 0);

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Pre-professional tracks</h2>
      <p className={styles.panelNote}>
        Optional. A track lists what a professional school expects to see, on top of any major -- never a UMD graduation
        requirement. What-if audits cover chosen tracks too.
      </p>
      <div className={styles.optionList} role="group" aria-label="Pre-professional tracks">
        {TRACKS.map((t) => {
          const on = tracks.includes(t.id);
          return (
            <button key={t.id} type="button" className={styles.option} aria-pressed={on} onClick={() => setTracks((prev) => toggleTrack(prev, t.id))}>
              <span className={styles.optionCheck} aria-hidden="true">
                {on ? "✓" : ""}
              </span>
              <span className={styles.optionText}>
                <span className={styles.optionTitle}>{t.name}</span>
                <span className={styles.optionSub}>For {t.schools}</span>
              </span>
              <span className={styles.unverified} title="The owner hasn't reviewed this track's requirements yet.">
                Unverified
              </span>
            </button>
          );
        })}
      </div>

      {milestones.length > 0 ? (
        <div className={styles.fieldRow}>
          {milestones.map(({ milestone, trackNames }) => (
            <label key={milestone.id} className={styles.field}>
              <span className={styles.fieldLabel}>
                Planned {milestone.name} term {trackNames.length > 1 ? `(${trackNames.join(", ")})` : ""}
              </span>
              <select className={styles.input} value={examTerms[milestone.id] ?? ""} onChange={(e) => setExamTerm(milestone.id, e.target.value)}>
                <option value="">Not entered</option>
                {planTerms.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}

      {gpaProtectionOn && plannedByTerm.length > 0 ? (
        <div className={styles.trackGpaProtection}>
          <p className={styles.panelNote}>
            Expected grades for GPA protection: enter what you expect in a not-yet-completed course to see whether it would lower
            your GPA. Optional; leave any course blank to skip it.
          </p>
          {plannedByTerm.map((term) => (
            <div key={term.name} className={styles.fieldRow}>
              <span className={styles.fieldLabel}>{term.name}</span>
              {term.courses.map((c) => (
                <label key={c.id} className={styles.field}>
                  <span className={styles.fieldLabel}>{c.id}</span>
                  <select
                    className={styles.input}
                    value={expectedGrades[term.name]?.[c.id] ?? ""}
                    onChange={(e) => setExpectedGrade(term.name, c.id, e.target.value)}
                  >
                    <option value="">Not entered</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
