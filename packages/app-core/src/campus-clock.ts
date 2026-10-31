import { addDays, campusDate, campusMinutes } from "@turboterp/campus-data/dates";

/** Campus date and time of day, worked out in the browser so cached pages stay correct as time passes. */
export type CampusClock = { today: string; tomorrow: string; minutes: number };

export function clockAt(now: Date): CampusClock {
  const today = campusDate(now);
  return { today, tomorrow: addDays(today, 1), minutes: campusMinutes(now) };
}

/** The entry for `today`, else the newest entry (a cached page that hasn't been rebuilt since midnight). */
export function pickDay<T>(days: Record<string, T>, today: string): { date: string; value: T } | null {
  const dates = Object.keys(days).sort();
  const date = today in days ? today : dates[dates.length - 1];
  return date === undefined ? null : { date, value: days[date]! };
}
