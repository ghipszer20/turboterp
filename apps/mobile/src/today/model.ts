// Today's view models, mapped from the /api/v1/today payload. Pure: the screen recomputes them from
// the device clock every minute, so "open now" and "closes in 20 min" never go stale.

import type { AcademicEvent, DiningMenu, StampVenue } from "@turboterp/campus-data";
import { dedupeEvents, eventTitle, formatEventDate, isKeyEvent, isPast } from "@turboterp/app-core/calendar";
import { pickDay, type CampusClock } from "@turboterp/app-core/campus-clock";
import { stampSummary } from "@turboterp/app-core/stamp";
import { currentMealName, mealFoods } from "@turboterp/app-core/status";
import type { TodayClass } from "@turboterp/app-core/next-class";

export type Part<T> = { ok: true; data: T } | { ok: false; error: string };
export type DiningBundle = { days: Record<string, Part<DiningMenu>[]> };

export type TodayPayload = {
  calendar: Part<AcademicEvent[]>;
  dining: Part<DiningBundle>;
  stamp: Part<StampVenue[]>;
};

const isPart = (x: unknown): boolean => typeof x === "object" && x !== null && typeof (x as { ok?: unknown }).ok === "boolean";

/** Shape check for the v1 client: the three parts Today reads are each { ok, ... }. */
export function isTodayPayload(x: unknown): x is TodayPayload {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return isPart(o.calendar) && isPart(o.dining) && isPart(o.stamp);
}

// Same order as the payload's per-hall menus (campus-data DINING_HALLS; that module pulls in a
// Node-only HTML parser, so the three halls are listed here).
export const DINING_HALLS = [
  { id: 19, short: "Yahentamitsi" },
  { id: 16, short: "South Campus" },
  { id: 51, short: "251 North" },
] as const;

export type Tile = { key: string; title: string; sub: string };

export function dateLabel(clock: CampusClock): string {
  // Noon avoids a day shift: the campus date is a calendar day, not an instant.
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(
    new Date(`${clock.today}T12:00:00Z`),
  );
}

export function diningTiles(payload: TodayPayload, clock: CampusClock): Tile[] {
  const bundle = payload.dining.ok ? payload.dining.data : null;
  const menus = (bundle ? pickDay(bundle.days, clock.today)?.value : null) ?? [];
  const meal = currentMealName(clock.minutes);
  const tiles: Tile[] = DINING_HALLS.map((hall, i) => {
    const r = menus[i];
    const m = r?.ok ? (r.data.meals.find((x) => x.name === meal) ?? r.data.meals[0]) : undefined;
    return { key: String(hall.id), title: hall.short, sub: !r?.ok ? "Menu unavailable" : m ? mealFoods(m) : "No menu posted today" };
  });
  if (payload.stamp.ok) {
    tiles.push({ key: "stamp", title: "Stamp", sub: stampSummary(payload.stamp.data, clock.today, clock.minutes) });
  }
  return tiles;
}

/** The next few key academic dates that have not finished, soonest first. */
export function upcomingDates(payload: TodayPayload, clock: CampusClock, count = 4): Tile[] {
  if (!payload.calendar.ok) return [];
  return dedupeEvents(payload.calendar.data.filter(isKeyEvent))
    .filter((e) => !isPast(e, clock.today))
    .slice(0, count)
    .map((e) => ({ key: `${e.start}-${e.label}`, title: eventTitle(e), sub: formatEventDate(e) }));
}

export type HeroModel = { label: string; title: string; sub: string; href?: "/schedule" };

/** The hero: the next class today, else the next academic date, else a prompt to save a schedule. */
export function heroModel(next: TodayClass | null, upNext: Tile | null): HeroModel {
  if (next) {
    const leave = next.leaveBy ? `leave by ${next.leaveBy.replace(/ [AP]M$/, "")}${next.from ? ` from ${next.from}` : ""}` : null;
    return {
      label: "Next class",
      title: `${next.courseId} · ${next.start}`,
      sub: [next.room, leave].filter(Boolean).join(" · "),
      href: "/schedule",
    };
  }
  if (upNext) return { label: "Up next", title: upNext.title, sub: upNext.sub };
  return { label: "Next class", title: "No class left today", sub: "Save a schedule to see your next class here", href: "/schedule" };
}

export function seatAlertsCard(watching: number): { title: string; sub: string } | null {
  if (watching <= 0) return null;
  return { title: `Seat Alerts: ${watching} watching`, sub: "We'll notify you when a seat opens." };
}

/** A fetch that never reached the server (airplane mode, no signal), as opposed to a server error. */
export function isOfflineError(message: string): boolean {
  return /network request failed|failed to fetch|network error|internet connection appears to be offline/i.test(message);
}
