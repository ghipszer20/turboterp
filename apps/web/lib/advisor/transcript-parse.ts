// Turns transcript text -- from pdfjs (a text-bearing PDF), a browser paste, or on-device OCR --
// into structured completed/in-progress courses and AP exam lines. Pure string-in/struct-out: no
// PDF, file or OCR I/O here (see transcript-pdf.ts / transcript-ocr.ts for that).
//
// Real Testudo transcripts (even ones with a text layer) can be noisy -- observed on a real file:
// 0 read as @ inside a course code ("CMNS1@@") or a credit number ("12.0@"), a stray letter tacked
// onto a grade. Owner ruling: repair @/O -> 0 only inside course codes and numbers, validate grades
// against the known set (reject an impossible one rather than guess), and never silently drop a
// line we can't make sense of -- list it in `unparsed` instead. Every row read from the OCR path is
// flagged for the student to check, even one that needed no repair.

import { isCreditValue } from "./plan-state";

export type Source = "pdf" | "paste" | "ocr";

export type ParsedCourse = {
  term: string;
  code: string;
  title: string;
  grade: string | null;
  attemptedCredits: number | null;
  earnedCredits: number | null;
  genEd: string[];
  status: "completed" | "in-progress";
  flagged: boolean;
  raw: string;
};

export type ParsedApLine = {
  examRaw: string;
  score: number;
  /** Testudo's own term code for the exam (e.g. "2201"); display-only, never applied (ApInput has
   * no term). Inherited from the prior AP line when a run of exams from the same term omits it. */
  termCode: string | null;
  flagged: boolean;
  raw: string;
  /** From the Equivalences columns, when printed: credits posted, the UMD course posted (the
   * student's pick when the award offers a choice), and Gen Ed tags. */
  credits?: number | null;
  posted?: string | null;
  genEd?: string[];
};

export type ParsedIbLine = ParsedApLine & { level: "SL" | "HL" | null };

export type ParsedDualLine = {
  institution: string;
  termCode: string | null;
  /** The external course code as printed, e.g. "MATH181". */
  course: string;
  title: string;
  grade: string | null;
  credits: number | null;
  /** The UMD course it transferred as; null for a generic, blank or "No Credit" equivalence. */
  umd: string | null;
  genEd: string[];
  flagged: boolean;
  raw: string;
};

type UnparsedLine = { raw: string; reason: string };

export type ParsedTranscript = {
  studentName: string | null;
  courses: ParsedCourse[];
  apLines: ParsedApLine[];
  ibLines: ParsedIbLine[];
  dualLines: ParsedDualLine[];
  unparsed: UnparsedLine[];
  /** The last printed "UG Cumulative" GPA (0-4); null when none is printed or it is impossible. */
  cumulativeGpa: { value: number; flagged: boolean; raw: string } | null;
};

