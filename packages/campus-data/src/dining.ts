// Dining hall menus from nutrition.umd.edu.
// Page layout (observed 2026-09-24): meal tabs (.nav-link → #pane-N), each pane
// holds one .card per station (h3.card-title), each card holds
// .menu-item-row entries with a.menu-item-name and img.nutri-icon labels.

import * as cheerio from "cheerio";
import { toUsDate } from "./dates.ts";
import { fetchText, SourceError } from "./http.ts";

export const DINING_HALLS = [
  { id: 19, name: "Yahentamitsi Dining Hall", short: "Yahentamitsi" },
  { id: 16, name: "South Campus Dining Hall", short: "South Campus" },
  { id: 51, name: "251 North", short: "251 North" },
] as const;

export type DiningHallId = (typeof DINING_HALLS)[number]["id"];

export type DietTag = "vegan" | "vegetarian" | "halal";

export type MenuItem = {
  name: string;
  /** Link to the item's nutrition label on nutrition.umd.edu. */
  labelUrl: string | null;
  diets: DietTag[];
  /** Normalized allergen/ingredient flags, e.g. "dairy", "gluten", "shellfish". */
  contains: string[];
};

export type Station = { name: string; items: MenuItem[] };
export type Meal = { name: string; stations: Station[] };
export type DiningMenu = { hallId: number; date: string; meals: Meal[] };

const BASE = "https://nutrition.umd.edu/";

function classifyIcon(alt: string): { diet?: DietTag; contains?: string } {
  const a = alt.trim();
  if (/^vegan$/i.test(a)) return { diet: "vegan" };
  if (/^vegetarian$/i.test(a)) return { diet: "vegetarian" };
  if (/halal/i.test(a)) return { diet: "halal" };
  const m = /^contains\s+(.+)$/i.exec(a);
  if (m) return { contains: m[1]!.toLowerCase().replace(/[_\s]+/g, " ").trim() };
  return {};
}

const SMALL_WORDS = new Set(["a", "an", "and", "as", "at", "for", "in", "of", "on", "or", "the", "to", "with"]);

/** Tidies UMD Dining's item names: "Watercress,VeganFeta" → "Watercress, VeganFeta", "Chicken , Ham" → "Chicken, Ham", and
 *  all-caps names to title case ("BLT WITH LEMON HERB AIOLI" → "BLT with Lemon Herb Aioli": short words stay as acronyms). */
export function tidyItemName(raw: string): string {
  const name = raw.replace(/\s+/g, " ").trim().replace(/ +,/g, ",").replace(/,(?=\p{L})/gu, ", ");
  if (/\p{Ll}/u.test(name)) return name;
  return name
    .split(" ")
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i > 0 && SMALL_WORDS.has(lower)) return lower;
      if (/^\p{Lu}{2,3}$/u.test(word) && !SMALL_WORDS.has(lower)) return word;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function parseDiningMenu(html: string, hallId: number, isoDate: string): DiningMenu {
  const $ = cheerio.load(html);
  const meals: Meal[] = [];

  $("a.nav-link[href^='#pane-']").each((_, tab) => {
    const mealName = $(tab).text().trim();
    const paneId = $(tab).attr("href")!.slice(1);
    const stations: Station[] = [];

    $(`#${paneId} .card`).each((_, card) => {
      const name = $(card).find(".card-title").first().text().trim();
      const items: MenuItem[] = [];
      $(card)
        .find(".menu-item-row")
        .each((_, row) => {
          const link = $(row).find("a.menu-item-name").first();
          const itemName = tidyItemName(link.text());
          if (!itemName) return;
          const diets = new Set<DietTag>();
          const contains = new Set<string>();
          $(row)
            .find("img.nutri-icon")
            .each((_, img) => {
              const c = classifyIcon($(img).attr("alt") ?? "");
              if (c.diet) diets.add(c.diet);
              if (c.contains) contains.add(c.contains);
            });
          const href = link.attr("href");
          items.push({
            name: itemName,
            labelUrl: href ? new URL(href, BASE).toString() : null,
            diets: [...diets],
            contains: [...contains],
          });
        });
      if (name && items.length > 0) stations.push({ name, items });
    });

    if (mealName) meals.push({ name: mealName, stations });
  });

  if ($("#location-select-menu").length === 0) {
    throw new SourceError("dining", "page layout changed: location selector missing");
  }
  return { hallId, date: isoDate, meals };
}

export function diningMenuUrl(hallId: number, isoDate: string): string {
  const params = new URLSearchParams({ locationNum: String(hallId), dtdate: toUsDate(isoDate) });
  return `${BASE}?${params}`;
}

export async function fetchDiningMenu(hallId: number, isoDate: string): Promise<DiningMenu> {
  const html = await fetchText("dining", diningMenuUrl(hallId, isoDate));
  return parseDiningMenu(html, hallId, isoDate);
}
