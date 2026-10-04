import { describe, expect, it } from "vitest";
import { parseTranscriptText } from "../advisor/transcript-parse";

// Entirely invented transcript text, in Testudo's layout, for a made-up student. Never derived
// from or resembling any real transcript.
const CLEAN = `
9/1/26, 1:00 PM Testudo - Unofficial Transcript
Student, Sample
E-Mail: sstudent@terpmail.umd.edu
UNOFFICIAL TRANSCRIPT
FOR ADVISING PURPOSES ONLY
As of: 09/01/26
Major: Computer Science
** Transfer Credit Information **
Advanced Placement Exam
2201 CALCULUS BC/SCR 5
CHEMISTRY/SCR 4
Historic Course Information is listed in the order:
Course, Title, Grade, Credits Attempted, Earned and Quality Points
Fall 2024
MAJOR: COMPUTER SCIENCE COLLEGE: COMP, MATH, & NAT SCI
CMSC131 OBJECT-ORIENTED PROG I A 4.00 4.00 16.00
ENGL101 ACADEMIC WRITING B+ 3.00 3.00 9.90 FSPW
Semester: Attempted 7.00; Earned 7.00; QPoints 25.90; GPA 3.700
UG Cumulative: 7.00; 7.00; 25.90; 3.700
Spring 2025
MAJOR: COMPUTER SCIENCE COLLEGE: COMP, MATH, & NAT SCI
CMSC132 OBJECT-ORIENTED PROG II A- 4.00 4.00 14.80 DSSP, SCIS
PHIL100 INTRO TO PHILOSOPHY B 3.00 3.00 9.00 DSHU or DSHS
Semester: Attempted 7.00; Earned 7.00; QPoints 23.80; GPA 3.400
UG Cumulative: 14.00; 14.00; 49.70; 3.550
Summer I 2025
MAJOR: COMPUTER SCIENCE COLLEGE: COMP, MATH, & NAT SCI
STAT400 APPL PROBABLTY&STATIST I A 3.00 3.00 12.00
** Current Course Information **
Fall 2026 Course Sec Credits Grd/ Drop Add Drop Modified GenEd
Meth /Add Date Date Date
CMSC330 0101 3.00 REG 08/28/26 08/28/26
https://app.testudo.umd.edu/#/main/uotrans?null
`;

describe("parseTranscriptText: completed courses", () => {
  it("reads course, title, grade, credits and gen ed tags per term", () => {
    const r = parseTranscriptText(CLEAN, "pdf");
    expect(r.courses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          term: "Fall 2024",
          code: "CMSC131",
          title: "OBJECT-ORIENTED PROG I",
          grade: "A",
          attemptedCredits: 4,
          earnedCredits: 4,
          genEd: [],
          status: "completed",
          flagged: false,
        }),
        expect.objectContaining({
          term: "Fall 2024",
          code: "ENGL101",
          title: "ACADEMIC WRITING",
          grade: "B+",
          attemptedCredits: 3,
          earnedCredits: 3,
          genEd: ["FSPW"],
          status: "completed",
        }),
      ]),
    );
  });

  it("keeps a multi-tag and an 'or' gen ed choice as separate entries", () => {
    const r = parseTranscriptText(CLEAN, "pdf");
    const oop2 = r.courses.find((c) => c.code === "CMSC132")!;
    expect(oop2.genEd).toEqual(["DSSP", "SCIS"]);
    const phil = r.courses.find((c) => c.code === "PHIL100")!;
    expect(phil.genEd).toEqual(["DSHU or DSHS"]);
  });

  it("collapses a Summer session suffix into the plain Summer term", () => {
    const r = parseTranscriptText(CLEAN, "pdf");
    const stat = r.courses.find((c) => c.code === "STAT400")!;
    expect(stat.term).toBe("Summer 2025");
  });

  it("skips semester/cumulative footer lines and metadata lines (no unparsed noise from them)", () => {
    const r = parseTranscriptText(CLEAN, "pdf");
    expect(r.unparsed.some((u) => u.raw.includes("Semester:"))).toBe(false);
    expect(r.unparsed.some((u) => u.raw.includes("UG Cumulative"))).toBe(false);
    expect(r.unparsed.some((u) => u.raw.includes("MAJOR:"))).toBe(false);
  });
});

describe("parseTranscriptText: in-progress courses", () => {
  it("adds a current-term course as in-progress with no grade", () => {
    const r = parseTranscriptText(CLEAN, "pdf");
    const cur = r.courses.find((c) => c.code === "CMSC330")!;
    expect(cur).toBeTruthy();
    expect(cur.status).toBe("in-progress");
    expect(cur.grade).toBeNull();
    expect(cur.term).toBe("Fall 2026");
    expect(cur.attemptedCredits).toBe(3);
  });

  it("never reads the Grd/Meth column's registration method (REG) as a grade", () => {
    const r = parseTranscriptText(CLEAN, "pdf");
    const cur = r.courses.find((c) => c.code === "CMSC330")!;
    expect(cur.grade).not.toBe("REG");
  });
});