const KNOWN_GRADES = new Set(["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "W", "I", "S", "U", "P", "AUD"]);

const GRADE_SHAPE = /^[A-Za-z]{1,4}[+-]?$/;
const NUM_SHAPE = /^[\d@Oo]+(\.[\d@Oo]{1,3})?$/;
const isNumShape = (tok: string) => NUM_SHAPE.test(tok) && /\d/.test(tok);
const CUMULATIVE_LINE = /^UG Cumulative:/i;
const METHOD_SHAPE = /^(REG|WD|CAN|AUD)$/i;

const SEASON_NAMES: Record<string, string> = { fall: "Fall", winter: "Winter", spring: "Spring", summer: "Summer" };
/** Collapses a Summer session suffix ("Summer I 2026") into the plain term name terms.ts knows. */
const normalizeTermName = (season: string, year: string) => `${SEASON_NAMES[season.toLowerCase()] ?? season} ${year}`;

const TERM_HEADER = /^(Fall|Winter|Spring|Summer)(?:\s+I{1,2})?\s+(\d{4})$/i;
const CURRENT_TERM_HEADER = /^(Fall|Winter|Spring|Summer)(?:\s+I{1,2})?\s+(\d{4})\s+Course\s+Sec\b/i;
const AP_LINE = /^(?:(\d{4})\s+)?(.+?)\/?SCR\s+(\d+)\b(.*)$/i;
const DUAL_LINE = /^(?:(\d{4})\s+)?([A-Za-z]{2,5}\s?\d{2,4}[A-Za-z]?)\s+(.+?)(?:\s+([A-Z]{1,2}[+-]?))?\s+(\d+\.\d{1,2})(?:\s+(.*))?$/;
const UMD_CODE = /^[A-Z]{3,4}\d{3}[A-Z]?$/;
const STUDENT_NAME = /^[A-Za-z.'-]+,\s*[A-Za-z.'-]+$/;

/** Front-matter, per-term metadata and footer lines that carry nothing to import: recognized and
 * dropped without ever landing in `unparsed`. */
const SKIP_PATTERNS: RegExp[] = [
  /^\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}\s*(AM|PM)?\s*Testudo/i,
  /^E-Mail:/i,
  /^UNIVERSITY OF MARYLAND$/i,
  /^COLLEGE PARK$/i,
  /^Office of the Registrar$/i,
  /^College Park, MD/i,
  /^UNOFFICIAL TRANSCRIPT$/i,
  /^FOR ADVISING PURPOSES ONLY$/i,
  /^As of:/i,
  /^Major:/i,
  /^MAJOR:.*COLLEGE:/i,
  /^Transfer - /i,
  /^GenEd Program$/i,
  /^Undergraduate Degree Seeking$/i,
  /^Current Status:/i,
  /^Fundamental Requirement Satisfied/i,
  /^Transcripts received from/i,
  /^Historic Course Information/i,
  /^Course, Title, Grade,/i,
  /^\*\*\s*Semester Academic Honors\s*\*\*$/i,
  /^Semester:\s*Attempted/i,
  /^UG Cumulative/i,
  /^(Acceptable|Applicable)\b.*\bCredits/i,
  /^Total UG Credits/i,
  /^=+(\s+=+)*$/,
  /^Meth\b/i,
  /^https?:\/\//i,
];

function repairCode(token: string): { code: string; repaired: boolean } | null {
  const m = /^([A-Za-z]{2,4})([0-9OQ@]{2,4}[A-Za-z0-9@]?)$/.exec(token);
  if (!m) return null;
  const code = m[1]!.toUpperCase() + m[2]!.replace(/[O@]/gi, "0").toUpperCase();
  if (!/^[A-Z]{2,4}\d{3}[A-Z]?$/.test(code)) return null;
  return { code, repaired: code !== token.toUpperCase() };
}

function repairGrade(raw: string): { grade: string | null; repaired: boolean } {
  const upper = raw.toUpperCase();
  if (KNOWN_GRADES.has(upper)) return { grade: upper, repaired: false };
  // A stray lowercase letter or two tacked onto an otherwise-valid grade (OCR noise).
  const m = /^([A-Z]+[+-]?)[a-z]{1,2}$/.exec(raw);
  if (m && KNOWN_GRADES.has(m[1]!)) return { grade: m[1]!, repaired: true };
  return { grade: null, repaired: true };
}

function repairNumber(token: string): { value: number | null; repaired: boolean } {
  if (!/\d/.test(token)) return { value: null, repaired: true };
  const cleaned = token.replace(/[O@]/gi, "0");
  const value = Number.parseFloat(cleaned);
  return { value: Number.isFinite(value) ? value : null, repaired: cleaned !== token };
}

/** The GPA is the last field of "UG Cumulative: attempted; earned; qpoints; GPA". Repairs @/O -> 0 like credit numbers; rejects anything outside 0-4. */
/** A credit column: like repairNumber, but a value no course can carry (e.g. a GPA OCR put on the line) reads as unknown and flagged. */
function repairCredits(token: string): { value: number | null; repaired: boolean } {
  const r = repairNumber(token);
  return r.value !== null && !isCreditValue(r.value) ? { value: null, repaired: true } : r;
}

function parseCumulativeGpa(line: string, source: Source): { value: number; flagged: boolean; raw: string } | null {
  const token = line.replace(CUMULATIVE_LINE, "").split(";").pop()!.trim();
  if (!isNumShape(token)) return null;
  const { value, repaired } = repairNumber(token);
  if (value === null || value < 0 || value > 4) return null;
  return { value, flagged: source === "ocr" || repaired, raw: line };
}

type EquivCols = { credits: number | null; posted: string | null; genEd: string[] };

/** The Equivalences columns after a score: [grade] credits [UMD course | "No Credit"] [gen eds]. */
function equivTail(credits: number | null, tail: string[]): EquivCols {
  if (/^no$/i.test(tail[0] ?? "") && /^credit$/i.test(tail[1] ?? "")) return { credits, posted: null, genEd: [] };
  let posted: string | null = null;
  if (tail[0] && UMD_CODE.test(tail[0].toUpperCase())) {
    posted = tail[0].toUpperCase();
    tail = tail.slice(1);
  }
  const genEd = tail.join(" ").split(",").map((g) => g.trim()).filter(Boolean);
  return { credits, posted, genEd };
}

function parseEquivalences(rest: string): EquivCols | null {
  const tokens = rest.split(/\s+/).filter(Boolean);
  let i = 0;
  if (tokens[i] && !isNumShape(tokens[i]!) && GRADE_SHAPE.test(tokens[i]!)) i++;
  if (i >= tokens.length || !isNumShape(tokens[i]!)) return null;
  return equivTail(repairNumber(tokens[i]!).value, tokens.slice(i + 1));
}

function parseExamLine(line: string): { termCode: string | null; examRaw: string; score: number; equiv: EquivCols | null } | null {
  const m = AP_LINE.exec(line);
  if (!m) return null;
  const rest = m[4]!.trim();
  const equiv = rest ? parseEquivalences(rest) : null;
  if (rest && !equiv) return null;
  return { termCode: m[1] ?? null, examRaw: m[2]!.trim().toUpperCase(), score: Number.parseInt(m[3]!, 10), equiv };
}

const equivFields = (e: EquivCols | null) => (e ? { credits: e.credits, posted: e.posted, genEd: e.genEd } : {});

function parseDualLine(line: string, institution: string): Omit<ParsedDualLine, "flagged"> | null {
  const m = DUAL_LINE.exec(line);
  if (!m) return null;
  const equiv = equivTail(repairNumber(m[5]!).value, (m[6] ?? "").trim().split(/\s+/).filter(Boolean));
  return {
    institution,
    termCode: m[1] ?? null,
    course: m[2]!.toUpperCase().replace(/\s+/g, ""),
    title: m[3]!.trim(),
    grade: m[4] ?? null,
    credits: equiv.credits,
    umd: equiv.posted,
    genEd: equiv.genEd,
    raw: line,
  };
}

function parseCompletedRow(line: string, source: Source): Omit<ParsedCourse, "term"> | null {
  const tokens = line.split(/\s+/);
  if (tokens.length < 5) return null;
  const codeInfo = repairCode(tokens[0]!);
  if (!codeInfo) return null;

  let idx = -1;
  for (let i = 1; i <= tokens.length - 4; i++) {
    if (GRADE_SHAPE.test(tokens[i]!) && isNumShape(tokens[i + 1]!) && isNumShape(tokens[i + 2]!) && isNumShape(tokens[i + 3]!)) {
      idx = i;
      break;
    }
  }
  if (idx === -1) return null;

  const gradeInfo = repairGrade(tokens[idx]!);
  const attempted = repairCredits(tokens[idx + 1]!);
  const earned = repairCredits(tokens[idx + 2]!);
  const qpoints = repairNumber(tokens[idx + 3]!);
  const genEdRaw = tokens.slice(idx + 4).join(" ");
  const genEd = genEdRaw ? genEdRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return {
    code: codeInfo.code,
    title: tokens.slice(1, idx).join(" "),
    grade: gradeInfo.grade,
    attemptedCredits: attempted.value,
    earnedCredits: earned.value,
    genEd,
    status: "completed",
    flagged: source === "ocr" || codeInfo.repaired || gradeInfo.repaired || attempted.repaired || earned.repaired || qpoints.repaired,
    raw: line,
  };
}

/** "dropped": the Drop/Add column says D, so the section was dropped and is not a course to import. */
function parseInProgressRow(line: string, source: Source): Omit<ParsedCourse, "term"> | "dropped" | null {
  const tokens = line.split(/\s+/);
  if (tokens.length < 3) return null;
  const codeInfo = repairCode(tokens[0]!);
  if (!codeInfo) return null;

  let idx = -1;
  for (let i = 1; i <= tokens.length - 2; i++) {
    if (isNumShape(tokens[i]!) && METHOD_SHAPE.test(tokens[i + 1]!)) {
      idx = i;
      break;
    }
  }
  if (idx === -1) return null;

  if (/^D$/i.test(tokens[idx + 2] ?? "")) return "dropped";
  const credits = repairCredits(tokens[idx]!);
  return {
    code: codeInfo.code,
    title: "",
    grade: null,
    attemptedCredits: credits.value,
    earnedCredits: null,
    genEd: [],
    status: "in-progress",
    flagged: source === "ocr" || codeInfo.repaired || credits.repaired,
    raw: line,
  };
}

export function parseTranscriptText(text: string, source: Source): ParsedTranscript {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const courses: ParsedCourse[] = [];
  const apLines: ParsedApLine[] = [];
  const ibLines: ParsedIbLine[] = [];
  const dualLines: ParsedDualLine[] = [];
  const unparsed: UnparsedLine[] = [];
  let transferKind: "ap" | "ib" | "dual" = "ap";
  let institution = "Transfer credit";
  let studentName: string | null = null;
  let mode: "front" | "ap" | "terms" = "front";
  let section: "completed" | "current" = "completed";
  let currentTerm: string | null = null;
  let lastApTermCode: string | null = null;
  let cumulativeGpa: ParsedTranscript["cumulativeGpa"] = null;

  for (const line of lines) {
    if (mode === "front" && studentName === null && STUDENT_NAME.test(line)) {
      studentName = line;
      continue;
    }
    if (/^\*\*\s*Transfer Credit Information\s*\*\*/i.test(line)) {
      mode = "ap";
      transferKind = "ap";
      continue;
    }
    if (/^\*\*\s*Current Course Information\s*\*\*$/i.test(line)) {
      section = "current";
      continue;
    }
    if (CUMULATIVE_LINE.test(line)) {
      cumulativeGpa = parseCumulativeGpa(line, source);
      if (!cumulativeGpa) unparsed.push({ raw: line, reason: "Couldn't read a cumulative GPA from this line" });
      continue;
    }
    if (SKIP_PATTERNS.some((re) => re.test(line))) continue;

    const curHeader = CURRENT_TERM_HEADER.exec(line);
    if (curHeader) {
      currentTerm = normalizeTermName(curHeader[1]!, curHeader[2]!);
      section = "current";
      mode = "terms";
      continue;
    }
    const termHeader = TERM_HEADER.exec(line);
    if (termHeader) {
      currentTerm = normalizeTermName(termHeader[1]!, termHeader[2]!);
      section = "completed";
      mode = "terms";
      continue;
    }

    if (mode === "ap") {
      // Sub-headers pick what the rows below are: AP exams, IB exams, or dual enrollment (an
      // institution name). The block ends at the first term header (handled above).
      if (/^Advanced Placement Exam\b/i.test(line)) {
        transferKind = "ap";
        continue;
      }
      if (/International Baccalaureate/i.test(line)) {
        transferKind = "ib";
        continue;
      }
      const exam = parseExamLine(line);
      if (exam) {
        const termCode = exam.termCode ?? lastApTermCode;
        if (exam.termCode) lastApTermCode = exam.termCode;
        const base = { score: exam.score, termCode, flagged: source === "ocr", raw: line, ...equivFields(exam.equiv) };
        if (transferKind === "ib") {
          if (exam.score < 1 || exam.score > 7) {
            unparsed.push({ raw: line, reason: "IB scores run 1-7" });
            continue;
          }
          const lm = /\b(HL|SL)\b/i.exec(exam.examRaw);
          const level = lm ? (lm[1]!.toUpperCase() as "HL" | "SL") : null;
          const examRaw = exam.examRaw.replace(/[\s/-]*\b(HL|SL)\b/i, "").trim();
          ibLines.push({ ...base, examRaw, level });
        } else {
          if (exam.score < 1 || exam.score > 5) {
            unparsed.push({ raw: line, reason: "AP scores run 1-5" });
            continue;
          }
          apLines.push({ ...base, examRaw: exam.examRaw });
        }
        continue;
      }
      const dual = parseDualLine(line, institution);
      if (dual && transferKind === "dual") {
        dualLines.push({ ...dual, flagged: source === "ocr" });
        continue;
      }
      // An unreadable line with no numbers is an institution name; anything else is shown to the student.
      if (!/\d/.test(line.replace(/\bon\s+\d{1,2}\/\d{1,2}\/\d{2,4}\s*$/i, "")) && /[A-Za-z]/.test(line) && !line.startsWith("**")) {
        transferKind = "dual";
        institution = line.replace(/\s+on\s+\d{1,2}\/\d{1,2}\/\d{2,4}\s*$/i, "").trim();
        continue;
      }
      if (line.startsWith("**")) continue;
      unparsed.push({ raw: line, reason: "Couldn't read as a transfer credit line (add it in Prior credit)" });
      continue;
    }

    if (mode === "terms" && currentTerm) {
      const row = section === "current" ? parseInProgressRow(line, source) : parseCompletedRow(line, source);
      if (row === "dropped") continue;
      if (row) {
        courses.push({ ...row, term: currentTerm });
        continue;
      }
      unparsed.push({
        raw: line,
        reason: section === "current" ? "Couldn't read as an in-progress course row" : "Couldn't read as a completed course row",
      });
      continue;
    }

    if (mode === "front") continue; // unrecognized front matter: not worth flooding `unparsed`
    unparsed.push({ raw: line, reason: "Unrecognized line" });
  }

  return { studentName, courses, apLines, ibLines, dualLines, unparsed, cumulativeGpa };
}
