"use client";

// AP, IB and dual-enrollment credit: what each earns, choices to resolve, and credit UMD won't
// double-count ("overkill") shown with its reason. Owner ruling: no source "wins"; overlapping
// credit counts once, and a second source for the same course is overkill, never an error.

import { apExamNames, ibExamNames, type IbLevel } from "@turboterp/credit";
import type { ReactNode } from "react";
import { useState } from "react";
import type { AdvisorPlan, PriorInputs } from "@/lib/advisor/plan-state";
import { creditLabel, ibLevelsFor, removePriorEntry, type Earn, type PriorCreditResult, type PriorEntry } from "@/lib/advisor/prior-credit";
import type { CatalogState } from "./data";
import { dispatchPlan } from "./store";
import styles from "./advisor.module.css";

const AP_EXAMS = apExamNames();
const IB_EXAMS = ibExamNames();
const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `k${Math.random().toString(36).slice(2)}`);

const STATUS_LABEL: Record<PriorEntry["status"], string> = {
  counted: "Counted",
  "no-credit": "No credit at this score",
  "not-counted": "Not counted",
  overkill: "Overkill",
  error: "Error",
};
const STATUS_TONE: Record<PriorEntry["status"], "error" | "confirm" | "info"> = {
  counted: "info",
  "no-credit": "confirm",
  "not-counted": "confirm",
  overkill: "confirm",
  error: "error",
};

const commitPrior = (prior: PriorInputs) => dispatchPlan({ type: "set-prior", prior });

