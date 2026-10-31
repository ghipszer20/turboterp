// A course-wide grade distribution (PlanetTerp, via @turboterp/ratings files) as bars.

import type { Distribution } from "@turboterp/ratings";

const GROUPS = ["A", "B", "C", "D", "F", "W"] as const;
const COLUMNS: Record<string, string[]> = {
  A: ["A+", "A", "A-"],
  B: ["B+", "B", "B-"],
  C: ["C+", "C", "C-"],
  D: ["D+", "D", "D-"],
  F: ["F"],
  W: ["W"],
  Other: ["Other"],
};

export type GradeBar = { label: string; count: number; share: number; height: number };

export function gradeBars(d: Distribution): GradeBar[] {
  const labels: string[] = [...GROUPS, ...(d.counts.Other > 0 ? ["Other"] : [])];
  const count = (label: string) => COLUMNS[label]!.reduce((t, c) => t + (d.counts[c as keyof Distribution["counts"]] ?? 0), 0);
  const bars = labels.map((label) => ({ label, count: count(label), share: d.students > 0 ? count(label) / d.students : 0 }));
  const tallest = Math.max(1, ...bars.map((b) => b.count));
  return bars.map((b) => ({ ...b, height: b.count / tallest }));
}

export function gradeSummary(d: Distribution): { gpa: string | null; students: string } {
  return {
    gpa: d.averageGpa === null ? null : d.averageGpa.toFixed(2),
    students: `${d.students.toLocaleString("en-US")} ${d.students === 1 ? "student" : "students"}`,
  };
}

const SEASON: Record<string, string> = { "01": "Spring", "05": "Summer", "08": "Fall", "12": "Winter" };
const termName = (id: string) => `${SEASON[id.slice(4)] ?? "Term"} ${id.slice(0, 4)}`;

/** "Fall 2021 – Fall 2026" from sorted Testudo term ids. */
export function termSpan(terms: string[]): string {
  if (terms.length === 0) return "";
  const first = termName(terms[0]!);
  const last = termName(terms.at(-1)!);
  return first === last ? first : `${first} – ${last}`;
}
