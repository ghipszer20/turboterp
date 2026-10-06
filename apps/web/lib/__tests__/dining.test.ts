import { describe, expect, it } from "vitest";
import type { DiningMenu } from "@turboterp/campus-data";
import {
  diningSlice,
  groupSearchHits,
  hallFromQuery,
  parseDiningQuery,
  resolveMeal,
  searchMenus,
  stationDisplayName,
  type SearchMatch,
} from "../dining";

describe("parseDiningQuery", () => {
  it("trims and collapses spaces", () => {
    expect(parseDiningQuery("  orange   chicken ")).toBe("orange chicken");
  });
  it("is null under 2 characters or absent", () => {
    expect(parseDiningQuery("a")).toBeNull();
    expect(parseDiningQuery(" a ")).toBeNull();
    expect(parseDiningQuery(undefined)).toBeNull();
  });
  it("takes the first of repeated params", () => {
    expect(parseDiningQuery(["xx", "yy"])).toBe("xx");
  });
});

describe("groupSearchHits", () => {
  const hit = (hall: string, meal: string, station: string, name: string): SearchMatch => ({
    hallId: 1,
    hall,
    meal,
    station,
    item: { name, labelUrl: null, diets: [], contains: [] },
  });
  it("groups by hall, meal and station, keeping item order", () => {
    const groups = groupSearchHits([
      hit("Yahentamitsi", "Lunch", "Grill", "Chicken Burger"),
      hit("Yahentamitsi", "Lunch", "Grill", "Chicken Wrap"),
      hit("Yahentamitsi", "Dinner", "Woks", "Orange Chicken"),
      hit("South", "Lunch", "Deli", "Chicken Club"),
    ]);
    expect(groups).toEqual([
      { hall: "Yahentamitsi", meal: "Lunch", station: "Grill", items: ["Chicken Burger", "Chicken Wrap"] },
      { hall: "Yahentamitsi", meal: "Dinner", station: "Woks", items: ["Orange Chicken"] },
      { hall: "South", meal: "Lunch", station: "Deli", items: ["Chicken Club"] },
    ]);
  });
  it("is empty for no hits", () => {
    expect(groupSearchHits([])).toEqual([]);
  });
});

const item = (name: string) => ({ name, labelUrl: null, diets: [], contains: [] });
const menu: DiningMenu = {
  hallId: 16,
  date: "2026-09-25",
  meals: [
    { name: "Breakfast", stations: [{ name: "Griddle", items: [item("Pancakes")] }] },
    { name: "Lunch", stations: [{ name: "Grill", items: [item("Burger")] }, { name: "Deli", items: [item("Club")] }] },
    { name: "Dinner", stations: [{ name: "Pasta", items: [item("Ziti")] }] },
  ],
};

describe("resolveMeal", () => {
  it("keeps the preferred meal when the hall serves it", () => {
    expect(resolveMeal(["Breakfast", "Lunch", "Dinner"], "Lunch")).toBe("Lunch");
  });

  it("falls back to the hall's first meal when it doesn't", () => {
    expect(resolveMeal(["Brunch", "Dinner"], "Lunch")).toBe("Brunch");
  });

  it("has no meal for a hall with no menu", () => {
    expect(resolveMeal([], "Lunch")).toBeNull();
    expect(resolveMeal(null, "Lunch")).toBeNull();
  });
});

describe("diningSlice", () => {
  it("carries every meal name but only the chosen meal's stations", () => {
    expect(diningSlice(menu, "Lunch")).toEqual({
      meals: ["Breakfast", "Lunch", "Dinner"],
      meal: "Lunch",
      stations: [
        { name: "Grill", items: [item("Burger")] },
        { name: "Deli", items: [item("Club")] },
      ],
    });
  });

  it("uses the first meal when the preferred one isn't served", () => {
    expect(diningSlice({ ...menu, meals: menu.meals.slice(2) }, "Lunch")).toMatchObject({
      meals: ["Dinner"],
      meal: "Dinner",
      stations: [{ name: "Pasta" }],
    });
  });

  it("marks a hall whose menu couldn't be loaded with meals: null", () => {
    expect(diningSlice(null, "Lunch")).toEqual({ meals: null, meal: null, stations: [] });
  });

  it("is empty but loaded for a hall that posted no menu", () => {
    expect(diningSlice({ ...menu, meals: [] }, "Lunch")).toEqual({ meals: [], meal: null, stations: [] });
  });
});

