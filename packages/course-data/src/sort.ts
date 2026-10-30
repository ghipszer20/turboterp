// Sorting layouts. Each layout's numbers are worked out once, then the sort compares numbers.

import type { Layout } from "./schedules.ts";
import type { Section } from "./soc.ts";
import type { Meeting } from "./soc.ts";

export type SortKey = "best" | "fewestDays" | "latestStart" | "earliestFinish" | "fewestGaps" | "recommended";

export type SortContext = {
  /** PlanetTerp average rating (1–5) by instructor name, as Testudo spells it; missing or null = unrated. */
  ratings?: Readonly<Record<string, number | null | undefined>>;
  /** Average GPA (0–4) of an instructor in a course, keyed by `gpaKey(courseId, name)`; missing or null = no data. */
  gpas?: Readonly<Record<string, number | null | undefined>>;
};

/** Weights of the "Best Teachers" score (sort key "recommended"; sum to 1). Open seats don't count (owner, 2026-10-07). */
export const RECOMMEND_WEIGHTS = { rating: 0.5, gpa: 0.5 } as const;
/** Weights of the "Default" score (sort key "best"; sum to 1; owner, 2026-10-09). */
export const DEFAULT_WEIGHTS = { rating: 0.3, gpa: 0.3, timing: 0.4 } as const;
/** Score of a missing input (unrated, no grade data): neutral, so it neither helps nor hurts. */
export const NEUTRAL_SCORE = 0.5;

export const gpaKey = (courseId: string, instructor: string) => `${courseId}|${instructor}`;

/** One section's 0–1 rating and GPA components (neutral when missing). */
export function sectionParts(s: Section, context: SortContext = {}): { rating: number; gpa: number } {
  let rating = -1;
  let gpa = -1;
  for (const name of s.instructors) {
    const r = context.ratings?.[name];
    if (r != null) rating = Math.max(rating, (r - 1) / 4);
    const g = context.gpas?.[gpaKey(s.courseId, name)];
    if (g != null) gpa = Math.max(gpa, Math.max(0, (g - 2) / 2)); // 2.0 -> 0, 3.0 -> 0.5 (neutral), 4.0 -> 1
  }
  return { rating: rating < 0 ? NEUTRAL_SCORE : Math.min(rating, 1), gpa: gpa < 0 ? NEUTRAL_SCORE : Math.min(gpa, 1) };
}

/** One section's 0–1 "Best Teachers" score: professor rating and that professor's GPA in the course. */
export function sectionScore(s: Section, context: SortContext = {}): number {
  const p = sectionParts(s, context);
  return RECOMMEND_WEIGHTS.rating * p.rating + RECOMMEND_WEIGHTS.gpa * p.gpa;
}

export type GroupParts = { rating: number; gpa: number; score: number };

/** A choice group's best section (by `sectionScore`): its 0–1 rating and GPA parts and its score. */
export function groupParts(group: readonly Section[], context: SortContext = {}): GroupParts {
  let best: GroupParts = { rating: NEUTRAL_SCORE, gpa: NEUTRAL_SCORE, score: 0 };
  let found = false;
  for (const s of group) {
    const p = sectionParts(s, context);
    const score = RECOMMEND_WEIGHTS.rating * p.rating + RECOMMEND_WEIGHTS.gpa * p.gpa;
    if (!found || score > best.score) {
      best = { ...p, score };
      found = true;
    }
  }
  return best;
}

/** A choice group's score: its best section (the student can pick any of them). */
export function groupScore(group: readonly Section[], context: SortContext = {}): number {
  let best = 0;
  for (const s of group) best = Math.max(best, sectionScore(s, context));
  return best;
}

/** An unrated instructor counts as this rating: the middle of PlanetTerp's 1–5 scale. */
export const NEUTRAL_RATING = 3;
/** Noon, the middle of the day that step 3 of `compareBest` leans toward. */
export const MIDDAY = 12 * 60;
/** How much each minute a class's midpoint sits from noon counts against it, relative to a minute of day span. */
export const MIDDAY_WEIGHT = 0.25;