describe("parseTranscriptText: AP exam lines", () => {
  it("reads an exam name and score, inheriting the term code from the prior row when omitted", () => {
    const r = parseTranscriptText(CLEAN, "pdf");
    expect(r.apLines).toEqual([
      expect.objectContaining({ examRaw: "CALCULUS BC", score: 5, termCode: "2201", flagged: false }),
      expect.objectContaining({ examRaw: "CHEMISTRY", score: 4, termCode: "2201", flagged: false }),
    ]);
  });
});

describe("parseTranscriptText: OCR noise repair", () => {
  it("repairs @ and O standing in for 0 inside a course code's numeric suffix", () => {
    const r = parseTranscriptText("Fall 2024\nCMSC1@1 OBJECT-ORIENTED PROG I A 4.00 4.00 16.00\n", "ocr");
    const c = r.courses[0]!;
    expect(c.code).toBe("CMSC101");
    expect(c.flagged).toBe(true);
  });

  it("repairs @ standing in for 0 inside attempted/earned/quality-point numbers", () => {
    const r = parseTranscriptText("Fall 2024\nCMSC131 OBJECT-ORIENTED PROG I A 3.0@ 3.00 12.0@\n", "ocr");
    const c = r.courses[0]!;
    expect(c.attemptedCredits).toBe(3);
    expect(c.flagged).toBe(true);
  });

  it("repairs a stray trailing lowercase letter on an otherwise-valid grade", () => {
    const r = parseTranscriptText("Fall 2024\nCMSC131 OBJECT-ORIENTED PROG I At 3.00 3.00 12.00\n", "ocr");
    const c = r.courses[0]!;
    expect(c.grade).toBe("A");
    expect(c.flagged).toBe(true);
  });

  it("drops (nulls) a grade that still doesn't validate after repair, without dropping the row", () => {
    const r = parseTranscriptText("Fall 2024\nCMSC131 OBJECT-ORIENTED PROG I ZZ 3.00 3.00 12.00\n", "ocr");
    const c = r.courses[0]!;
    expect(c.grade).toBeNull();
    expect(c.flagged).toBe(true);
    expect(c.code).toBe("CMSC131");
  });

  it("flags every row when the source is OCR, even if nothing needed repair", () => {
    const r = parseTranscriptText("Fall 2024\nCMSC131 OBJECT-ORIENTED PROG I A 4.00 4.00 16.00\n", "ocr");
    expect(r.courses[0]!.flagged).toBe(true);
  });

  it("does not flag a clean row read from a real text layer or a paste", () => {
    const text = "Fall 2024\nCMSC131 OBJECT-ORIENTED PROG I A 4.00 4.00 16.00\n";
    expect(parseTranscriptText(text, "pdf").courses[0]!.flagged).toBe(false);
    expect(parseTranscriptText(text, "paste").courses[0]!.flagged).toBe(false);
  });
});

describe("parseTranscriptText: unparseable lines", () => {
  it("lists a line it can't make sense of instead of dropping it silently", () => {
    const r = parseTranscriptText("Fall 2024\n??? totally garbled fragment ???\n", "ocr");
    expect(r.unparsed).toEqual([expect.objectContaining({ raw: "??? totally garbled fragment ???" })]);
  });
});

describe("parseTranscriptText: cumulative GPA", () => {
  const withCumulative = (line: string) => `Fall 2024\nCMSC131 OBJECT-ORIENTED PROG I A 4.00 4.00 16.00\nUG Cumulative: ${line}\n`;

  it("reads the last printed cumulative GPA", () => {
    const r = parseTranscriptText(CLEAN, "pdf");
    expect(r.cumulativeGpa).toEqual({ value: 3.55, flagged: false, raw: "UG Cumulative: 14.00; 14.00; 49.70; 3.550" });
  });

  it("is null when no cumulative line is printed", () => {
    expect(parseTranscriptText("Fall 2024\nCMSC131 OBJECT-ORIENTED PROG I A 4.00 4.00 16.00\n", "pdf").cumulativeGpa).toBeNull();
  });

  it("repairs OCR @ for 0 and flags it", () => {
    const r = parseTranscriptText(withCumulative("4.00; 4.00; 16.00; 3.@5@"), "pdf");
    expect(r.cumulativeGpa).toMatchObject({ value: 3.05, flagged: true });
  });

  it("flags every OCR-read GPA even when it needed no repair", () => {
    expect(parseTranscriptText(withCumulative("4.00; 4.00; 16.00; 3.550"), "ocr").cumulativeGpa).toMatchObject({ value: 3.55, flagged: true });
  });

  it("rejects an impossible GPA and lists the line as unparsed", () => {
    const r = parseTranscriptText(withCumulative("4.00; 4.00; 16.00; 35.50"), "pdf");
    expect(r.cumulativeGpa).toBeNull();
    expect(r.unparsed.some((u) => u.raw.includes("UG Cumulative"))).toBe(true);
  });
});
