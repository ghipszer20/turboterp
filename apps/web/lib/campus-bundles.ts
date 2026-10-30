// Data for the cached pages. Pages are prerendered and rebuilt only when their data changes, so they
// can't know the date or time. These return data for today and tomorrow as of the rebuild; the browser
// picks by its own clock (lib/campus-clock.ts).

import { addDays, campusDate } from "@turboterp/campus-data/dates";
import type { DiningMenu } from "@turboterp/campus-data";
import { cacheLife, cacheTag } from "next/cache";
import { getAllDiningMenus, getStudyRooms, type Result, type StudyRooms } from "./campus";

export type DiningBundle = { days: Record<string, Result<DiningMenu>[]> };

export async function getDiningBundle(): Promise<DiningBundle> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 1800, expire: 86400 });
  cacheTag("campus:dining");
  const today = campusDate();
  const tomorrow = addDays(today, 1);
  const [a, b] = await Promise.all([getAllDiningMenus(today), getAllDiningMenus(tomorrow)]);
  return { days: { [today]: a, [tomorrow]: b } };
}

export type StudyRoomsToday = StudyRooms & { date: string };

export async function getStudyRoomsToday(): Promise<StudyRoomsToday> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 1800, expire: 86400 });
  cacheTag("campus:rooms");
  const date = campusDate();
  return { ...(await getStudyRooms(date)), date };
}