// Owner ruling: the "Breakfast" station shows breakfast-style food that's available beyond
// breakfast hours, so calling it "Breakfast" during lunch or dinner is confusing. Renamed for
// display only -- the underlying station name from UMD Dining is untouched (used as the React
// key and for the main/filler sort).
describe("stationDisplayName", () => {
  it("relabels the Breakfast station", () => {
    expect(stationDisplayName("Breakfast")).toBe("Breakfast Area");
  });

  it("matches case-insensitively and trims whitespace", () => {
    expect(stationDisplayName("breakfast")).toBe("Breakfast Area");
    expect(stationDisplayName(" BREAKFAST ")).toBe("Breakfast Area");
  });

  it("leaves other station names unchanged", () => {
    expect(stationDisplayName("Grill")).toBe("Grill");
    expect(stationDisplayName("Breakfast Sandwiches")).toBe("Breakfast Sandwiches");
  });
});

describe("hallFromQuery", () => {
  it("reads the hall a link asked for", () => {
    expect(hallFromQuery("16", [19, 16, 51])).toBe(16);
  });
  it("ignores a missing, malformed or unknown hall", () => {
    expect(hallFromQuery(undefined, [19, 16, 51])).toBeNull();
    expect(hallFromQuery("abc", [19, 16, 51])).toBeNull();
    expect(hallFromQuery("99", [19, 16, 51])).toBeNull();
  });
});

describe("searchMenus", () => {
  const south: DiningMenu = { ...menu, hallId: 16 };
  const yah: DiningMenu = {
    hallId: 19,
    date: "2026-09-25",
    meals: [
      { name: "Lunch", stations: [{ name: "Woks", items: [item("Spicy Chicken Burger")] }] },
      { name: "Dinner", stations: [{ name: "Breakfast", items: [item("Burger Bowl"), item("Burger Bowl")] }] },
    ],
  };
  // Menus come in DINING_HALLS order: 19 (Yahentamitsi), 16 (South Campus), 51.
  const all = [yah, south, null];

  it("ignores queries under 2 characters", () => {
    expect(searchMenus(all, "b").results).toEqual([]);
    expect(searchMenus(all, "  ").results).toEqual([]);
  });

  it("matches case-insensitively across halls and meals, once per station, in hall then meal order", () => {
    const { results } = searchMenus(all, "BURGER");
    expect(results.map((r) => [r.hall, r.meal, r.station, r.item.name])).toEqual([
      ["Yahentamitsi", "Lunch", "Woks", "Spicy Chicken Burger"],
      ["Yahentamitsi", "Dinner", "Breakfast Area", "Burger Bowl"],
      ["South Campus", "Lunch", "Grill", "Burger"],
    ]);
    expect(results[0]!.hallId).toBe(19);
  });

  it("needs every word, in any order", () => {
    expect(searchMenus(all, "burger chicken").results).toHaveLength(1);
    expect(searchMenus(all, "burger pasta").results).toEqual([]);
  });

  it("caps results and flags when more exist", () => {
    const big: DiningMenu = {
      hallId: 19,
      date: "d",
      meals: [{ name: "Lunch", stations: [{ name: "S", items: Array.from({ length: 70 }, (_, i) => item(`Taco ${i}`)) }] }],
    };
    const r = searchMenus([big], "taco");
    expect(r.results).toHaveLength(60);
    expect(r.capped).toBe(true);
    expect(searchMenus(all, "burger").capped).toBe(false);
  });
});
