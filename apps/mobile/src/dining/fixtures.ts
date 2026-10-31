// Dev-only sample data so the web export can be screenshotted (it can't reach the API: CORS).
// Switched on with EXPO_PUBLIC_FIXTURES=1; never set in a production build.
import type { DiningMenu, StampVenue } from "@turboterp/campus-data";
import { clockAt } from "@turboterp/app-core/campus-clock";
import type { DiningBundle } from "./model";

export const FIXTURES_ON = process.env.EXPO_PUBLIC_FIXTURES === "1";

const item = (name: string, diets: ("vegan" | "vegetarian" | "halal")[] = [], contains: string[] = []) => ({
  name,
  labelUrl: null,
  diets,
  contains,
});

const menu = (hallId: number, date: string): DiningMenu => ({
  hallId,
  date,
  meals: [
    { name: "Breakfast", stations: [{ name: "Breakfast", items: [item("Scrambled Eggs", ["vegetarian"], ["egg"]), item("Home Fries", ["vegan"])] }] },
    {
      name: "Lunch",
      stations: [
        { name: "Grill", items: [item("Cheese Pizza", ["vegetarian"], ["dairy", "gluten"]), item("Chicken Tenders", ["halal"]), item("Black Bean Burger", ["vegan"])] },
        { name: "Pasta", items: [item("Penne Marinara", ["vegan"]), item("Garlic Bread", ["vegetarian"], ["gluten"])] },
        { name: "Sides", items: [item("Steamed Rice", ["vegan"]), item("Roasted Broccoli", ["vegan"])] },
      ],
    },
    { name: "Dinner", stations: [{ name: "Grill", items: [item("Pepperoni Pizza", [], ["pork"]), item("Falafel Wrap", ["vegan"])] }] },
  ],
});

export function fixtureBundle(): DiningBundle {
  const clock = clockAt(new Date());
  const days: DiningBundle["days"] = {};
  for (const date of [clock.today, clock.tomorrow]) {
    days[date] = [19, 16, 51].map((id) => ({ ok: true as const, data: menu(id, date) }));
  }
  return { days };
}

export function fixtureStamp(): StampVenue[] {
  const clock = clockAt(new Date());
  const hours = (start: number, end: number) => ({ kind: "ranges" as const, label: "hours", ranges: [{ start, end }] });
  const venue = (id: string, name: string, start: number, end: number): StampVenue => ({
    id,
    name,
    location: "Stamp",
    url: "",
    days: { [clock.today]: hours(start, end), [clock.tomorrow]: hours(start, end) },
  });
  return [venue("1", "Chick-fil-A", 600, 1260), venue("2", "Subway", 660, 1200), venue("3", "The Coffee Bar", 450, 1020)];
}
