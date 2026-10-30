// Pure logic for the Gyms page "Classes" section: day/kind/place filtering and
// the "Sign-ups open ..." note. RecWell opens sign-ups 24 hours before class.
//
// Hard rule (owner/legal): the class timetable comes from recwell.umd.edu; the
// "Sign up" link only opens the class's ActiveTerp page in a new tab. We never
// fetch ActiveTerp and never handle UMD credentials.

import { classKind, classPlace, type ClassKind, type ClassPlace, type FitnessClass } from "@turboterp/campus-data";

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export const CLASS_KINDS: ClassKind[] = ["Mind-body", "Cycling", "Strength", "Dance & cardio", "Aqua"];
export const CLASS_PLACES: Exclude<ClassPlace, "Other">[] = ["Eppley", "Ritchie", "Regents"];

const DAY_MS = 86_400_000;

const dayIndexOf = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`).getUTCDay();

export function weekdayOf(isoDate: string): string {
  return WEEKDAYS[dayIndexOf(isoDate)]!;
}

/** Minutes after midnight -> "7:30 AM". */
export function clockLabel(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export type ClassFilter = { day: string; kind?: ClassKind | null; place?: ClassPlace | null };

/** One day's classes, earliest first, narrowed by kind and place. */
export function filterClasses(classes: FitnessClass[], { day, kind, place }: ClassFilter): FitnessClass[] {
  return classes
    .filter((c) => c.day === day && (!kind || classKind(c.name) === kind) && (!place || classPlace(c.location) === place))
    .sort((a, b) => a.start - b.start || a.name.localeCompare(b.name));
}

/**
 * "Sign-ups open Friday 6:00 PM" when the class is more than 24 hours away,
 * else null. The timetable repeats weekly, so a class on an earlier weekday
 * than today is next week's; a class earlier today has already started.
 */
export function signupNote(c: FitnessClass, todayIso: string, nowMinutes: number): string | null {
  const offset = (WEEKDAYS.indexOf(c.day as (typeof WEEKDAYS)[number]) - dayIndexOf(todayIso) + 7) % 7;
  const opensAt = offset * 1440 + c.start - 1440; // minutes from today's midnight
  if (opensAt <= nowMinutes) return null;
  const opensDate = new Date(Date.parse(`${todayIso}T00:00:00Z`) + Math.floor(opensAt / 1440) * DAY_MS);
  return `Sign-ups open ${WEEKDAYS[opensDate.getUTCDay()]} ${clockLabel(opensAt % 1440)}`;
}
