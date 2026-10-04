// Semester difficulty: a 1-10 estimate for one planned term, from each course's PlanetTerp stats,
// the credit load and, when there is a transcript, how the student has done against course
// averages in each subject. Pure and framework-free; the caller maps its own data to these inputs.
// It never predicts a grade for a course, only how hard a term is likely to feel.

import { gradePoints } from "@turboterp/audit";

export type DifficultyStats = { averageGpa: number | null; wRate: number; fRate: number };
export type DifficultyCourse = { id: string; credits: number; stats: DifficultyStats | null };
/** A completed, letter-graded course with a known PlanetTerp average. */
export type DifficultyHistory = { id: string; grade: string; courseAverageGpa: number };
export type TermDifficulty = { score: number; sentence: string; personalized: boolean };

// Calibration constants.
const EASY_GPA = 3.8; // course average at or above this is the easy end
const HARD_GPA = 2.3; // course average at or below this is the hard end
const EASY_SCORE = 1;
const HARD_SCORE = 9;
const WF_WEIGHT = 10; // W+F share (0-1) times this is added, so 20% W+F adds 2
const NEUTRAL_BY_LEVEL = [3.5, 4.5, 5.5, 6.5]; // 1xx-4xx courses with no data
const SHRINK_K = 2; // department record weight n / (n + K)
const PERSONAL_SCALE = 2.5; // difficulty points per grade point above/below course averages
const PERSONAL_CAP = 1.5; // largest personal adjustment to one course, either way
const PERSONAL_NAME_MIN = 5; // a course must be at least this hard to be named in the personal clause
const PERSONAL_MIN = 0.25; // smallest record gap (grade points) worth mentioning
const HARD_COURSE = 7; // difficulty at or above this counts as "hard"
const HEAVY_CREDITS = 17;
const LIGHT_CREDITS = 12;
const EFFORT_BASE = 0.5; // effort per credit is EFFORT_BASE + difficulty / 10 (easy ~0.6, hard ~1.4)
const TYPICAL_EFFORT = 15; // 15 credits of average (difficulty 5) courses...
const TYPICAL_SCORE = 5; // ...score 5

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const dept = (id: string) => id.replace(/\d.*$/, "");

/** 0-10 difficulty of one course from its stats alone. */
export function courseDifficulty(course: DifficultyCourse): number {
  const s = course.stats;
  if (!s || s.averageGpa === null) {
    const level = Number(/\d/.exec(course.id)?.[0] ?? 2);
    return NEUTRAL_BY_LEVEL[clamp(level, 1, 4) - 1]!;
  }
  const span = (EASY_GPA - s.averageGpa) / (EASY_GPA - HARD_GPA);
  const base = EASY_SCORE + clamp(span, -0.4, 1.4) * (HARD_SCORE - EASY_SCORE);
  return clamp(base + (s.wRate + s.fRate) * WF_WEIGHT, 0, 10);
}

/** Per-department record: mean (grade points - course average), shrunk toward the overall mean. */
function record(history: DifficultyHistory[]): (id: string) => number {
  const deltas = new Map<string, number[]>();
  const all: number[] = [];
  for (const h of history) {
    const pts = gradePoints(h.grade);
    if (pts === undefined) continue;
    const d = pts - h.courseAverageGpa;
    all.push(d);
    const key = dept(h.id);
    deltas.set(key, [...(deltas.get(key) ?? []), d]);
  }
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const overall = all.length ? mean(all) : 0;
  return (id) => {
    const xs = deltas.get(dept(id)) ?? [];
    if (xs.length === 0) return overall;
    const w = xs.length / (xs.length + SHRINK_K);
    return w * mean(xs) + (1 - w) * overall;
  };
}

const list = (ids: string[]) => (ids.length === 2 ? `${ids[0]} and ${ids[1]}` : ids[0]!);

export function termDifficulty(courses: DifficultyCourse[], history: DifficultyHistory[]): TermDifficulty {
  const usable = history.filter((h) => gradePoints(h.grade) !== undefined);
  const personalized = usable.length > 0;
  const gap = personalized ? record(usable) : () => 0;

  const rows = courses.map((c) => {
    const delta = gap(c.id);
    const adjust = clamp(delta * PERSONAL_SCALE, -PERSONAL_CAP, PERSONAL_CAP);
    return { id: c.id, credits: c.credits, delta, difficulty: clamp(courseDifficulty(c) - adjust, 0, 10) };
  });
  const credits = rows.reduce((t, r) => t + r.credits, 0);
  // Workload: each course's credits weighted by its hardness, against a typical 15-credit term (about 5/10).
  const effort = rows.reduce((t, r) => t + r.credits * (EFFORT_BASE + r.difficulty / 10), 0);
  const byHardness = [...rows].sort((a, b) => b.difficulty - a.difficulty);
  const hard = byHardness.filter((r) => r.difficulty >= HARD_COURSE);
  const score = Math.round(clamp((effort / TYPICAL_EFFORT) * TYPICAL_SCORE, 1, 10));

  // One plain sentence from the one or two biggest drivers.
  const heavy = credits >= HEAVY_CREDITS;
  const light = credits > 0 && credits <= LIGHT_CREDITS;
  let base: string;
  if (hard.length >= 1) {
    const ids = hard.slice(0, 2).map((r) => r.id);
    base = ids.length === 2 ? `${list(ids)} are two of the harder courses here` : `${ids[0]} is the toughest course here`;
  } else if (heavy) base = `A heavy ${credits}-credit load`;
  else if (score <= 4) base = "Mostly lighter courses at a manageable load";
  else base = "A fairly typical mix of courses";

  // The personal clause only names a course worth mentioning that isn't a retake of a completed one.
  const done = new Set(usable.map((h) => h.id));
  const nameable = rows.filter((r) => r.difficulty >= PERSONAL_NAME_MIN && !done.has(r.id));
  const strongest = personalized && nameable.length ? nameable.reduce((best, r) => (Math.abs(r.delta) > Math.abs(best.delta) ? r : best)) : undefined;
  let extra = "";
  if (strongest && Math.abs(strongest.delta) >= PERSONAL_MIN) {
    extra =
      strongest.delta > 0
        ? `, though your strong ${dept(strongest.id)} record makes ${strongest.id} easier for you than most`
        : `, and your ${dept(strongest.id)} grades so far suggest ${strongest.id} will be tougher for you`;
  } else if (hard.length >= 1 && heavy) extra = `, on a heavy ${credits}-credit load`;
  else if (hard.length >= 1 && light) extra = `, though the ${credits}-credit load is light`;
  return { score, sentence: `${base}${extra}.`, personalized };
}