export type LayoutMetrics = {
  /** Average over courses of the best-rated instructor among the course's section choices. */
  rating: number;
  /** Idle minutes between classes on the same day, summed over the week. */
  gapMinutes: number;
  /** Lower is better: each day's span (first start to last end) plus MIDDAY_WEIGHT × each class's distance from noon. */
  condensed: number;
  /** Days with at least one timed class. */
  days: number;
  /** The earliest class start of the week (minutes after midnight). */
  earliestStart: number;
  /** The latest class end of the week. */
  latestEnd: number;
  /** Sum over the layout's courses of `groupScore` (the "Best Teachers" sort). */
  score: number;
  /** Average over courses of the best section's 0–1 rating score (see `sectionParts`). */
  ratingScore: number;
  /** Average over courses of the best section's 0–1 GPA score. */
  gpaScore: number;
  /** The Default score (`DEFAULT_WEIGHTS`), 0–1; set by `applyDefaultScores` once the set is known. Single layout: timing counts as 1. */
  weighted: number;
};

type Timed = { day: number; start: number; end: number };
type Group = Layout[number];
type GroupTimes = { timed: Timed[]; midday: number };

const DAY_INDEX: Record<string, number> = { M: 0, Tu: 1, W: 2, Th: 3, F: 4, Sa: 5, Su: 6 };
const DAY_COUNT = 8; // the seven days plus one slot for any unexpected day code

// Layouts from one generation share their choice-group arrays, so per-group work is done once.
const timesCache = new WeakMap<Group, GroupTimes>();

/**
 * A group's timed meetings (one entry per day) and their midday penalty.
 * Sections in a group meet at identical times, so the first stands in for all.
 */
function groupTimes(group: Group): GroupTimes {
  let out = timesCache.get(group);
  if (!out) {
    const timed: Timed[] = [];
    let midday = 0;
    for (const m of group[0]?.meetings ?? ([] as Meeting[])) {
      if (m.start === null || m.end === null) continue;
      for (const d of m.days) {
        timed.push({ day: DAY_INDEX[d] ?? DAY_COUNT - 1, start: m.start, end: m.end });
        midday += MIDDAY_WEIGHT * Math.abs((m.start + m.end) / 2 - MIDDAY);
      }
    }
    out = { timed, midday };
    timesCache.set(group, out);
  }
  return out;
}

function courseRating(group: Group, ratings: SortContext["ratings"]): number {
  let best = -Infinity;
  for (const s of group) {
    if (s.instructors.length === 0) best = Math.max(best, NEUTRAL_RATING);
    for (const name of s.instructors) best = Math.max(best, ratings?.[name] ?? NEUTRAL_RATING);
  }
  return best === -Infinity ? NEUTRAL_RATING : best;
}

export function layoutMetrics(layout: Layout, context: SortContext = {}): LayoutMetrics {
  const m = metricsWith(
    layout,
    (group) => courseRating(group, context.ratings),
    (group) => groupParts(group, context),
  );
  return applyDefaultScores([m])[0]!;
}

/** Fills in each metrics' Default score. Timing: 1 for the lowest `condensed` in the set, 0 for the highest, linear between (all equal: 1). */
export function applyDefaultScores(all: LayoutMetrics[]): LayoutMetrics[] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const m of all) {
    if (m.condensed < lo) lo = m.condensed;
    if (m.condensed > hi) hi = m.condensed;
  }
  const range = hi - lo;
  for (const m of all) {
    const timing = range > 0 ? (hi - m.condensed) / range : 1;
    m.weighted = DEFAULT_WEIGHTS.rating * m.ratingScore + DEFAULT_WEIGHTS.gpa * m.gpaScore + DEFAULT_WEIGHTS.timing * timing;
  }
  return all;
}

// Scratch space reused across calls to avoid allocating per layout (hot path: ~100k layouts per sort).
// buckets[d][0 … counts[d]) are the day's meetings during one call; counts are reset before returning.
const buckets: Timed[][] = Array.from({ length: DAY_COUNT }, () => []);
const counts = new Int32Array(DAY_COUNT);

