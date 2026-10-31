// Turns a transcript's raw AP lines into what the review screen actually offers to apply.
// Owner ruling (code review, 2026-09-27): Testudo lists one AP line per course equivalency, so the
// same exam can repeat several times on one transcript (e.g. a Chemistry exam's multiple sub-scores
// each print their own "CHEMISTRY/SCR 5" line) -- collapse those to one row per matched exam,
// keeping the highest score, so the plan never gets the same AP exam three times over.
//
// "Calculus BC AB Subscore" is College Board's AB-equivalent readout of a BC exam, not a separate
// exam sitting -- when a Calculus BC line is also on the transcript, show the subscore as an
// info-only row instead of something to apply; without a BC line, there's nothing to attach it to,
// so it's listed as unmatched for the student to enter by hand if it's real.

import { creditForAp } from "@turboterp/credit";
import { matchApExamName } from "./transcript-ap-match";
import type { ParsedApLine } from "./transcript-parse";

const CALCULUS_BC = "Calculus BC";
const CALCULUS_BC_SUBSCORE = "Calculus BC AB Subscore";

type ApMatch = { exam: string; score: number; flagged: boolean; pick?: string };

/** When the award offers a choice (e.g. HIST200 or HIST201), the course UMD posted wins over the automatic pick. */
function postedPick(exam: string, score: number, group: ParsedApLine[]): { pick?: string } {
  try {
    const options = creditForAp(exam, score).parts.flatMap((p) => (p.kind === "choice" ? p.options.map((o) => o.id) : []));
    const pick = group.find((l) => l.score === score && l.posted && options.includes(l.posted))?.posted;
    return pick ? { pick } : {};
  } catch {
    return {};
  }
}
type ApInfo = { exam: string; score: number; note: string };

export type ApSelection = {
  matched: ApMatch[];
  info: ApInfo[];
  unmatched: ParsedApLine[];
};

export function selectApLines(lines: ParsedApLine[], examNames: string[]): ApSelection {
  const unmatched: ParsedApLine[] = [];
  const groups = new Map<string, ParsedApLine[]>();

  for (const l of lines) {
    const exam = matchApExamName(l.examRaw, examNames);
    if (!exam) {
      unmatched.push(l);
      continue;
    }
    if (!groups.has(exam)) groups.set(exam, []);
    groups.get(exam)!.push(l);
  }

  const hasBC = groups.has(CALCULUS_BC);
  const matched: ApMatch[] = [];
  const info: ApInfo[] = [];

  for (const [exam, group] of groups) {
    const best = group.reduce((a, b) => (b.score > a.score ? b : a));
    const flagged = group.some((l) => l.flagged);

    if (exam === CALCULUS_BC_SUBSCORE) {
      if (hasBC) info.push({ exam, score: best.score, note: "AB subscore; credit comes from Calculus BC" });
      else unmatched.push(...group);
      continue;
    }
    matched.push({ exam, score: best.score, flagged, ...postedPick(exam, best.score, group) });
  }

  return { matched, info, unmatched };
}
