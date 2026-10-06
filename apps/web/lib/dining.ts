// What the dining page sends for one hall: every meal's name (for the meal
// tabs) but only the viewed meal's stations. Shared by the page's first
// render and /api/dining, so taps render exactly like the first view.

import { DINING_HALLS, type DiningMenu, type MenuItem, type Station } from "@turboterp/campus-data";

export type DiningSlice = {
  /** Meal names the hall serves today; null when its menu couldn't be loaded. */
  meals: string[] | null;
  /** The meal whose stations are included (null when the hall posted no menu). */
  meal: string | null;
  stations: Station[];
};

/** The preferred meal if the hall serves it, else the hall's first meal. */
export function resolveMeal(meals: string[] | null, preferred: string): string | null {
  if (!meals || meals.length === 0) return null;
  return meals.includes(preferred) ? preferred : meals[0]!;
}

export function diningSlice(menu: DiningMenu | null, preferredMeal: string): DiningSlice {
  if (!menu) return { meals: null, meal: null, stations: [] };
  const meals = menu.meals.map((m) => m.name);
  const meal = resolveMeal(meals, preferredMeal);
  return { meals, meal, stations: menu.meals.find((m) => m.name === meal)?.stations ?? [] };
}

// Owner ruling: the "Breakfast" station serves breakfast-style food that's shown at lunch and
// dinner too, so labeling it "Breakfast" then reads as wrong. This only relabels what's shown --
// the station's real name from UMD Dining (used as the React key and for the main/filler sort)
// is untouched. Add more display-name overrides here if the owner flags other station names.
const STATION_DISPLAY_NAMES: Record<string, string> = {
  breakfast: "Breakfast Area",
};

/** The station name to display, applying any owner-requested rename (case/whitespace-insensitive). */
export function stationDisplayName(name: string): string {
  return STATION_DISPLAY_NAMES[name.trim().toLowerCase()] ?? name;
}

/** The hall a link asked for (`/campus/dining?hall=16`, from Today's rows), or null if absent or unknown. */
export type SearchMatch = { hallId: number; hall: string; meal: string; station: string; item: MenuItem };

export const SEARCH_LIMIT = 60;

/**
 * Foods whose name contains every word of `query`, across all halls' menus for the day
 * (menus in hall order; null for a hall that couldn't load). Results follow hall then meal
 * order, list an item once per hall + meal + station, and stop at SEARCH_LIMIT (`capped`).
 */
export function searchMenus(
  menus: readonly (DiningMenu | null)[],
  query: string,
): { results: SearchMatch[]; capped: boolean } {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return { results: [], capped: false };
  const words = q.split(/\s+/);
  const results: SearchMatch[] = [];
  for (const menu of menus) {
    if (!menu) continue;
    const hall = DINING_HALLS.find((h) => h.id === menu.hallId)?.short ?? String(menu.hallId);
    for (const meal of menu.meals) {
      for (const station of meal.stations) {
        const seen = new Set<string>();
        for (const item of station.items) {
          const name = item.name.toLowerCase();
          if (seen.has(name) || !words.every((w) => name.includes(w))) continue;
          seen.add(name);
          if (results.length === SEARCH_LIMIT) return { results, capped: true };
          results.push({ hallId: menu.hallId, hall, meal: meal.name, station: stationDisplayName(station.name), item });
        }
      }
    }
  }
  return { results, capped: false };
}

export function hallFromQuery(raw: string | string[] | undefined, hallIds: readonly number[]): number | null {
  const id = typeof raw === "string" && raw !== "" ? Number(raw) : NaN;
  return hallIds.includes(id) ? id : null;
}

/** The `?q=` food search from the URL: trimmed, spaces collapsed; null when under 2 characters. */
export function parseDiningQuery(raw: string | string[] | undefined): string | null {
  const first = Array.isArray(raw) ? raw[0] : raw;
  const q = (first ?? "").trim().replace(/\s+/g, " ");
  return q.length >= 2 ? q : null;
}

export type SearchGroup = { hall: string; meal: string; station: string; items: string[] };

/** Groups search hits by hall + meal + station, in order of first appearance (hall, then meal), keeping item order. */
export function groupSearchHits(hits: readonly SearchMatch[]): SearchGroup[] {
  const groups = new Map<string, SearchGroup>();
  for (const h of hits) {
    const key = `${h.hall}|${h.meal}|${h.station}`;
    const g = groups.get(key);
    if (g) g.items.push(h.item.name);
    else groups.set(key, { hall: h.hall, meal: h.meal, station: h.station, items: [h.item.name] });
  }
  return [...groups.values()];
}
