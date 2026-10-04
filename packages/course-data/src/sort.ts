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

/** Weights of the "Recommended" score (sum to 1). Change them here. */
export const RECOMMEND_WEIGHTS = { rating: 0.4, gpa: 0.4, seats: 0.2 } as const;
/** Open seats at or above this count as "plenty": more adds nothing. */
export const SEATS_SATURATION = 10;
/** Score of a missing input (unrated, no grade data): neutral, so it neither helps nor hurts. */
export const NEUTRAL_SCORE = 0.5;

export const gpaKey = (courseId: string, instructor: string) => `${courseId}|${instructor}`;

/** One section's 0–1 "Recommended" score: professor rating, that professor's GPA in the course, open seats. */
export function sectionScore(s: Section, context: SortContext = {}): number {
  let rating = -1;
  let gpa = -1;
  for (const name of s.instructors) {
    const r = context.ratings?.[name];
    if (r != null) rating = Math.max(rating, (r - 1) / 4);
    const g = context.gpas?.[gpaKey(s.courseId, name)];
    if (g != null) gpa = Math.max(gpa, Math.max(0, (g - 2) / 2)); // 2.0 -> 0, 3.0 -> 0.5 (neutral), 4.0 -> 1
  }
  const seats = Math.min(Math.max(s.seats.open, 0), SEATS_SATURATION) / SEATS_SATURATION;
  return (
    RECOMMEND_WEIGHTS.rating * (rating < 0 ? NEUTRAL_SCORE : Math.min(rating, 1)) +
    RECOMMEND_WEIGHTS.gpa * (gpa < 0 ? NEUTRAL_SCORE : Math.min(gpa, 1)) +
    RECOMMEND_WEIGHTS.seats * seats
  );
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
  /** Sum over the layout's courses of `groupScore` (only worked out for the "recommended" sort; else 0). */
  score: number;
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
  return metricsWith(
    layout,
    (group) => courseRating(group, context.ratings),
    (group) => groupScore(group, context),
  );
}

// Scratch space reused across calls to avoid allocating per layout (hot path: ~100k layouts per sort).
// buckets[d][0 … counts[d]) are the day's meetings during one call; counts are reset before returning.
const buckets: Timed[][] = Array.from({ length: DAY_COUNT }, () => []);
const counts = new Int32Array(DAY_COUNT);

function metricsWith(layout: Layout, rate: (group: Group) => number, score?: (group: Group) => number): LayoutMetrics {
  let ratingSum = 0;
  let scoreSum = 0;
  let condensed = 0;
  for (const group of layout) {
    ratingSum += rate(group);
    if (score) scoreSum += score(group);
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
  return { rating, gapMinutes, condensed, days, earliestStart, latestEnd, score: scoreSum };
}

/**
 * THE definition of "Best first". Change the order here to change what "best" means.
 *   1. Higher average PlanetTerp rating of each course's best available instructor (unrated = NEUTRAL_RATING).
 *   2. Fewer idle minutes between classes on the same day.
 *   3. More condensed and toward midday: shorter days (first start to last end), plus a mild
 *      penalty for classes far from noon (MIDDAY_WEIGHT per minute). No cutoff hours; the student's
 *      own workday windows are a filter.
 * Open seats play no part: full sections are never generated.
 */
export function compareBest(a: LayoutMetrics, b: LayoutMetrics): number {
  return b.rating - a.rating || a.gapMinutes - b.gapMinutes || a.condensed - b.condensed;
}

/** "Recommended": higher summed section score first (rating, GPA, open seats), then the best-first order. */
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
  // Each group's score is worked out once too (groups are shared between layouts).
  const scored = new Map<Group, number>();
  const score =
    key === "recommended"
      ? (group: Group) => {
          let v = scored.get(group);
          if (v === undefined) scored.set(group, (v = groupScore(group, context)));
          return v;
        }
      : undefined;
  return layouts
    .map((layout) => ({ layout, metrics: metricsWith(layout, rate, score) }))
    .sort((a, b) => compare(a.metrics, b.metrics))
    .map((x) => x.layout);
}
