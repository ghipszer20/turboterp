"use client";

// Import a Testudo unofficial transcript into the plan. Owner ruling: parsed entirely in the
// student's browser (the file never leaves their device); three ways in -- a text-bearing PDF
// (read directly with pdfjs), a "paste from Testudo" box, and an on-device OCR fallback for PDFs
// with no text layer (Testudo's own download button produces those). Nothing is applied until the
// student reviews the parsed rows and confirms.

import { apExamNames } from "@turboterp/credit";
import { useMemo, useState } from "react";
import { selectApLines } from "@/lib/advisor/transcript-ap-select";
import { selectDualLines, selectIbLines } from "@/lib/advisor/transcript-ib-select";
import { applyTranscriptImport, type SelectedAp, type SelectedCourse } from "@/lib/advisor/transcript-apply";
import type { AdvisorPlan } from "@/lib/advisor/plan-state";
import { parseTranscriptText, type ParsedCourse, type ParsedTranscript, type Source } from "@/lib/advisor/transcript-parse";
import styles from "./advisor.module.css";

const AP_EXAM_NAMES = apExamNames();

type Stage =
  | { kind: "input" }
  | { kind: "reading"; detail: string }
  | { kind: "review"; parsed: ParsedTranscript; source: Source }
  | { kind: "error"; message: string };

