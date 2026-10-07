// Turns a transcript's IB lines and dual-enrollment lines into what the review screen offers.
// Rows that can't be matched or read are returned for the visible "Not recognized" list, never dropped.

import { IB_EXAMS } from "@turboterp/credit";
import { isCreditValue } from "./plan-state";
import { matchApExamName } from "./transcript-ap-match";
import type { ParsedDualLine, ParsedIbLine } from "./transcript-parse";

type IbMatch = { exam: string; level: "SL" | "HL"; score: number; flagged: boolean };
export type IbSelection = { matched: IbMatch[]; unmatched: ParsedIbLine[] };

// Chart spelling -> chart exam name, for the names and aliases the chart lists.
const IB_CANDIDATES = IB_EXAMS.flatMap((e) => [e.name, ...e.aliases].map((n) => ({ n, exam: e.name })));
const IB_LABELS = IB_CANDIDATES.map((c) => c.n);
const LANGUAGE_TYPE = /\s+(A LITERATURE|A LANGUAGE AND LITERATURE|AB INITIO|A|B)$/i;

function matchIbExam(raw: string): string | null {
  const hit = matchApExamName(raw, IB_LABELS) ?? (LANGUAGE_TYPE.test(raw) ? matchApExamName(raw.replace(LANGUAGE_TYPE, ""), IB_LABELS) : null);
  return hit ? IB_CANDIDATES.find((c) => c.n === hit)!.exam : null;
}

export function selectIbLines(lines: ParsedIbLine[]): IbSelection {
  const matched: IbMatch[] = [];
  const unmatched: ParsedIbLine[] = [];
  for (const l of lines) {
    const exam = l.level ? matchIbExam(l.examRaw) : null;
    if (!exam || !l.level) {
      unmatched.push(l);
      continue;
    }
    const existing = matched.find((m) => m.exam === exam && m.level === l.level);
    if (existing) {
      existing.score = Math.max(existing.score, l.score);
      existing.flagged = existing.flagged || l.flagged;
    } else matched.push({ exam, level: l.level, score: l.score, flagged: l.flagged });
  }
  return { matched, unmatched };
}

type DualMatch = { institution: string; course: string; credits: number; umd: string; elective: boolean; title: string; flagged: boolean };
export type DualSelection = { matched: DualMatch[]; unmatched: ParsedDualLine[] };

export function selectDualLines(lines: ParsedDualLine[]): DualSelection {
  const matched: DualMatch[] = [];
  const unmatched: ParsedDualLine[] = [];
  for (const l of lines) {
    // "No Credit" or a credit count no course carries: nothing to count, but never hidden.
    if (l.credits === null || l.credits <= 0 || !isCreditValue(l.credits)) {
      unmatched.push(l);
      continue;
    }
    matched.push({
      institution: l.institution,
      course: l.course,
      credits: l.credits,
      umd: l.umd ?? "",
      elective: l.umd === null,
      title: l.title,
      flagged: l.flagged,
    });
  }
  return { matched, unmatched };
}
