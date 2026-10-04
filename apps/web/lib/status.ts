// Turns an hours model + the current time into a short, human status line.
// Pure and shared by server and client components.

import { formatMinutes, isOpenAt, minutesUntilClose, type DayHours } from "@turboterp/campus-data/hours";
import type { Status } from "@/components/ui";

export type HoursStatus = { status: Status; text: string };

export function hoursStatus(hours: DayHours | undefined, minutes: number): HoursStatus {
  if (!hours) return { status: "unknown", text: "Hours unavailable" };
  switch (hours.kind) {
    case "24h":
      return { status: "open", text: "Open 24 hours" };
    case "closed":
      return { status: "closed", text: "Closed today" };
    case "text":
      return { status: "unknown", text: hours.label };
    case "ranges": {
      if (isOpenAt(hours, minutes)) {
        const left = minutesUntilClose(hours, minutes)!;
        const closes = formatMinutes(minutes + left);
        return left <= 60
          ? { status: "soon", text: `Closes in ${left} min` }
          : { status: "open", text: `Open until ${closes}` };
      }
      const next = hours.ranges.find((r) => r.start > minutes);
      return next
        ? { status: "closed", text: `Opens at ${formatMinutes(next.start)}` }
        : { status: "closed", text: "Closed for the day" };
    }
  }
}

/** Default meal tab for the time of day. */
export function currentMealName(minutes: number): "Breakfast" | "Lunch" | "Dinner" {
  if (minutes < 10 * 60 + 30) return "Breakfast";
  if (minutes < 16 * 60 + 30) return "Lunch";
  return "Dinner";
}

type MealLike = { name: string; stations: { name: string }[] };

// Stations that don't tell you what's for dinner.
export const FILLER = /sides|salad bar|condiment|beverage|bakery|dessert|treats|deli bar|cereal/i;

/** "Terp Comfort, Mezza, Joe's Grill +12 more": the main stations for a meal. */
export function mealHighlights(meal: MealLike, count = 3): string {
  const isBreakfast = /breakfast/i.test(meal.name);
  const main = meal.stations.filter((s) => !FILLER.test(s.name) && (isBreakfast || !/breakfast/i.test(s.name)));
  const pick = (main.length > 0 ? main : meal.stations).map((s) => s.name);
  const shown = pick.slice(0, count).join(", ");
  const rest = pick.length - count;
  return rest > 0 ? `${shown} +${rest} more` : shown;
}
