// Turns an hours model + the current time into a short, human status line.
// Pure and shared by server and client components.

import { formatMinutes, isOpenAt, minutesUntilClose, type DayHours } from "@turboterp/campus-data/hours";
import type { Status } from "@/components/ui";

export type HoursStatus = { status: Status; text: string };

const MIDNIGHT = 24 * 60;

/**
 * A range that ends exactly at midnight doesn't close then if tomorrow picks up at midnight:
 * "all" when tomorrow is open 24 hours, tomorrow's closing time (minutes after tomorrow's
 * midnight) when tomorrow has a range starting at 12am, null when the place really closes.
 * UMD Libraries lists McKeldin's Sunday as "11am - 12am" with a 24-hour Monday after it.
 */
function pastMidnight(end: number, tomorrow: DayHours | undefined): "all" | number | null {
  if (end !== MIDNIGHT || !tomorrow) return null;
  if (tomorrow.kind === "24h") return "all";
  if (tomorrow.kind !== "ranges") return null;
  return tomorrow.ranges.find((r) => r.start === 0)?.end ?? null;
}

/** The day's hours as text for a row ("8am - 10pm"), following a day that runs past midnight into tomorrow. */
export function hoursLabel(hours: DayHours | undefined, tomorrow: DayHours | undefined): string | undefined {
  if (hours?.kind !== "ranges") return undefined;
  const [only, ...rest] = hours.ranges;
  const on = only && rest.length === 0 ? pastMidnight(only.end, tomorrow) : null;
  if (on === null) return hours.label;
  return `${formatMinutes(only!.start)} - ${on === "all" ? "24 hours" : formatMinutes(on)}`;
}

/** `tomorrow`: the next day's hours, so a place open through midnight isn't reported as closing at midnight. */
export function hoursStatus(hours: DayHours | undefined, minutes: number, tomorrow?: DayHours): HoursStatus {
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
        const on = pastMidnight(minutes + minutesUntilClose(hours, minutes)!, tomorrow);
        if (on === "all") return { status: "open", text: "Open 24 hours" };
        const left = minutesUntilClose(hours, minutes)! + (on ?? 0);
        const closes = `${formatMinutes(minutes + left)}${on === null ? "" : " tomorrow"}`;
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
