// Dining view models. Pure: screens recompute them from the device clock every minute, so open /
// closing text never goes stale. Mirrors the web's DiningClient / DiningView / HallResults.

import type { DietTag, DiningMenu, MenuItem, Meal, Station, StampVenue } from "@turboterp/campus-data";
import { pickDay, type CampusClock } from "@turboterp/app-core/campus-clock";
import {
  DINING_HALLS,
  groupSearchByHall,
  mealFromQuery,
  mealsServed,
  parseDiningQuery,
  searchMenus,
  stationDisplayName,
  type HallResultGroup,
} from "@turboterp/app-core/dining";
import { OTHER_STAMP_VENUES } from "@turboterp/app-core/stamp";
import { currentMealName, FILLER, hoursLabel, hoursStatus, mealFoods, type Status } from "@turboterp/app-core/status";

export type Part<T> = { ok: true; data: T } | { ok: false; error: string };
export type DiningBundle = { days: Record<string, Part<DiningMenu>[]> };
export type DiningPayload = { halls: unknown; bundle: DiningBundle };

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null;

/** Shape check for /api/v1/dining/search-index (the bundle itself). */
export function isFoodIndex(x: unknown): x is DiningBundle {
  return isObj(x) && isObj(x.days);
}

/** Shape check for /api/v1/dining: { halls, bundle }. */
export function isDiningPayload(x: unknown): x is DiningPayload {
  return isObj(x) && isFoodIndex(x.bundle);
}

/** Shape check for /api/v1/dining/stamp: the venue list. */
export function isStampPayload(x: unknown): x is StampVenue[] {
  return Array.isArray(x);
}

/** The preferred (current) meal first when the hall serves it; the others keep their order. */
export function mealsCurrentFirst(meals: readonly string[], preferred: string): string[] {
  return meals.includes(preferred) ? [preferred, ...meals.filter((m) => m !== preferred)] : [...meals];
}

export type HallCard = {
  id: number;
  name: string;
  /** Meal names served today, current meal first; null when the hall's menu couldn't load. */
  meals: string[] | null;
  currentMeal: string | null;
  menu: DiningMenu | null;
  /** The main foods of the current meal, or why there are none. */
  sub: string;
};

export function todaysMenus(bundle: DiningBundle, clock: CampusClock): Part<DiningMenu>[] {
  return pickDay(bundle.days, clock.today)?.value ?? [];
}

export function hallCards(bundle: DiningBundle, clock: CampusClock): HallCard[] {
  const results = todaysMenus(bundle, clock);
  const preferred = currentMealName(clock.minutes);
  return DINING_HALLS.map((hall, i) => {
    const r = results[i];
    if (!r?.ok) return { id: hall.id, name: hall.short, meals: null, currentMeal: null, menu: null, sub: "Menu unavailable" };
    const names = r.data.meals.map((m) => m.name);
    const meals = mealsCurrentFirst(names, preferred);
    const current = meals[0] ?? null;
    const meal = r.data.meals.find((m) => m.name === current);
    return {
      id: hall.id,
      name: hall.short,
      meals,
      currentMeal: current,
      menu: r.data,
      sub: meal ? `${meal.name}: ${mealFoods(meal)}` : "No menu posted today",
    };
  });
}

/** A meal's stations after diet / allergen filters; main stations first, sides and desserts after. */
export function menuStations(meal: Meal | undefined, diets: readonly DietTag[], avoid: readonly string[]): Station[] {
  if (!meal) return [];
  return meal.stations
    .map((s) => ({
      ...s,
      name: stationDisplayName(s.name),
      items: s.items.filter((i) => diets.every((d) => i.diets.includes(d)) && avoid.every((a) => !i.contains.includes(a))),
    }))
    .filter((s) => s.items.length > 0)
    .sort((a, b) => Number(FILLER.test(a.name)) - Number(FILLER.test(b.name)));
}

export const DIETS: { tag: DietTag; label: string }[] = [
  { tag: "vegetarian", label: "Vegetarian" },
  { tag: "vegan", label: "Vegan" },
  { tag: "halal", label: "Halal-friendly" },
];

// Allergen flags as nutrition.umd.edu labels them.
export const ALLERGENS = ["dairy", "gluten", "egg", "soy", "nuts", "sesame", "fish", "shellfish", "pork"];

export function dietLabel(item: MenuItem): string[] {
  const out: string[] = [];
  if (item.diets.includes("vegan")) out.push("Vegan");
  else if (item.diets.includes("vegetarian")) out.push("Vegetarian");
  if (item.diets.includes("halal")) out.push("Halal");
  return out;
}

/** Find a food: today's matches grouped by hall, then meal + station. */
export function searchModel(
  bundle: DiningBundle,
  clock: CampusClock,
  rawQuery: string,
  hallId: number | null,
  meal: string | null,
): HallResultGroup[] {
  const query = parseDiningQuery(rawQuery);
  if (!query) return [];
  const menus = todaysMenus(bundle, clock).map((r) => (r.ok ? r.data : null));
  const { results, cappedHalls } = searchMenus(menus, query, { hallId, meal });
  return groupSearchByHall(results, cappedHalls);
}

/** The meal names offered as search filters, in day order. */
export function searchMeals(bundle: DiningBundle, clock: CampusClock): string[] {
  return mealsServed(todaysMenus(bundle, clock).map((r) => (r.ok ? r.data : null)));
}

export { mealFromQuery, parseDiningQuery };

export type StampRow = { key: string; name: string; status: Status; text: string; hours?: string };

/** Stamp venues with live open / closing text, then the venues UMD publishes no hours for. */
export function stampRows(venues: StampVenue[], clock: CampusClock): StampRow[] {
  const rows: StampRow[] = venues.map((v) => {
    const today = v.days[clock.today];
    const tomorrow = v.days[clock.tomorrow];
    const s = hoursStatus(today, clock.minutes, tomorrow);
    return { key: v.id, name: v.name, status: s.status, text: s.text, hours: hoursLabel(today, tomorrow) };
  });
  for (const name of OTHER_STAMP_VENUES) {
    rows.push({ key: name, name, status: "unknown", text: "Hours not published by UMD Dining" });
  }
  return rows;
}
