import { describe, expect, it } from "vitest";
import type { DiningMenu, StampVenue } from "@turboterp/campus-data";
import {
  dietLabel,
  hallCards,
  isDiningPayload,
  isFoodIndex,
  menuStations,
  mealsCurrentFirst,
  searchModel,
  stampRows,
} from "../src/dining/model";

const item = (name: string, diets: ("vegan" | "vegetarian" | "halal")[] = [], contains: string[] = []) => ({
  name,
  labelUrl: null,
  diets,
  contains,
});
const menu = (hallId: number): DiningMenu => ({
  hallId,
  date: "2026-10-31",
  meals: [
    { name: "Breakfast", stations: [{ name: "Breakfast", items: [item("Scrambled Eggs")] }] },
    {
      name: "Lunch",
      stations: [
        { name: "Sides", items: [item("Rice", ["vegan"])] },
        { name: "Grill", items: [item("Cheese Pizza", ["vegetarian"], ["dairy"]), item("Chicken Wrap", ["halal"])] },
      ],
    },
    { name: "Dinner", stations: [{ name: "Grill", items: [item("Cheese Pizza")] }] },
  ],
});
const ok = (m: DiningMenu) => ({ ok: true as const, data: m });
const bundle = { days: { "2026-10-31": [ok(menu(19)), { ok: false as const, error: "x" }, ok(menu(51))] } };
const clock = { today: "2026-10-31", tomorrow: "2026-11-01", minutes: 12 * 60 + 30 };

describe("meals", () => {
  it("puts the current meal first, keeping the rest in order", () => {
    expect(mealsCurrentFirst(["Breakfast", "Lunch", "Dinner"], "Lunch")).toEqual(["Lunch", "Breakfast", "Dinner"]);
    expect(mealsCurrentFirst(["Brunch", "Dinner"], "Lunch")).toEqual(["Brunch", "Dinner"]);
  });
});

describe("hallCards", () => {
  it("lists every hall with its meals, current first, and flags a hall that failed", () => {
    const cards = hallCards(bundle, clock);
    expect(cards.map((c) => c.name)).toEqual(["Yahentamitsi", "South Campus", "251 North"]);
    expect(cards[0]!.meals).toEqual(["Lunch", "Breakfast", "Dinner"]);
    expect(cards[0]!.currentMeal).toBe("Lunch");
    expect(cards[1]!.meals).toBeNull();
    expect(cards[1]!.sub).toBe("Menu unavailable");
  });
});

describe("menuStations", () => {
  const lunch = menu(19).meals[1]!;
  it("puts filler stations after main ones and applies filters", () => {
    expect(menuStations(lunch, [], []).map((s) => s.name)).toEqual(["Grill", "Sides"]);
    expect(menuStations(lunch, ["vegetarian"], []).map((s) => s.items.map((i) => i.name))).toEqual([["Cheese Pizza"]]);
    expect(menuStations(lunch, [], ["dairy"]).flatMap((s) => s.items.map((i) => i.name))).toEqual(["Chicken Wrap", "Rice"]);
  });
  it("renames the Breakfast station", () => {
    expect(menuStations(menu(19).meals[0]!, [], [])[0]!.name).toBe("Breakfast Area");
  });
});

describe("dietLabel", () => {
  it("prefers vegan over vegetarian and adds halal", () => {
    expect(dietLabel(item("a", ["vegan", "vegetarian", "halal"]))).toEqual(["Vegan", "Halal"]);
    expect(dietLabel(item("a", ["vegetarian"]))).toEqual(["Vegetarian"]);
    expect(dietLabel(item("a"))).toEqual([]);
  });
});

describe("searchModel", () => {
  it("groups matches by hall and meal + station", () => {
    const r = searchModel(bundle, clock, "pizza", null, null);
    expect(r.map((g) => g.hall)).toEqual(["Yahentamitsi", "251 North"]);
    expect(r[0]!.rows).toEqual([
      { meal: "Lunch", station: "Grill", items: ["Cheese Pizza"] },
      { meal: "Dinner", station: "Grill", items: ["Cheese Pizza"] },
    ]);
  });
  it("narrows by hall and meal, and ignores short queries", () => {
    expect(searchModel(bundle, clock, "pizza", 51, "Dinner")).toHaveLength(1);
    expect(searchModel(bundle, clock, "pizza", 19, "Breakfast")).toEqual([]);
    expect(searchModel(bundle, clock, "p", null, null)).toEqual([]);
  });
});

describe("stampRows", () => {
  const v: StampVenue = {
    id: "1",
    name: "Subway",
    location: "Food Court",
    url: "",
    days: { "2026-10-31": { kind: "ranges", label: "11am - 9pm", ranges: [{ start: 660, end: 1260 }] } },
  };
  it("computes open state on the device and appends venues without published hours", () => {
    const rows = stampRows([v], clock);
    expect(rows[0]).toMatchObject({ name: "Subway", status: "open", hours: "11am - 9pm" });
    expect(rows.at(-1)).toMatchObject({ name: "Hibachi San", status: "unknown" });
  });
});

describe("shape checks", () => {
  it("accepts the v1 payloads and rejects junk", () => {
    expect(isDiningPayload({ halls: [], bundle })).toBe(true);
    expect(isDiningPayload(null)).toBe(false);
    expect(isFoodIndex(bundle)).toBe(true);
    expect(isFoodIndex({})).toBe(false);
  });
});
