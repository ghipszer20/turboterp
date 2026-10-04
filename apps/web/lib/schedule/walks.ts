// Walking time between back-to-back classes, for the plan editor's week view. Pure logic:
// building codes come from the sections' meetings, positions from the umd.io buildings list
// (served from the campus snapshot), minutes from the trip planner's walkMinutes estimate
// (straight line x detour factor at walking speed -- always shown as an estimate).

import { buildingByCode, type Building } from "@turboterp/campus-data/buildings";
import { distanceMeters } from "@turboterp/campus-data/buses";
import { walkMinutes } from "@turboterp/campus-data/trip";
import { WEEKDAYS, type Section, type Weekday } from "@turboterp/course-data/schedules";

export type Walk = {
  day: Weekday;
  from: string;
  to: string;
  fromCourse: string;
  toCourse: string;
  /** Estimated walk, rounded up. */
  minutes: number;
  /** Minutes between the end of one class and the start of the next. */
  gap: number;
  /** The walk takes longer than the gap. */
  tight: boolean;
};

/** Classes further apart than this aren't "back to back". */
const MAX_GAP = 60;

const DAY_NAMES: Record<Weekday, string> = { M: "Mon", Tu: "Tue", W: "Wed", Th: "Thu", F: "Fri" };

const isWeekday = (d: string): d is Weekday => (WEEKDAYS as readonly string[]).includes(d);

type Slot = { start: number; end: number; code: string; course: string };

export function dayWalks(placed: readonly Section[], buildings: readonly Building[]): Walk[] {
  const byDay = new Map<Weekday, Slot[]>();
  for (const s of placed) {
    for (const mt of s.meetings) {
      if (mt.start === null || mt.end === null || !mt.building) continue;
      for (const d of mt.days.filter(isWeekday)) {
        const list = byDay.get(d) ?? [];
        list.push({ start: mt.start, end: mt.end, code: mt.building, course: s.courseId });
        byDay.set(d, list);
      }
    }
  }
  // Consecutive means consecutive among all timed classes that day, so a class in an unknown
  // building between two known ones breaks the chain rather than being skipped over.
  const untimedBreaks = new Map<Weekday, Slot[]>();
  for (const s of placed) {
    for (const mt of s.meetings) {
      if (mt.start === null || mt.end === null || mt.building) continue;
      for (const d of mt.days.filter(isWeekday)) {
        const list = untimedBreaks.get(d) ?? [];
        list.push({ start: mt.start, end: mt.end, code: "", course: s.courseId });
        untimedBreaks.set(d, list);
      }
    }
  }

  const walks: Walk[] = [];
  for (const day of WEEKDAYS) {
    const slots = [...(byDay.get(day) ?? []), ...(untimedBreaks.get(day) ?? [])].sort((a, b) => a.start - b.start || a.end - b.end);
    for (let i = 0; i + 1 < slots.length; i++) {
      const a = slots[i]!;
      const b = slots[i + 1]!;
      const gap = b.start - a.end;
      if (!a.code || !b.code || gap < 0 || gap > MAX_GAP || a.code === b.code) continue;
      const from = buildingByCode(buildings, a.code);
      const to = buildingByCode(buildings, b.code);
      if (!from || !to) continue;
      const minutes = Math.max(1, Math.ceil(walkMinutes(distanceMeters(from.lat, from.lon, to.lat, to.lon))));
      walks.push({ day, from: a.code, to: b.code, fromCourse: a.course, toCourse: b.course, minutes, gap, tight: minutes > gap });
    }
  }
  return walks;
}

export const formatWalk = (w: Walk) => `${DAY_NAMES[w.day]} · ${w.from} → ${w.to} · ~${w.minutes} min walk (${w.gap} min between)`;

export const walkNote = (w: Walk) => `Tight: ~${w.minutes} min walk, ${w.gap} min between`;