function metricsWith(layout: Layout, rate: (group: Group) => number, parts: (group: Group) => GroupParts): LayoutMetrics {
  let ratingSum = 0;
  let scoreSum = 0;
  let ratingScoreSum = 0;
  let gpaScoreSum = 0;
  let condensed = 0;
  for (const group of layout) {
    ratingSum += rate(group);
    const p = parts(group);
    scoreSum += p.score;
    ratingScoreSum += p.rating;
    gpaScoreSum += p.gpa;
    const times = groupTimes(group);
    condensed += times.midday;
    for (const t of times.timed) buckets[t.day]![counts[t.day]!++] = t;
  }

  let gapMinutes = 0;
  let days = 0;
  let earliestStart = 24 * 60;
  let latestEnd = 0;
  for (let d = 0; d < DAY_COUNT; d++) {
    const n = counts[d]!;
    if (n === 0) continue;
    counts[d] = 0;
    days++;
    const meetings = buckets[d]!;
    // Insertion sort by start: a day holds a handful of meetings.
    for (let i = 1; i < n; i++) {
      const m = meetings[i]!;
      let j = i - 1;
      while (j >= 0 && meetings[j]!.start > m.start) {
        meetings[j + 1] = meetings[j]!;
        j--;
      }
      meetings[j + 1] = m;
    }
    const first = meetings[0]!.start;
    let reach = first;
    for (let i = 0; i < n; i++) {
      const m = meetings[i]!;
      if (m.start > reach) gapMinutes += m.start - reach;
      if (m.end > reach) reach = m.end;
    }
    condensed += reach - first;
    if (first < earliestStart) earliestStart = first;
    if (reach > latestEnd) latestEnd = reach;
  }
  const rating = layout.length === 0 ? NEUTRAL_RATING : ratingSum / layout.length;
  const n = layout.length;
  return {
    rating,
    gapMinutes,
    condensed,
    days,
    earliestStart,
    latestEnd,
    score: scoreSum,
    ratingScore: n === 0 ? NEUTRAL_SCORE : ratingScoreSum / n,
    gpaScore: n === 0 ? NEUTRAL_SCORE : gpaScoreSum / n,
    weighted: 0,
  };
}

/**
 * THE definition of "Default" (sort key "best"; labeled "Best first" before 2026-10-07). Change the order here to change what it means.
 * A weighted score, higher first (owner, 2026-10-09; `DEFAULT_WEIGHTS`):
 *   30% average PlanetTerp rating of each course's best section, 0–1 (rating (r-1)/4),
 *   30% average GPA of that teacher in the course, 0–1 (GPA (g-2)/2, clamped); missing = NEUTRAL_SCORE,
 *   40% timing: condensed and toward midday, 0–1 relative to the layouts sorted together
 *       (lowest `condensed` = 1, highest = 0). `condensed` is each day's span (first start to last end)
 *       plus MIDDAY_WEIGHT per minute a class sits from noon. No cutoff hours; the student's own
 *       workday windows are a filter.
 * Ties fall back to: higher PlanetTerp rating, fewer idle minutes between classes, lower `condensed`.
 * The score needs the whole set (`applyDefaultScores`; `sortLayouts` does it). Open seats play no part.
 */
export function compareBest(a: LayoutMetrics, b: LayoutMetrics): number {
  return b.weighted - a.weighted || b.rating - a.rating || a.gapMinutes - b.gapMinutes || a.condensed - b.condensed;
}

/** "Best Teachers" (sort key "recommended"): higher summed section score first (rating, GPA), then the Default order. */
export function compareRecommended(a: LayoutMetrics, b: LayoutMetrics): number {
  return b.score - a.score || compareBest(a, b);
}

const COMPARE: Record<SortKey, (a: LayoutMetrics, b: LayoutMetrics) => number> = {
  best: compareBest,
  fewestDays: (a, b) => a.days - b.days || compareBest(a, b),
  latestStart: (a, b) => b.earliestStart - a.earliestStart || compareBest(a, b),
  earliestFinish: (a, b) => a.latestEnd - b.latestEnd || compareBest(a, b),
  fewestGaps: (a, b) => a.gapMinutes - b.gapMinutes || compareBest(a, b),
  recommended: compareRecommended,
};

/** A new array in the chosen order; ties keep their original order. */
export function sortLayouts(layouts: readonly Layout[], key: SortKey = "best", context: SortContext = {}): Layout[] {
  const compare = COMPARE[key];
  // Ratings depend on this call's context, so their cache lives only as long as the call.
  const rated = new Map<Group, number>();
  const rate = (group: Group) => {
    let r = rated.get(group);
    if (r === undefined) rated.set(group, (r = courseRating(group, context.ratings)));
    return r;
  };
  // Each group's parts are worked out once too (groups are shared between layouts).
  const parted = new Map<Group, GroupParts>();
  const parts = (group: Group) => {
    let v = parted.get(group);
    if (v === undefined) parted.set(group, (v = groupParts(group, context)));
    return v;
  };
  const items = layouts.map((layout) => ({ layout, metrics: metricsWith(layout, rate, parts) }));
  applyDefaultScores(items.map((x) => x.metrics));
  return items.sort((a, b) => compare(a.metrics, b.metrics)).map((x) => x.layout);
}
