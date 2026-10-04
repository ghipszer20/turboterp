// Requirement pieces in plain words. Kept free of the audit solver so the plan grid and course
// sheet can use it without loading HiGHS.

import type { CourseFilter } from "@turboterp/audit";
import type { Requirement as Prerequisite } from "@turboterp/course-data/prereqs";

const GEN_ED: Record<string, string> = {
  FSAW: "Academic Writing",
  FSPW: "Professional Writing",
  FSOC: "Oral Communication",
  FSMA: "Math",
  FSAR: "Analytic Reasoning",
  DSHS: "History and Social Sciences",
  DSHU: "Humanities",
  DSNL: "Natural Science Lab",
  DSNS: "Natural Sciences",
  DSSP: "Scholarship in Practice",
  SCIS: "Big Question",
  DVUP: "Understanding Plural Societies",
  DVCC: "Cultural Competence",
};

/** "Humanities (DSHU)" */
export const genEdName = (code: string) => (GEN_ED[code] ? `${GEN_ED[code]} (${code})` : code);

/** "A", "A or B", "A, B or C" */
export function listing(items: string[], word: "and" | "or"): string {
  return items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} ${word} ${items.at(-1)}`;
}

/** What a course filter accepts, e.g. "STAT course numbered 400–499 (not STAT464)"; `n` > 1 makes it plural. */
export function filterText(filter: CourseFilter, n = 1): string {
  const noun = n === 1 ? "course" : "courses";
  if (filter.anyCourse) return n === 1 ? "any course" : "courses of any kind";
  let text: string;
  if (filter.genEd) text = `${listing(filter.genEd.map(genEdName), "or")} ${noun}`;
  else if (filter.departments) {
    text = `${listing(filter.departments, "or")} ${noun}`;
    const { minNumber: lo, maxNumber: hi } = filter;
    if (lo !== undefined && hi !== undefined) text += ` numbered ${lo}–${hi}`;
    else if (lo !== undefined) text += ` numbered ${lo} or higher`;
    else if (hi !== undefined) text += ` numbered ${hi} or lower`;
  } else if (filter.courses) text = `${noun} from ${listing(filter.courses, "or")}`;
  else text = noun;
  if (filter.exclude?.length) text += ` (not ${listing(filter.exclude, "or")})`;
  return text;
}

/** A parsed prerequisite in words: "CMSC250 (C- or better) and (CMSC132 or CMSC142)". */
export function prerequisiteText(req: Prerequisite, nested = false): string {
  if (req.kind === "manual") return req.text;
  if (req.kind === "course") {
    const notes = [req.minGrade ? `${req.minGrade} or better` : "", req.concurrentOk ? "or in the same term" : ""].filter(Boolean);
    return notes.length ? `${req.course} (${notes.join(", ")})` : req.course;
  }
  const parts = req.of.map((r) => prerequisiteText(r, true));
  const text = listing(parts, req.kind === "all" ? "and" : "or");
  return nested && parts.length > 1 ? `(${text})` : text;
}