export function ImportTranscriptView({ plan, onDone, onCancel }: { plan: AdvisorPlan; onDone: (plan: AdvisorPlan) => void; onCancel: () => void }) {
  const [stage, setStage] = useState<Stage>({ kind: "input" });
  const [pasted, setPasted] = useState("");

  const handleFile = async (file: File) => {
    setStage({ kind: "reading", detail: "Reading the PDF…" });
    try {
      const { extractPdfText } = await import("@/lib/advisor/transcript-pdf");
      const extracted = await extractPdfText(file);
      if (extracted.hasTextLayer) {
        setStage({ kind: "review", parsed: parseTranscriptText(extracted.text, "pdf"), source: "pdf" });
        return;
      }
      setStage({ kind: "reading", detail: "No text found in this PDF -- reading it with on-device OCR. This can take a minute…" });
      const { ocrPdfText } = await import("@/lib/advisor/transcript-ocr");
      const text = await ocrPdfText(file, (page, totalPages, progress) =>
        setStage({ kind: "reading", detail: `Reading page ${page} of ${totalPages} with on-device OCR… ${Math.round(progress * 100)}%` }),
      );
      setStage({ kind: "review", parsed: parseTranscriptText(text, "ocr"), source: "ocr" });
    } catch {
      setStage({ kind: "error", message: "Couldn't read that PDF. Try the \"paste from Testudo\" box instead." });
    }
  };

  const parsePasted = () => {
    if (!pasted.trim()) return;
    setStage({ kind: "review", parsed: parseTranscriptText(pasted, "paste"), source: "paste" });
  };

  if (stage.kind === "review") {
    return (
      <ReviewStage
        plan={plan}
        parsed={stage.parsed}
        onDone={onDone}
        onCancel={onCancel}
        onStartOver={() => setStage({ kind: "input" })}
      />
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Advisor</p>
          <h1 className={styles.title}>Import transcript</h1>
        </div>
      </header>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Why import?</h2>
        <p className={styles.panelNote}>
          Optional. Your past courses and grades let TurboTerp personalize its feedback on your 4-year plan and class schedule --
          for example, how hard each upcoming semester is likely to feel for you -- and they fill in what you&apos;ve already
          taken, so your audit starts out accurate.
        </p>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>From a Testudo unofficial transcript</h2>
        <p className={styles.panelNote}>
          Everything here happens on this device -- the file is never uploaded anywhere. Upload the PDF Testudo gives you, or
          copy the page (select all, copy) and paste it below.
        </p>

        <div className={styles.fieldRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Unofficial transcript PDF</span>
            <input
              className={styles.input}
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </label>
        </div>

        {stage.kind === "reading" ? (
          <p className={styles.banner} data-tone="warning">
            {stage.detail}
          </p>
        ) : null}
        {stage.kind === "error" ? <p className={styles.error}>{stage.message}</p> : null}

        <p className={styles.panelNote}>Or paste from Testudo&apos;s unofficial transcript page:</p>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Pasted transcript text</span>
          <textarea
            className={styles.input}
            rows={6}
            style={{ width: "100%", resize: "vertical", fontFamily: "monospace" }}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder="Select all on Testudo's unofficial transcript page, copy, and paste here"
          />
        </label>
        <div className={styles.actions}>
          <button type="button" className={styles.ghostButton} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={styles.primaryButton} onClick={parsePasted} disabled={!pasted.trim()}>
            Read pasted text
          </button>
        </div>
      </section>
    </main>
  );
}

function ReviewStage({
  plan,
  parsed,
  onDone,
  onCancel,
  onStartOver,
}: {
  plan: AdvisorPlan;
  parsed: ParsedTranscript;
  onDone: (plan: AdvisorPlan) => void;
  onCancel: () => void;
  onStartOver: () => void;
}) {
  const [courseChecked, setCourseChecked] = useState<boolean[]>(() => parsed.courses.map(() => true));

  // Collapses repeated lines for the same exam to one (keeping the highest score -- Testudo lists
  // one AP line per course equivalency, so the same exam can print several times) and pulls the
  // Calculus BC AB Subscore out as an info-only row when a Calculus BC line is also present.
  const apSelection = useMemo(() => selectApLines(parsed.apLines, AP_EXAM_NAMES), [parsed.apLines]);
  const matchedAp = apSelection.matched;
  const infoAp = apSelection.info;
  const unmatchedAp = apSelection.unmatched;
  const gpaFound = parsed.cumulativeGpa;
  const [gpaChecked, setGpaChecked] = useState(true);
  const [apChecked, setApChecked] = useState<boolean[]>(() => matchedAp.map(() => true));
  const ibSelection = useMemo(() => selectIbLines(parsed.ibLines), [parsed.ibLines]);
  const dualSelection = useMemo(() => selectDualLines(parsed.dualLines), [parsed.dualLines]);
  const matchedIb = ibSelection.matched;
  const matchedDual = dualSelection.matched;
  const [ibChecked, setIbChecked] = useState<boolean[]>(() => matchedIb.map(() => true));
  const [dualChecked, setDualChecked] = useState<boolean[]>(() => matchedDual.map(() => true));
  const notRecognized = [...unmatchedAp, ...ibSelection.unmatched, ...dualSelection.unmatched];

  const termGroups = useMemo(() => {
    const order: string[] = [];
    const byTerm = new Map<string, { course: ParsedCourse; index: number }[]>();
    parsed.courses.forEach((course, index) => {
      if (!byTerm.has(course.term)) {
        byTerm.set(course.term, []);
        order.push(course.term);
      }
      byTerm.get(course.term)!.push({ course, index });
    });
    return order.map((term) => ({ term, rows: byTerm.get(term)! }));
  }, [parsed.courses]);

  const anyChecked = courseChecked.some(Boolean) || apChecked.some(Boolean) || ibChecked.some(Boolean) || dualChecked.some(Boolean) || (gpaFound !== null && gpaChecked);

  const confirm = () => {
    const courses: SelectedCourse[] = parsed.courses
      .filter((_, i) => courseChecked[i])
      .map((c) => ({
        term: c.term,
        code: c.code,
        grade: c.grade,
        credits: c.earnedCredits ?? c.attemptedCredits,
        status: c.status,
      }));
    const ap: SelectedAp[] = matchedAp.filter((_, i) => apChecked[i]).map((a) => ({ exam: a.exam, score: a.score, ...(a.pick ? { pick: a.pick } : {}) }));
    const ib = matchedIb.filter((_, i) => ibChecked[i]).map((b) => ({ exam: b.exam, level: b.level, score: b.score }));
    const dual = matchedDual
      .filter((_, i) => dualChecked[i])
      .map((d) => ({ institution: d.institution, course: d.course, credits: d.credits, umd: d.umd, elective: d.elective }));
    onDone(applyTranscriptImport(plan, { courses, ap, ib, dual, gpa: gpaFound && gpaChecked ? gpaFound.value : null }));
  };

  const toggle = (arr: boolean[], set: (v: boolean[]) => void, i: number) => set(arr.map((v, j) => (i === j ? !v : v)));

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Advisor</p>
          <h1 className={styles.title}>Review import</h1>
        </div>
      </header>

      <p className={styles.panelNote}>
        Check what looks right. Anything marked &quot;check this&quot; was read from noisy source text (OCR, or a garbled PDF
        text layer) and repaired automatically -- worth a second look. Nothing is added to your plan until you confirm below.
      </p>

      {termGroups.length === 0 && matchedAp.length === 0 && matchedIb.length === 0 && matchedDual.length === 0 && notRecognized.length === 0 ? (
        <p className={styles.cardNote}>Nothing recognizable was found in that text.</p>
      ) : null}

      {termGroups.map(({ term, rows }) => (
        <section className={styles.card} key={term}>
          <h2 className={styles.cardTitle}>{term}</h2>
          <ul className={styles.entryList}>
            {rows.map(({ course, index }) => (
              <li key={index} className={styles.entryRow}>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={courseChecked[index]} onChange={() => toggle(courseChecked, setCourseChecked, index)} />
                  <div className={styles.entryHead}>
                    <span className={styles.entrySource}>
                      {course.code}
                      {course.title ? ` -- ${course.title}` : ""}
                    </span>
                    {course.flagged ? (
                      <span className={styles.issueSeverity} data-severity="confirm">
                        Check this
                      </span>
                    ) : null}
                  </div>
                </label>
                <p className={styles.cardNote}>
                  {course.status === "in-progress" ? "In progress" : (course.grade ?? "No grade read")}
                  {course.attemptedCredits !== null ? ` · ${course.attemptedCredits} cr` : ""}
                  {course.genEd.length ? ` · ${course.genEd.join(", ")}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {gpaFound ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Cumulative GPA</h2>
          <label className={styles.checkRow}>
            <input type="checkbox" checked={gpaChecked} onChange={() => setGpaChecked(!gpaChecked)} />
            <div className={styles.entryHead}>
              <span className={styles.entrySource}>{gpaFound.value.toFixed(2)} (from your transcript)</span>
              {gpaFound.flagged ? (
                <span className={styles.issueSeverity} data-severity="confirm">
                  Check this
                </span>
              ) : null}
            </div>
          </label>
        </section>
      ) : null}

      {matchedAp.length > 0 ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>AP exams</h2>
          <ul className={styles.entryList}>
            {matchedAp.map((a, i) => (
              <li key={i} className={styles.entryRow}>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={apChecked[i]} onChange={() => toggle(apChecked, setApChecked, i)} />
                  <div className={styles.entryHead}>
                    <span className={styles.entrySource}>
                      AP {a.exam} ({a.score})
                    </span>
                    {a.flagged ? (
                      <span className={styles.issueSeverity} data-severity="confirm">
                        Check this
                      </span>
                    ) : null}
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {matchedIb.length > 0 ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>IB exams</h2>
          <ul className={styles.entryList}>
            {matchedIb.map((b, i) => (
              <li key={i} className={styles.entryRow}>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={ibChecked[i]} onChange={() => toggle(ibChecked, setIbChecked, i)} />
                  <div className={styles.entryHead}>
                    <span className={styles.entrySource}>
                      IB {b.exam} {b.level} ({b.score})
                    </span>
                    {b.flagged ? (
                      <span className={styles.issueSeverity} data-severity="confirm">
                        Check this
                      </span>
                    ) : null}
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {matchedDual.length > 0 ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>College credit</h2>
          <ul className={styles.entryList}>
            {matchedDual.map((d, i) => (
              <li key={i} className={styles.entryRow}>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={dualChecked[i]} onChange={() => toggle(dualChecked, setDualChecked, i)} />
                  <div className={styles.entryHead}>
                    <span className={styles.entrySource}>
                      {d.institution}: {d.course} {d.title} ({d.credits} credits, {d.elective ? "elective" : d.umd})
                    </span>
                    {d.flagged ? (
                      <span className={styles.issueSeverity} data-severity="confirm">
                        Check this
                      </span>
                    ) : null}
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {infoAp.length > 0 ? (
        <section className={styles.card} aria-label="AP exam information">
          <h2 className={styles.cardTitle}>Also on the transcript</h2>
          <ul className={styles.entryList}>
            {infoAp.map((a, i) => (
              <li key={i} className={styles.entryRow}>
                <div className={styles.entryHead}>
                  <span className={styles.entrySource}>
                    AP {a.exam} ({a.score})
                  </span>
                  <span className={styles.issueSeverity} data-severity="info">
                    Info
                  </span>
                </div>
                <p className={styles.cardNote}>{a.note}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {notRecognized.length > 0 ? (
        <section className={styles.card} aria-label="Credit not recognized">
          <h2 className={styles.cardTitle}>Not recognized</h2>
          <p className={styles.cardNote}>
            Couldn&apos;t match these to UMD&apos;s AP or IB charts, or they carry no credit -- add them by hand in Prior
            credit if they&apos;re real.
          </p>
          <ul className={styles.entryList}>
            {notRecognized.map((a, i) => (
              <li key={i} className={styles.entryRow}>
                {a.raw}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {parsed.unparsed.length > 0 ? (
        <section className={styles.card} aria-label="Lines that couldn't be read">
          <h2 className={styles.cardTitle}>Couldn&apos;t read {parsed.unparsed.length === 1 ? "this line" : "these lines"}</h2>
          <ul className={styles.entryList}>
            {parsed.unparsed.map((u, i) => (
              <li key={i} className={styles.entryRow}>
                <span className={styles.entrySource}>{u.raw}</span>
                <p className={styles.cardNote}>{u.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className={styles.actions}>
        <button type="button" className={styles.ghostButton} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className={styles.ghostButton} onClick={onStartOver}>
          Start over
        </button>
        <button type="button" className={styles.primaryButton} onClick={confirm} disabled={!anyChecked}>
          Confirm import
        </button>
      </div>
    </main>
  );
}
