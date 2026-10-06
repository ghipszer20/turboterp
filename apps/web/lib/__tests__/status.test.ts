import { describe, expect, it } from "vitest";
import { mealFoods } from "../status";

const item = (name: string) => ({ name });

describe("mealFoods", () => {
  it("lists the first foods in menu order across stations", () => {
    const meal = {
      name: "Lunch",
      stations: [
        { name: "Grill", items: [item("Orange chicken"), item("Margherita pizza")] },
        { name: "Mezza", items: [item("Chicken shawarma"), item("Hummus")] },
      ],
    };
    expect(mealFoods(meal)).toBe("Lunch: Orange chicken, Margherita pizza, Chicken shawarma");
  });
  it("falls back to station names when only filler stations have items", () => {
    const meal = { name: "Lunch", stations: [{ name: "Salad Bar", items: [item("Lettuce")] }] };
    expect(mealFoods(meal)).toBe("Lunch: Salad Bar");
  });
  it("skips topping stations and condiment items so real dishes show (owner, 2026-10-05)", () => {
    const meal = {
      name: "Dinner",
      stations: [
        { name: "Burger Toppings", items: [item("American Cheese Sliced"), item("Banana Peppers")] },
        { name: "Grill", items: [item("Cheese Sauce"), item("Cheeseburger with American Cheese"), item("Five Spice Roast Pork")] },
      ],
    };
    expect(mealFoods(meal)).toBe("Dinner: Cheeseburger with American Cheese, Five Spice Roast Pork");
  });
  it("says so when nothing is posted", () => {
    expect(mealFoods({ name: "Lunch", stations: [] })).toBe("Lunch: No menu posted");
  });
});
