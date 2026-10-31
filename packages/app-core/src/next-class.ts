// Today's hero: the student's next class today, from the picked sections of the saved schedule.
// Pure; the hero component loads the sections and the buildings and passes a walking estimate.

import { campusDate, campusMinutes } from "@turboterp/campus-data/dates";
import type { Section } from "@turboterp/course-data/schedules";
import { nextClassToday, weekdayOf } from "./schedule/leave-by";

export type TodayClass = {
  courseId: string;
  /** "2:00 PM" */
  start: string;
  /** "IRB 0324" */
  room: string;
  /** "1:46 PM", only when the previous class's building and a walking estimate are known. */
  leaveBy?: string;
  /** Building code of the class just before it, for the "from ..." text. */
  from?: string;
};

/** 840 -> "2:00 PM". */
function clock(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** `walk(fromCode, toCode)`: estimated walking minutes between two buildings, or null if unknown. */
export function nextClass(
  plan: readonly Section[] | null | undefined,
  now: Date,
  walk?: (from: string, to: string) => number | null,
): TodayClass | null {
  if (!plan || plan.length === 0) return null;
  const day = weekdayOf(campusDate(now));
  if (!day) return null;
  const next = nextClassToday(plan, day, campusMinutes(now));
  if (!next) return null;
  const meeting = plan
    .find((s) => s.courseId === next.courseId)
    ?.meetings.find((m) => m.start === next.start && m.days.includes(day));
  const room = [next.building, meeting?.room].filter(Boolean).join(" ");
  const out: TodayClass = { courseId: next.courseId, start: clock(next.start), room };
  if (next.before && walk) {
    const mins = walk(next.before.building, next.building);
    if (mins !== null) {
      out.leaveBy = clock(Math.max(next.before.end, next.start - Math.ceil(mins) - 2));
      out.from = next.before.building;
    }
  }
  return out;
}
