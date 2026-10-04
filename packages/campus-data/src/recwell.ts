// RecWell facility hours. RecWell's "Today's Facility Hours" page renders a
// public Google Sheet: one tab per facility group, one row per area, one
// column per date for the whole year. We read the same sheet as CSV.

import { parseCsv } from "./csv.ts";
import { addDays, fromUsDate } from "./dates.ts";
import { parseHours, type DayHours } from "./hours.ts";
import { fetchText, SourceError } from "./http.ts";

const SHEET_ID = "1y3-5AE7FBNL0JFi4LW459WaBQzYVOdWMvtOVr0DZCmM";

export const RECWELL_TABS = {
  indoor: ["1320933735", "1321604209", "354755843", "83449240", "1348172338", "883167948", "628324683", "180872438"],
  outdoor: ["1601669223", "1656075107", "849246933", "836576797"],
} as const;

export type RecWellSetting = keyof typeof RECWELL_TABS;

export type RecWellArea = {
  /** The facility group, e.g. "Eppley Recreation Center" or "Adventure Program". */
  group: string;
  name: string;
  url: string | null;
  setting: RecWellSetting;
  /** Raw hours label keyed by "YYYY-MM-DD". */
  hoursByDate: Record<string, string>;
};

/** `tomorrow`: the next day's hours when the sheet has them, for a day that runs past midnight. */
export type RecWellAreaToday = Omit<RecWellArea, "hoursByDate"> & { hours: DayHours; tomorrow?: DayHours };

// RecWell's sheet tags some areas' names with an "informal rec" marker
// (open-use time, as opposed to a reserved league/class) -- e.g.
// "Pickleball (informal rec)" or "Gym (Volleyball informal rec)". It's
// sheet-internal scheduling jargon, not something a student needs to see, so
// it's stripped at parse time. When it's the parenthetical's only content
// the whole "(...)" is dropped; otherwise only the marker is removed and the
// rest of the parenthetical is kept (e.g. "(Volleyball informal rec)" ->
// "(Volleyball)").
function stripInformalRec(name: string): string {
  return name
    .replace(/\(([^()]*)\)/g, (_match, inner: string) => {
      const cleaned = inner.replace(/\s*informal rec\s*/i, " ").trim();
      return cleaned ? `(${cleaned})` : "";
    })
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse one sheet tab. Layout (observed 2026-09-24):
 *   row: "I", "days", "THU", "FRI", ...            ← weekday header, ignored
 *   row: <group name>, "URLs", "1/1/2026", ...     ← starts a group; gives the dates
 *   row: <area name>, <url>, "6am to 9pm", ...     ← one area
 *   blank rows between groups
 */
export function parseRecWellTab(csv: string, setting: RecWellSetting): RecWellArea[] {
  const areas: RecWellArea[] = [];
  let group: string | null = null;
  let dates: (string | null)[] = [];

  for (const row of parseCsv(csv)) {
    const name = (row[0] ?? "").trim();
    const second = (row[1] ?? "").trim();
    if (name === "" || second.toLowerCase() === "days") continue;

    if (second.toUpperCase() === "URLS") {
      group = name;
      dates = row.slice(2).map((d) => fromUsDate(d));
      continue;
    }
    if (group === null) continue;

    const hoursByDate: Record<string, string> = {};
    row.slice(2).forEach((cell, i) => {
      const date = dates[i];
      if (date) hoursByDate[date] = cell.trim();
    });
    areas.push({
      group,
      name: stripInformalRec(name),
      url: /^https?:\/\//.test(second) ? second : null,
      setting,
      hoursByDate,
    });
  }
  if (areas.length === 0) {
    throw new SourceError("recwell", "sheet layout changed: no areas found");
  }
  return areas;
}

export async function fetchRecWellAreas(): Promise<RecWellArea[]> {
  const tabs = Object.entries(RECWELL_TABS).flatMap(([setting, gids]) =>
    gids.map((gid) => ({ setting: setting as RecWellSetting, gid })),
  );
  const results = await Promise.all(
    tabs.map(async ({ setting, gid }) => {
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
      return parseRecWellTab(await fetchText("recwell", url), setting);
    }),
  );
  return results.flat();
}

/** Areas with their hours on one date. Areas with no entry for that date are dropped. */
export function recWellOnDate(areas: RecWellArea[], isoDate: string): RecWellAreaToday[] {
  return areas.flatMap(({ hoursByDate, ...area }) => {
    const raw = hoursByDate[isoDate];
    if (raw === undefined) return [];
    const next = hoursByDate[addDays(isoDate, 1)];
    return [{ ...area, hours: parseHours(raw), ...(next === undefined ? {} : { tomorrow: parseHours(next) }) }];
  });
}

/** The areas with hours for `days` days starting at `startIsoDate` (the sheet covers a whole year). */
export function recWellWindow(areas: RecWellArea[], startIsoDate: string, days: number): RecWellArea[] {
  const dates = new Set(Array.from({ length: days }, (_, i) => addDays(startIsoDate, i)));
  return areas.map((a) => ({
    ...a,
    hoursByDate: Object.fromEntries(Object.entries(a.hoursByDate).filter(([d]) => dates.has(d))),
  }));
}
