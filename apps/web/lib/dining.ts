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

export const SEARCH_LIMIT_PER_HALL = 30;

/**
 * Foods whose name contains every word of `query`, across all halls' menus for the day
 * (menus in hall order; null for a hall that couldn't load). Results follow hall then meal
 * order and list an item once per hall + meal + station. A hall stops at SEARCH_LIMIT_PER_HALL
 * matches (its short name goes in `cappedHalls`); later halls carry on.
 */
export function searchMenus(
  menus: readonly (DiningMenu | null)[],
  query: string,
  filters: { hallId?: number | null; meal?: string | null } = {},
): { results: SearchMatch[]; cappedHalls: string[] } {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return { results: [], cappedHalls: [] };
  const words = q.split(/\s+/);
  const wantMeal = filters.meal?.trim().toLowerCase() || null;
  const results: SearchMatch[] = [];
  const cappedHalls: string[] = [];
  for (const menu of menus) {
    if (!menu) continue;
    if (filters.hallId != null && menu.hallId !== filters.hallId) continue;
    const hall = DINING_HALLS.find((h) => h.id === menu.hallId)?.short ?? String(menu.hallId);
    let count = 0;
    hallLoop: for (const meal of menu.meals) {
      if (wantMeal && meal.name.trim().toLowerCase() !== wantMeal) continue;
      for (const station of meal.stations) {
        const seen = new Set<string>();
        for (const item of station.items) {
          const name = item.name.toLowerCase();
          if (seen.has(name) || !words.every((w) => name.includes(w))) continue;
          seen.add(name);
          if (count === SEARCH_LIMIT_PER_HALL) {
            cappedHalls.push(hall);
            break hallLoop;
          }
          count++;
          results.push({ hallId: menu.hallId, hall, meal: meal.name, station: stationDisplayName(station.name), item });
        }
      }
    }
  }
  return { results, cappedHalls };
}

const MEAL_ORDER = ["breakfast", "brunch", "lunch", "dinner", "late night"];

/** Distinct meal names across the loaded menus, in day order (unknown names last, in first-seen order). */
export function mealsServed(menus: readonly (DiningMenu | null)[]): string[] {
  const names: string[] = [];
  for (const menu of menus) {
    for (const m of menu?.meals ?? []) if (!names.includes(m.name)) names.push(m.name);
  }
  const rank = (n: string) => {
    const i = MEAL_ORDER.indexOf(n.trim().toLowerCase());
    return i === -1 ? MEAL_ORDER.length : i;
  };
  return names.map((n, i) => ({ n, i })).sort((a, b) => rank(a.n) - rank(b.n) || a.i - b.i).map((x) => x.n);
}

/** The `?meal=` filter: the matching known meal (canonical case), or null when absent or unknown. */
export function mealFromQuery(raw: string | string[] | undefined, meals: readonly string[]): string | null {
  const first = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase();
  if (!first) return null;
  return meals.find((m) => m.trim().toLowerCase() === first) ?? null;
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

export type HallResultRow = { meal: string; station: string; items: string[] };
export type HallResultGroup = { hall: string; capped: boolean; rows: HallResultRow[] };

/** Groups search hits by hall (hit order), then meal + station rows in first-appearance order, keeping item order. */
export function groupSearchByHall(hits: readonly SearchMatch[], cappedHalls: readonly string[]): HallResultGroup[] {
  const halls = new Map<string, HallResultGroup>();
  for (const h of hits) {
    let g = halls.get(h.hall);
    if (!g) halls.set(h.hall, (g = { hall: h.hall, capped: cappedHalls.includes(h.hall), rows: [] }));
    const row = g.rows.find((r) => r.meal === h.meal && r.station === h.station);
    if (row) row.items.push(h.item.name);
    else g.rows.push({ meal: h.meal, station: h.station, items: [h.item.name] });
  }
  return [...halls.values()];
}
