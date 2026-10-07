// Shapes for UMD's AP and IB credit charts (SOURCES.md says where they come from).

/** One piece of credit a chart row awards. */
export type AwardPart =
  /** A specific UMD course, e.g. MATH140 (4 credits, FSMA and FSAR). */
  | { kind: "course"; id: string; credits: number; genEd: string[]; lab?: string }
  /** One of several UMD courses, e.g. "HIST200 or HIST201"; the student's record gets one. */
  | { kind: "choice"; credits: number; options: { id: string; genEd: string[] }[] }
  /**
   * Credit with no UMD course: "Lower Level Elective" (UMD's L1), or Gen Ed credit such as
   * "Lab Science (DSNL)" or IB's "No Direct Equivalent" (DSHS).
   */
  | { kind: "generic"; label: string; credits: number; genEd: string[] };

/** One row of a chart: the scores it covers and what they earn. */
export type ChartRow = {
  scores: number[];
  /** The chart's Credits column (the row total). */
  credits: number;
  /** The chart's equivalency cell, as printed (course ids may have spaces removed). */
  text: string;
  parts: AwardPart[];
};

export type ApExam = {
  /** College Board's name, e.g. "Calculus BC". */
  name: string;
  /** Other spellings, including the chart's, e.g. "Math-Calculus BC". */
  aliases: string[];
  rows: ChartRow[];
  notes?: string[];
};

export type IbLevel = "SL" | "HL";

export type IbExam = {
  subject: string;
  /** The chart's exam title, e.g. "Psychology". */
  name: string;
  aliases: string[];
  /** "(All Exam Types)": language A, B and ab initio exams all use this row. */
  allExamTypes?: boolean;
  /** Rows per level; an empty list means the chart says credit is not awarded. A missing level isn't listed. */
  levels: Partial<Record<IbLevel, ChartRow[]>>;
  notes?: string[];
};

/** What one exam score earns at UMD. An empty `parts` list means no credit. */
export type CreditAward = {
  program: "AP" | "IB";
  exam: string;
  level?: IbLevel;
  score: number;
  /** Label for the student's record, e.g. "AP Calculus BC (5)" or "IB Psychology HL (6)". */
  source: string;
  credits: number;
  parts: AwardPart[];
  /** The chart's equivalency cell, or "" when the score earns nothing. */
  chartText: string;
  notes: string[];
};

export class CreditError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreditError";
  }
}
