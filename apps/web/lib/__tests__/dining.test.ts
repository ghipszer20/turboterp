import { describe, expect, it } from "vitest";
import type { DiningMenu } from "@turboterp/campus-data";
import { diningSlice, resolveMeal, stationDisplayName } from "../dining";

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
