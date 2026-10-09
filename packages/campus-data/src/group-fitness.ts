// RecWell group fitness classes. RecWell's Group Fitness page lists one HTML
// table per day (Day, Class, Location, Instructor, Start Time, End Time,
// Registration Link). Each "Register Here" link goes to the class's ActiveTerp
// page.
//
// Hard rules (owner/legal): ONLY recwell.umd.edu is fetched. We never fetch,
// scrape or automate activeterp.umd.edu or planyo.com (their robots.txt and
// terms forbid it; booking needs the student's own UMD sign-in), we only LINK
// to them, and we never ask for or handle UMD credentials.

import * as cheerio from "cheerio";
import { fetchText, SourceError } from "./http.ts";

export const GROUP_FITNESS_URL = "https://recwell.umd.edu/programs-activities/fitness/group-fitness";
const ACTIVETERP_PREFIX = "https://activeterp.umd.edu/";

export type FitnessClass = {
  day: string;
  name: string;
  location: string;
  instructor: string;
  /** Minutes after midnight. */
  start: number;
  /** Minutes after midnight; undefined when the page's end isn't after its start. */
  end?: number;
  /** An https://activeterp.umd.edu/ link, or undefined. */
  signupUrl?: string;
};

export type ClassKind = "Mind-body" | "Cycling" | "Strength" | "Dance & cardio" | "Aqua" | "Other";
export type ClassPlace = "Eppley" | "Ritchie" | "Regents" | "Other";

const HEADERS = ["day", "class", "location", "instructor", "start time", "end time", "registration link"];

const layoutError = (why: string) => new SourceError("group-fitness", `page layout changed: ${why}`);

/** "5:15pm" / "5:30PM" -> minutes after midnight, or null. */
function parseClock(text: string): number | null {
  const m = /^(\d{1,2}):(\d{2})\s*([ap])m$/i.exec(text.trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 1 || hour > 12 || minute > 59) return null;
  return (hour % 12) * 60 + minute + (m[3]!.toLowerCase() === "p" ? 12 * 60 : 0);
}

const clean = (s: string) => s.replace(/[​﻿]/g, "").replace(/\s+/g, " ").trim();

export function parseGroupFitness(html: string): FitnessClass[] {
  const $ = cheerio.load(html);
  const tables = $("table").toArray();
  if (tables.length === 0) throw layoutError("no tables found");

  const classes: FitnessClass[] = [];
  let recognised = 0;
  for (const table of tables) {
    const headers = $(table)
      .find("thead th")
      .toArray()
      .map((th) => clean($(th).text()).toLowerCase());
    if (!HEADERS.every((h, i) => headers[i] === h)) continue;
    recognised++;
    for (const tr of $(table).find("tbody tr").toArray()) {
      const cells = $(tr).find("td").toArray();
      if (cells.length < HEADERS.length) continue;
      const text = cells.map((c) => clean($(c).text()));
      const start = parseClock(text[4]!);
      if (start === null || !text[0] || !text[1]) continue;
      const end = parseClock(text[5]!);
      const href = $(cells[6]).find("a").attr("href")?.trim();
      classes.push({
        day: text[0],
        name: text[1],
        location: text[2]!,
        instructor: text[3]!,
        start,
        ...(end !== null && end > start ? { end } : {}),
        ...(href?.startsWith(ACTIVETERP_PREFIX) ? { signupUrl: href } : {}),
      });
    }
  }
  if (recognised === 0) throw layoutError("no table has the expected column headers");
  if (classes.length === 0) throw layoutError("no class rows found");
  return classes;
}

export async function fetchGroupFitness(): Promise<FitnessClass[]> {
  return parseGroupFitness(await fetchText("group-fitness", GROUP_FITNESS_URL));
}

// First match wins, so "Cycle Strength" is Cycling and "Paddleboard Yoga" is Mind-body.
const KIND_KEYWORDS: [ClassKind, RegExp][] = [
  ["Aqua", /\b(aqua|water|swim|pool)\b/i],
  ["Cycling", /\b(ride|cycle|cycling|spin)\b/i],
  ["Mind-body", /(pilates|barre|yoga|stretch|meditat|tai chi)/i],
  ["Dance & cardio", /(zumba|dance|ubox|combat|hiit|cardio|kickbox|step)/i],
  ["Strength", /(pump|core|strength|conditioning|tone|bootcamp|sculpt)/i],
];

export function classKind(name: string): ClassKind {
  return KIND_KEYWORDS.find(([, re]) => re.test(name))?.[0] ?? "Other";
}

/** The building a studio is in ("ERC" is Eppley Recreation Center). */
export function classPlace(location: string): ClassPlace {
  if (/\b(erc|eppley)\b/i.test(location)) return "Eppley";
  if (/ritchie/i.test(location)) return "Ritchie";
  if (/regents/i.test(location)) return "Regents";
  return "Other";
}
