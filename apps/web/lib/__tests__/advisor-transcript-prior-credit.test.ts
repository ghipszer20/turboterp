import { readFileSync } from "node:fs";
import { apExamNames } from "@turboterp/credit";
import type { Course } from "@turboterp/course-data";
import { buildCatalog } from "@turboterp/plan/catalog";
import { describe, expect, it } from "vitest";
import { runAnalysis } from "../advisor/analysis";
import { newPlan } from "../advisor/plan-state";
import { computePriorCredit } from "../advisor/prior-credit";
import { selectApLines } from "../advisor/transcript-ap-select";
import { applyTranscriptImport } from "../advisor/transcript-apply";
import { selectDualLines, selectIbLines } from "../advisor/transcript-ib-select";
import { parseTranscriptText } from "../advisor/transcript-parse";

// Entirely invented transcript text in Testudo's web-paste layout (trailing Equivalences columns),
// for a made-up student. Never derived from any real transcript.
const PASTE = `
                                   UNIVERSITY OF MARYLAND
                                   UNOFFICIAL TRANSCRIPT
Student, Sample
Transcripts received from the following institutions:

Advanced Placement Exam                  on 07/02/24
Sample Community College                 on 08/01/24

** Transfer Credit Information **                   ** Equivalences **

Advanced Placement Exam
    2201   U.S. HISTORY/SCR 4       P        3.00 HIST201       DSHS or DSHU, DVUP
           CALCULUS AB/SCR 5        P        0.00 No Credit
    2301   ENG LANG/COMP/SCR 4      P        3.00               FSAW
           CALC BC/AB SUBSCR 5      P        0.00 No Credit
           CALCULUS BC/SCR 5        P        4.00 MATH140       FSMA
           CALCULUS BC/SCR 5        P        4.00 MATH141
           PHYSICS C-MECH/SCR 9     P        3.00 PHYS161       DSNL
International Baccalaureate
    2401   PSYCHOLOGY HL/SCR 6      P        3.00 PSYC100       DSHS
Sample Community College
    2301   MATH181   CALCULUS I   A   4.00 MATH120   FSMA
    2301   ENGL 101   COMPOSITION   B+   3.00        FSAW
    2301   ART 110   DRAWING   A   0.00 No Credit
Acceptable UG Inst. Credits:                39.00
Applicable UG Inst. Credits:                39.00

Total UG Credits Acceptable:                39.00
Historic Course Information is listed in the order:
Course, Title, Grade, Credits Attempted, Earned and Quality Points
Fall 2024
CMSC131 OBJECT-ORIENTED PROG I A 4.00 4.00 16.00
** Current Course Information **
Fall 2026      Course   Sec  Credits  Grd/ Drop   Add      Drop    Modified GenEd
                                      Meth /Add  Date     Date    Date
               ======== ==== =======  ==== ==== ======== ========  ======== ==================
               CMSC250  0102    4.00  REG  A    09/01/26           09/01/26
               CMSC250  0303    4.00  REG  D    08/28/26 09/01/26  09/01/26
`;

describe("parseTranscriptText: paste layout transfer block", () => {
  const r = parseTranscriptText(PASTE, "paste");

  it("reads AP rows despite the Equivalences header and trailing columns", () => {
    expect(r.apLines.map((l) => [l.examRaw, l.score])).toEqual([
      ["U.S. HISTORY", 4],
      ["CALCULUS AB", 5],
      ["ENG LANG/COMP", 4],
      ["CALC BC/AB SUB", 5],
      ["CALCULUS BC", 5],
      ["CALCULUS BC", 5],
    ]);
    expect(r.apLines[0]).toMatchObject({ credits: 3, posted: "HIST201", genEd: ["DSHS or DSHU", "DVUP"] });
    expect(r.apLines[1]).toMatchObject({ credits: 0, posted: null });
    expect(r.apLines[2]).toMatchObject({ credits: 3, posted: null, genEd: ["FSAW"] });
  });

  it("rejects an AP score outside 1-5 and lists the line", () => {
    expect(r.unparsed.map((u) => u.raw)).toEqual([expect.stringContaining("PHYSICS C-MECH/SCR 9")]);
  });

  it("never reads an IB row as an AP exam", () => {
    expect(r.apLines.some((l) => /PSYCH/.test(l.examRaw))).toBe(false);
    expect(r.ibLines).toEqual([expect.objectContaining({ examRaw: "PSYCHOLOGY", level: "HL", score: 6, posted: "PSYC100" })]);
  });

  it("reads dual-enrollment rows under the institution header", () => {
    expect(r.dualLines.map((d) => [d.institution, d.course, d.credits, d.umd])).toEqual([
      ["Sample Community College", "MATH181", 4, "MATH120"],
      ["Sample Community College", "ENGL101", 3, null],
      ["Sample Community College", "ART110", 0, null],
    ]);
  });

  it("skips dropped sections, the separator and the footer lines", () => {
    expect(r.courses.filter((c) => c.status === "in-progress").map((c) => c.code)).toEqual(["CMSC250"]);
    expect(r.unparsed.some((u) => /====|Credits|Meth/.test(u.raw))).toBe(false);
  });

  it("still reads the PDF/OCR layout with no trailing columns", () => {
    const old = parseTranscriptText("** Transfer Credit Information **\nAdvanced Placement Exam\n2201 CALCULUS BC/SCR 5\nCHEMISTRY/SCR 4\nFall 2024\n", "pdf");
    expect(old.apLines.map((l) => [l.examRaw, l.score])).toEqual([["CALCULUS BC", 5], ["CHEMISTRY", 4]]);
    expect(old.apLines[0]!.posted).toBeUndefined();
  });
});