export function PriorCreditView({ plan, prior, catalog }: { plan: AdvisorPlan; prior: PriorCreditResult; catalog: CatalogState }) {
  const remove = (kind: "ap" | "ib" | "dual", key: string) => commitPrior(removePriorEntry(plan.prior, kind, key));
  const pick = (source: string, id: string) => commitPrior({ ...plan.prior, choices: { ...plan.prior.choices, [source]: id } });

  return (
    <div className={styles.creditLayout}>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Prior credit</h2>
        <p className={styles.cardNote}>
          <strong>{prior.totalCredits}</strong> credit{prior.totalCredits === 1 ? "" : "s"} counted toward your plan.
        </p>
        {prior.entries.length === 0 ? (
          <p className={styles.cardNote}>Add an AP or IB exam, or a dual-enrollment course, below.</p>
        ) : (
          <ul className={styles.entryList}>
            {prior.entries.map((entry) => (
              <EntryRow key={entry.key} entry={entry} onRemove={() => remove(entry.kind, entry.key)} onPick={pick} />
            ))}
          </ul>
        )}
      </section>

      {prior.notCounted.length > 0 ? (
        <section className={styles.card} aria-label="Overkill and not-counted credit">
          <h2 className={styles.cardTitle}>Overkill</h2>
          <p className={styles.cardNote}>Credit UMD counts only once; these rows don&apos;t add anything new.</p>
          <ul className={styles.entryList}>
            {prior.notCounted.map((n, i) => (
              <li key={i} className={styles.entryRow}>
                <div className={styles.entryHead}>
                  <span className={styles.issueSeverity} data-severity="confirm">
                    {n.kind === "overkill" ? "Overkill" : "Not counted"}
                  </span>
                  <span className={styles.entrySource}>{n.source}</span>
                </div>
                <p className={styles.reqGap}>{n.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ApForm plan={plan} />
      <IbForm plan={plan} />
      <DualForm plan={plan} catalog={catalog} />
    </div>
  );
}

function EntryRow({
  entry,
  onRemove,
  onPick,
}: {
  entry: PriorEntry;
  onRemove: () => void;
  onPick: (source: string, id: string) => void;
}) {
  return (
    <li className={styles.entryRow}>
      <div className={styles.entryHead}>
        <span className={styles.entrySource}>{entry.source}</span>
        <span className={styles.issueSeverity} data-severity={STATUS_TONE[entry.status]}>
          {STATUS_LABEL[entry.status]}
        </span>
        <button type="button" className={styles.linkButton} onClick={onRemove}>
          Remove
        </button>
      </div>
      {entry.error ? <p className={styles.reqGap}>{entry.error}</p> : null}
      {entry.earns.length > 0 ? (
        <ul className={styles.earnList}>
          {entry.earns.map((earn, i) => (
            <EarnRow key={i} earn={earn} source={entry.source} onPick={onPick} />
          ))}
        </ul>
      ) : null}
      {entry.notes.map((n, i) => (
        <p key={i} className={styles.cardNote}>
          {n}
        </p>
      ))}
    </li>
  );
}

function EarnRow({ earn, source, onPick }: { earn: Earn; source: string; onPick: (source: string, id: string) => void }) {
  if (earn.kind === "course") {
    return (
      <li>
        {creditLabel(earn.id)} · {earn.credits} cr{earn.genEd.length ? ` · ${earn.genEd.join(", ")}` : ""}
      </li>
    );
  }
  if (earn.kind === "generic") {
    return (
      <li>
        {earn.label} · {earn.credits} cr
      </li>
    );
  }
  return (
    <li>
      {earn.credits} cr:{" "}
      <select className={styles.input} value={earn.picked ?? ""} onChange={(e) => onPick(source, e.target.value)}>
        <option value="">Choose one…</option>
        {earn.options.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
      {!earn.picked ? (
        <span className={styles.issueSeverity} data-severity="confirm">
          Pick one to count this credit
        </span>
      ) : null}
    </li>
  );
}

function ApForm({ plan }: { plan: AdvisorPlan }) {
  const [exam, setExam] = useState(AP_EXAMS[0] ?? "");
  const [score, setScore] = useState(5);
  const add = () => {
    commitPrior({ ...plan.prior, ap: [...plan.prior.ap, { key: uid(), exam, score }] });
  };
  return (
    <AddForm title="Add an AP exam" onAdd={add}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Exam</span>
        <select className={styles.input} value={exam} onChange={(e) => setExam(e.target.value)}>
          {AP_EXAMS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Score</span>
        <select className={styles.input} value={score} onChange={(e) => setScore(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </AddForm>
  );
}

function IbForm({ plan }: { plan: AdvisorPlan }) {
  const [exam, setExam] = useState(IB_EXAMS[0] ?? "");
  const levels = ibLevelsFor(exam);
  const [level, setLevel] = useState<IbLevel>(levels[0] ?? "HL");
  const [score, setScore] = useState(6);
  const add = () => {
    commitPrior({ ...plan.prior, ib: [...plan.prior.ib, { key: uid(), exam, level, score }] });
  };
  return (
    <AddForm title="Add an IB exam" onAdd={add}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Exam</span>
        <select
          className={styles.input}
          value={exam}
          onChange={(e) => {
            setExam(e.target.value);
            const ls = ibLevelsFor(e.target.value);
            if (!ls.includes(level)) setLevel(ls[0] ?? "HL");
          }}
        >
          {IB_EXAMS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Level</span>
        <select className={styles.input} value={level} onChange={(e) => setLevel(e.target.value as IbLevel)}>
          {levels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Score</span>
        <select className={styles.input} value={score} onChange={(e) => setScore(Number(e.target.value))}>
          {[7, 6, 5, 4, 3, 2, 1].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </AddForm>
  );
}

function DualForm({ plan, catalog }: { plan: AdvisorPlan; catalog: CatalogState }) {
  const [institution, setInstitution] = useState("");
  const [course, setCourse] = useState("");
  const [credits, setCredits] = useState(3);
  const [elective, setElective] = useState(false);
  const [umd, setUmd] = useState("");
  const ready = catalog.status === "ready" ? catalog : null;
  const valid = institution.trim() !== "" && course.trim() !== "" && (elective || umd.trim() !== "");

  const add = () => {
    commitPrior({
      ...plan.prior,
      dual: [
        ...plan.prior.dual,
        { key: uid(), institution: institution.trim(), course: course.trim(), credits, umd: umd.trim().toUpperCase(), elective },
      ],
    });
    setInstitution("");
    setCourse("");
    setUmd("");
  };

  return (
    <AddForm title="Add a dual-enrollment course" onAdd={add} disabled={!valid}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Institution</span>
        <input className={styles.input} value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. Montgomery College" />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Their course</span>
        <input className={styles.input} value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. MATH181" />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Credits</span>
        <input className={styles.input} type="number" min={1} max={12} value={credits} onChange={(e) => setCredits(Number(e.target.value))} />
      </label>
      <label className={styles.checkRow}>
        <input type="checkbox" checked={elective} onChange={(e) => setElective(e.target.checked)} />
        <span>Transfers as elective credit (no UMD equivalent)</span>
      </label>
      {!elective ? (
        <label className={styles.field}>
          <span className={styles.fieldLabel}>UMD equivalent</span>
          <input className={styles.input} value={umd} onChange={(e) => setUmd(e.target.value)} placeholder="e.g. MATH141" />
        </label>
      ) : null}
      {!ready ? <p className={styles.cardNote}>Course data isn&apos;t built yet, so Gen Ed credit for the UMD equivalent can&apos;t be looked up.</p> : null}
    </AddForm>
  );
}

function AddForm({ title, onAdd, disabled, children }: { title: string; onAdd: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      <form
        className={styles.fieldRow}
        onSubmit={(e) => {
          e.preventDefault();
          onAdd();
        }}
      >
        {children}
        <button type="submit" className={styles.primaryButton} disabled={disabled}>
          Add
        </button>
      </form>
    </section>
  );
}
