// Section-level helpers for the editor's side panel: the choices for one class, which
// section stands in for a group of interchangeable ones, ratings and grade summaries.

import { sectionsConflict, type Section } from "@turboterp/course-data/schedules";
import { gpaKey, NEUTRAL_RATING } from "@turboterp/course-data/sort";
import type { CourseGrades, Distribution } from "@turboterp/ratings";
import { clock } from "./calendar";

export const sectionKey = (s: Pick<Section, "courseId" | "id">) => `${s.courseId}/${s.id}`;

const DAY_ORDER: Record<string, number> = { M: 0, Tu: 1, W: 2, Th: 3, F: 4, Sa: 5, Su: 6 };

/** Minutes into the week of the section's first class (untimed sections sort last). */
function firstClass(s: Section): number {
  let best = Infinity;
  for (const m of s.meetings) {
    if (m.start === null) continue;
    for (const d of m.days) best = Math.min(best, (DAY_ORDER[d] ?? 7) * 1440 + m.start);
  }
  return best;
}

const byTime = (a: Section, b: Section) => firstClass(a) - firstClass(b) || a.id.localeCompare(b.id);

/** The lecture a section belongs to: same instructors and same lecture times. */
function lectureKey(s: Section): string {
  const lectures = s.meetings.filter((m) => m.type === "Lecture");
  const times = (lectures.length ? lectures : s.meetings)
    .map((m) => `${m.days.join("")}@${m.start}-${m.end}`)
    .sort()
    .join("|");
  return `${[...s.instructors].sort().join(";")}#${times}`;
}

export type SectionChoices = { sameLecture: Section[]; otherLectures: Section[] };

/**
 * The panel's lists for one course: "same lecture, other discussion" (the current section
 * included, so it can be highlighted), then "other lecture times" by first class of the week.
 * Full sections are never offered (owner rule). With no current section, everything is "other".
 */
export function sectionChoices(sections: Section[], current: Section | null): SectionChoices {
  const open = sections.filter((s) => s.seats.open > 0 || (current !== null && s.id === current.id));
  if (!current) return { sameLecture: [], otherLectures: [...open].sort(byTime) };
  const key = lectureKey(current);
  const same = open.filter((s) => lectureKey(s) === key).sort(byTime);
  const other = open.filter((s) => lectureKey(s) !== key).sort(byTime);
  return { sameLecture: same, otherLectures: other };
}

const rating = (s: Section, ratings: Readonly<Record<string, number>>) =>
  s.instructors.length === 0 ? NEUTRAL_RATING : Math.max(...s.instructors.map((n) => ratings[n] ?? NEUTRAL_RATING));

/** The section shown for a group of interchangeable sections: the best-rated instructor's (first on a tie). */
export function pickSection(group: Section[], ratings: Readonly<Record<string, number>>): Section {
  let best = group[0]!;
  for (const s of group) if (rating(s, ratings) > rating(best, ratings)) best = s;
  return best;
}

export type RatingTone = "good" | "fair" | "low" | "none";
export const ratingTone = (r: number | undefined | null): RatingTone =>
  r === undefined || r === null ? "none" : r >= 4 ? "good" : r >= 3 ? "fair" : "low";

export type GradeSummary = {
  bars: { letter: "A" | "B" | "C" | "D" | "F" | "W"; share: number }[];
  gpa: number | null;
  students: number;
};

const LETTERS = ["A", "B", "C", "D", "F", "W"] as const;

/** That professor in that course (first co-instructor with data), or null for "No grade data". */
export function gradeSummary(
  grades: Readonly<Record<string, CourseGrades>> | null,
  courseId: string,
  instructors: string[],
): GradeSummary | null {
  const course = grades?.[courseId];
  if (!course) return null;
  const d: Distribution | undefined = instructors.map((n) => course.byProfessor[n]).find((x) => x && x.students > 0);
  if (!d) return null;
  return { bars: LETTERS.map((letter) => ({ letter, share: d.shares[letter] })), gpa: d.averageGpa, students: d.students };
}

/** Instructors of a section, or of a group of interchangeable ones: "Ting Jiang +1". */
export function instructorLabel(pick: Section, group?: Section[]): string {
  const main = pick.instructors[0] ?? "TBA";
  const others = new Set((group ?? [pick]).flatMap((s) => s.instructors));
  others.delete(main);
  return others.size ? `${main} +${others.size}` : main;
}

export function bestRating(pick: Section, ratings: Readonly<Record<string, number>>): number | undefined {
  const rated = pick.instructors.map((n) => ratings[n]).filter((r): r is number => r !== undefined);
  return rated.length ? Math.max(...rated) : undefined;
}

/** "TuTh 9:30am–10:45am · F 11am–11:50am Discussion" */
export function meetingSummary(s: Section): string {
  return s.meetings
    .map((m) => {
      const kind = m.type === "Lecture" ? "" : ` ${m.type}`;
      if (m.start === null || m.end === null) return `Time TBA${kind}`;
      return `${m.days.join("")} ${clock(m.start)}–${clock(m.end)}${kind}`;
    })
    .join(" · ");
}

/** Build my own: the other placed courses this section would overlap (its own course is replaced, so skipped). */
export function overlapsWith(candidate: Section, placed: Section[]): string[] {
  return placed.filter((p) => p.courseId !== candidate.courseId && sectionsConflict(p, candidate)).map((p) => p.courseId);
}

/** Build my own: every pair of placed courses that overlap, each once. */
export function conflictPairs(placed: Section[]): [string, string][] {
  const out: [string, string][] = [];
  placed.forEach((a, i) => {
    for (const c of overlapsWith(a, placed.slice(i + 1))) out.push([a.courseId, c]);
  });
  return out;
}

/** Why "Recommended" liked a pick, in plain words: "4.6★ · avg GPA 3.4 · 12 open". Missing data is left out. */
export function recommendReason(
  s: Section,
  ratings: Readonly<Record<string, number>>,
  gpas: Readonly<Record<string, number>>,
): string {
  const parts: string[] = [];
  const rating = bestRating(s, ratings);
  if (rating !== undefined) parts.push(`${rating.toFixed(1)}★`);
  const g = s.instructors.map((n) => gpas[gpaKey(s.courseId, n)]).filter((x): x is number => x !== undefined);
  if (g.length) parts.push(`avg GPA ${Math.max(...g).toFixed(1)}`);
  parts.push(`${s.seats.open} open`);
  return parts.join(" · ");
}

/** Each instructor's average GPA per course, for the sort: `gpaKey(courseId, name)` → GPA. Skips missing data. */
export function gpasFor(
  gradesByDept: Readonly<Record<string, Record<string, CourseGrades> | "missing">>,
  courseIds: readonly string[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of courseIds) {
    const g = gradesByDept[id.slice(0, 4)];
    if (!g || g === "missing") continue;
    for (const [name, d] of Object.entries(g[id]?.byProfessor ?? {})) {
      if (d.students > 0 && d.averageGpa !== null) out[gpaKey(id, name)] = d.averageGpa;
    }
  }
  return out;
}
