// Week-calendar geometry shared by the gallery's mini-calendars, the enlarged preview and the
// editor: one time scale with hour labels, blocks per weekday (with side-by-side lanes when
// classes overlap), and label fitting so text is hidden rather than clipped.

import type { Meeting, Weekday } from "@turboterp/course-data/schedules";

export const WEEKDAYS: readonly Weekday[] = ["M", "Tu", "W", "Th", "F"];
export const DAY_SHORT: Record<Weekday, string> = { M: "MON", Tu: "TUE", W: "WED", Th: "THU", F: "FRI" };
export const DAY_NAME: Record<Weekday, string> = {
  M: "Monday",
  Tu: "Tuesday",
  W: "Wednesday",
  Th: "Thursday",
  F: "Friday",
};

export type TimeScale = { start: number; end: number; /** every hour from start to end */ hours: number[] };

const DEFAULT_START = 8 * 60;
const DEFAULT_END = 17 * 60;

/** One scale for every calendar on screen: whole hours around the earliest start and latest end. */
export function timeScale(meetings: Iterable<Meeting>): TimeScale {
  let lo = Infinity;
  let hi = -Infinity;
  for (const m of meetings) {
    if (m.start === null || m.end === null) continue;
    lo = Math.min(lo, m.start);
    hi = Math.max(hi, m.end);
  }
  const start = lo === Infinity ? DEFAULT_START : Math.floor(lo / 60) * 60;
  const end = hi === -Infinity ? DEFAULT_END : Math.max(start + 60, Math.ceil(hi / 60) * 60);
  const hours: number[] = [];
  for (let t = start; t <= end; t += 60) hours.push(t);
  return { start, end, hours };
}

export const pct = (s: TimeScale, t: number) => ((t - s.start) / (s.end - s.start)) * 100;

/** 600 → "10am", 750 → "12:30pm" */
export function clock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${h % 12 || 12}${mm ? `:${String(mm).padStart(2, "0")}` : ""}${h >= 12 ? "pm" : "am"}`;
}

/** Hour-axis label: 480 → "8a", 720 → "12p" */
export const hourLabel = (minutes: number) => clock(minutes).replace(/m$/, "");

export type BlockInput<T = unknown> = { id: string; meeting: Meeting; ghost?: boolean; data?: T };
export type Block<T = unknown> = BlockInput<T> & {
  start: number;
  end: number;
  top: number;
  height: number;
  /** Side-by-side position among overlapping committed blocks. */
  lane: number;
  lanes: number;
  /** Overlaps another committed block on this day. */
  conflict: boolean;
};

const isWeekday = (d: string): d is Weekday => (WEEKDAYS as readonly string[]).includes(d);

export function dayBlocks<T>(items: BlockInput<T>[], scale: TimeScale): Record<Weekday, Block<T>[]> {
  const out = Object.fromEntries(WEEKDAYS.map((d) => [d, [] as Block<T>[]])) as Record<Weekday, Block<T>[]>;
  for (const item of items) {
    const { start, end, days } = item.meeting;
    if (start === null || end === null) continue;
    for (const d of days) {
      if (!isWeekday(d)) continue;
      out[d].push({
        ...item,
        start,
        end,
        top: pct(scale, start),
        height: ((end - start) / (scale.end - scale.start)) * 100,
        lane: 0,
        lanes: 1,
        conflict: false,
      });
    }
  }
  for (const d of WEEKDAYS) assignLanes(out[d].filter((b) => !b.ghost));
  return out;
}

/** Greedy lanes within each cluster of overlapping blocks; every block in a cluster shares its lane count. */
function assignLanes(blocks: Block[]): void {
  const sorted = [...blocks].sort((a, b) => a.start - b.start || a.end - b.end);
  let cluster: Block[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -Infinity;
  const close = () => {
    for (const b of cluster) b.lanes = laneEnds.length;
    cluster = [];
    laneEnds = [];
  };
  for (const b of sorted) {
    if (b.start >= clusterEnd) close();
    let lane = laneEnds.findIndex((end) => end <= b.start);
    if (lane === -1) lane = laneEnds.push(0) - 1;
    laneEnds[lane] = b.end;
    b.lane = lane;
    cluster.push(b);
    clusterEnd = Math.max(clusterEnd, b.end);
  }
  close();
  for (const a of sorted) a.conflict = sorted.some((b) => b !== a && a.start < b.end && b.start < a.end);
}

/** Meetings a Monday–Friday grid can't draw (online/TBA times, weekends); list them under it. */
export function untimed<T>(items: BlockInput<T>[]): BlockInput<T>[] {
  return items.filter(({ meeting: m }) => m.start === null || m.end === null || !m.days.some(isWeekday));
}

/**
 * How many label lines fit a block `height` px tall (vertically centered, tight line height).
 * A line that would be cut is hidden instead (owner rule: never clip labels).
 */
export function labelFit(height: number, metrics: { line: number; pad: number }): "two" | "one" | "none" {
  if (height >= 2 * metrics.line + metrics.pad) return "two";
  if (height >= metrics.line + metrics.pad) return "one";
  return "none";
}

/** Label lines for a block on a calendar of this size: the gallery's mini calendars show only color (owner, 2026-09-29). */
export function blockLines(size: "mini" | "zoom" | "large", height: number, metrics: { line: number; pad: number }): "two" | "one" | "none" {
  return size === "mini" ? "none" : labelFit(height, metrics);
}
