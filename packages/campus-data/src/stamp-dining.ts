// Hours for the Stamp Student Union food venues run by UMD Dining Services.
// dining.umd.edu/hours-locations/dining-stamp fills its hours in from a public
// Google Sheet ("dining hours db"); we read that same sheet through its gviz feed.

import { parseHours, type DayHours } from "./hours.ts";
import { fetchText, SourceError } from "./http.ts";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1vdWskGO2-aJfKLSW8-3zMaj_nx4SBJHF3OvMEy4-ZNo/gviz/tq?gid=57096019";
const PAGE_URL = "https://dining.umd.edu/hours-locations/dining-stamp";

export type StampVenue = {
  id: string;
  name: string;
  /** Where in the Stamp, e.g. "Stamp Food Court". */
  location: string;
  url: string;
  /** Hours keyed by "YYYY-MM-DD". */
  days: Record<string, DayHours>;
};

// Locations come from the page's own script, which the sheet doesn't carry.
const LOCATIONS: Record<string, string> = {
  "Chick-fil-A": "Stamp Food Court",
  "Subway": "Stamp Food Court",
  "Qdoba": "Stamp Food Court",
  "Union Pizza": "Stamp Food Court",
  "The Coffee Bar": "Stamp Student Union, first floor",
  "Maryland Dairy": "Baltimore Room, Stamp",
  "Panera Bread": "Stamp Student Union, first floor",
};

type Cell = { v: unknown } | null;

function isoDate(mdy: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(mdy.trim());
  if (!m) return null;
  return `${m[3]}-${m[1]!.padStart(2, "0")}-${m[2]!.padStart(2, "0")}`;
}

export function parseStampVenues(raw: string): StampVenue[] {
  let rows: Cell[][];
  try {
    const json = JSON.parse(raw.slice(raw.indexOf("(") + 1, raw.lastIndexOf(")")));
    rows = json.table.rows.map((r: { c: Cell[] }) => r.c);
  } catch {
    throw new SourceError("stamp-dining", "sheet format changed: not a gviz response");
  }
  const header = rows[0]?.map((c) => (c ? String(c.v) : "")) ?? [];
  if (rows.length < 2 || !isoDate(header[1] ?? "")) {
    throw new SourceError("stamp-dining", "sheet format changed: no date header");
  }
  return rows.slice(1).flatMap((row) => {
    const name = row[0] ? String(row[0].v) : "";
    if (!name) return [];
    const days: Record<string, DayHours> = {};
    for (let j = 1; j < header.length; j++) {
      const date = isoDate(header[j]!);
      const cell = row[j];
      if (date && cell && cell.v != null) days[date] = parseHours(String(cell.v));
    }
    return [
      {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        name,
        location: LOCATIONS[name] ?? "Stamp Student Union",
        url: PAGE_URL,
        days,
      },
    ];
  });
}

export async function fetchStampVenues(): Promise<StampVenue[]> {
  return parseStampVenues(await fetchText("stamp-dining", SHEET_URL));
}