describe("selection and apply", () => {
  const r = parseTranscriptText(PASTE, "paste");

  it("sets the posted pick for a choice award", () => {
    const ap = selectApLines(r.apLines, apExamNames()).matched;
    expect(ap.find((a) => a.exam === "United States History")?.pick).toBe("HIST201");
    const plan = applyTranscriptImport(newPlan({ programs: [], catalogYear: "2026-2027", startTerm: "Fall 2024" }), { courses: [], ap });
    expect(plan.prior.choices["AP United States History (4)"]).toBe("HIST201");
  });

  it("matches IB and keeps unreadable dual rows in the not-imported list", () => {
    expect(selectIbLines(r.ibLines).matched).toEqual([expect.objectContaining({ exam: "Psychology", level: "HL", score: 6 })]);
    expect(selectIbLines([{ ...r.ibLines[0]!, examRaw: "UNDERWATER BASKETRY" }]).unmatched).toHaveLength(1);
    const dual = selectDualLines(r.dualLines);
    expect(dual.matched.map((d) => [d.course, d.elective])).toEqual([["MATH181", false], ["ENGL101", true]]);
    expect(dual.unmatched.map((d) => d.course)).toEqual(["ART110"]);
  });

  it("doesn't duplicate IB or dual rows on re-import", () => {
    const ib = selectIbLines(r.ibLines).matched;
    const dual = selectDualLines(r.dualLines).matched;
    const once = applyTranscriptImport(newPlan({ programs: [], catalogYear: "2026-2027", startTerm: "Fall 2024" }), { courses: [], ap: [], ib, dual });
    const twice = applyTranscriptImport(once, { courses: [], ap: [], ib, dual });
    expect(twice.prior.ib).toHaveLength(1);
    expect(twice.prior.dual).toHaveLength(2);
  });
});

const COURSES = (
  JSON.parse(readFileSync(new URL("../../../../packages/plan/test/fixtures/courses-202701.json", import.meta.url), "utf8")) as {
    courses: Course[];
  }
).courses;
const catalog = buildCatalog(COURSES);

describe("end to end: paste -> select -> apply -> prior credit -> audit", () => {
  it("counts exam and dual credit toward the matching requirements", async () => {
    const r = parseTranscriptText(PASTE, "paste");
    const ap = selectApLines(r.apLines, apExamNames()).matched;
    const dual = selectDualLines(r.dualLines).matched;
    const plan = applyTranscriptImport(newPlan({ programs: ["cmsc-major"], catalogYear: "2026-2027", startTerm: "Fall 2024" }), {
      courses: [],
      ap,
      ib: selectIbLines(r.ibLines).matched,
      dual,
    });
    const prior = computePriorCredit(plan.prior, (id) => catalog.get(id)?.genEd ?? []);
    const ids = prior.courses.map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(["MATH140", "MATH141", "HIST201", "MATH120"]));
    const a = await runAnalysis({ plan, catalog, priorCourses: prior.courses });
    const cs = a.audits.find((x) => x.program.id === "cmsc-major")!;
    const calc = cs.requirements.filter((q) => JSON.stringify(q.requirement).includes("MATH140"));
    expect(calc.length).toBeGreaterThan(0);
    expect(calc.every((q) => q.result.status === "satisfied")).toBe(true);
  });
});
