// Parsers tested against trimmed snapshots of the real sources (test/fixtures).
// These never touch the network; `npm run smoke` checks the live sites.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseDiningMenu } from "../src/dining.ts";
import { orderLibraries, parseLibCalHours, type LibCalHoursFeed, type LibraryHours } from "../src/libraries.ts";
import { parseRecWellTab, recWellOnDate, recWellWindow } from "../src/recwell.ts";
import {
  applyAvailability,
  parseRoomCategories,
  parseRoomLocations,
  parseRooms,
  roomBookingUrl,
  studyRoomCategories,
} from "../src/rooms.ts";
import { SourceError } from "../src/http.ts";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

describe("RecWell sheet", () => {
  const areas = parseRecWellTab(fixture("recwell-eppley.csv"), "indoor");

  it("reads each area with its group and link", () => {
    expect(areas.map((a) => a.name)).toEqual([
      "Eppley Recreation Center",
      "Bouldering Zone",
      "Member Services Desk",
      "Adventure Program Rental Desk",
      "Sneakers Cafe",
    ]);
    expect(areas[0]).toMatchObject({
      group: "Eppley Recreation Center",
      url: "https://recwell.umd.edu/eppley-recreation-center-0",
      setting: "indoor",
    });
  });

  it("maps sheet columns to ISO dates", () => {
    const monday = recWellOnDate(areas, "2026-01-05");
    expect(monday[0]!.hours).toMatchObject({ kind: "ranges", ranges: [{ start: 360, end: 1260 }] });
    expect(recWellOnDate(areas, "2026-01-01").every((a) => a.hours.kind === "closed")).toBe(true);
  });

  it("drops areas with no entry for a date", () => {
    expect(recWellOnDate(areas, "2031-01-01")).toEqual([]);
  });

  it("carries the next day's hours, so a status can follow a day that runs past midnight", () => {
    const area = {
      group: "Eppley Recreation Center",
      name: "Eppley Recreation Center",
      url: null,
      setting: "indoor" as const,
      hoursByDate: { "2026-01-04": "8am - 12am", "2026-01-05": "24 Hours" },
    };
    expect(recWellOnDate([area], "2026-01-04")[0]!.tomorrow).toEqual({ kind: "24h" });
    expect(recWellOnDate([area], "2026-01-05")[0]!.tomorrow).toBeUndefined();
  });

  it("fails loudly if the sheet layout changes", () => {
    expect(() => parseRecWellTab("totally,different\nlayout,here", "indoor")).toThrow(SourceError);
  });

  it('strips "(Informal Rec)" from area names, including inside other parentheses', () => {
    const csv = [
      "I,days,THU",
      "Eppley Tennis & Pickleball Courts,URLs,1/1/2026",
      "Pickleball (Informal Rec),https://recwell.umd.edu/eppley-tennis-and-pickleball-courts,6am to 9pm",
      "Gym (Volleyball Informal Rec),https://recwell.umd.edu/eppley-recreation-center-0,6am to 9pm",
    ].join("\n");
    const informal = parseRecWellTab(csv, "outdoor");
    expect(informal.map((a) => a.name)).toEqual(["Pickleball", "Gym (Volleyball)"]);
  });
});

describe("LibCal hours feed", () => {
  const libs = parseLibCalHours(JSON.parse(fixture("libcal-hours.json")) as LibCalHoursFeed);

  it("reads locations as libraries", () => {
    expect(libs.map((l) => l.name)).toEqual(["McKeldin Library", "STEM Library"]);
    expect(libs[0]!.kind).toBe("library");
  });

  it("has seven days of hours per location", () => {
    for (const lib of libs) expect(Object.keys(lib.days)).toHaveLength(7);
  });

  it("understands 24-hour days and ranges", () => {
    const mck = libs[0]!;
    expect(Object.values(mck.days).some((d) => d.kind === "24h")).toBe(true);
    expect(mck.days["2026-09-20"]).toMatchObject({ kind: "ranges", ranges: [{ start: 660, end: 1440 }] });
  });

  it("rejects an empty feed", () => {
    expect(() => parseLibCalHours({ locations: [] })).toThrow(SourceError);
  });
});

describe("library display order", () => {
  const lib = (name: string): LibraryHours => ({ id: 1, name, kind: "library", url: "", days: {} });

  it("puts McKeldin first, then the rest alphabetically, regardless of feed order", () => {
    const scrambled = [
      lib("STEM Library"),
      lib("Art Library"),
      lib("McKeldin Library"),
      lib("Hornbake Library"),
      lib("Architecture Library"),
      lib("Michelle Smith Performing Arts Library"),
    ];
    expect(orderLibraries(scrambled).map((l) => l.name)).toEqual([
      "McKeldin Library",
      "Architecture Library",
      "Art Library",
      "Hornbake Library",
      "Michelle Smith Performing Arts Library",
      "STEM Library",
    ]);
  });

  it("keeps every library, not just the well-known three", () => {
    const all = [lib("McKeldin Library"), lib("Art Library"), lib("Hornbake Library")];
    expect(orderLibraries(all)).toHaveLength(3);
  });
});

describe("dining menu page", () => {
  const menu = parseDiningMenu(fixture("dining-yahentamitsi.html"), 19, "2026-09-25");

  it("reads breakfast, lunch and dinner", () => {
    expect(menu.meals.map((m) => m.name)).toEqual(["Breakfast", "Lunch", "Dinner"]);
  });

  it("groups items by station with absolute label links", () => {
    const station = menu.meals[0]!.stations[0]!;
    expect(station.name).toBeTruthy();
    expect(station.items.length).toBeGreaterThan(0);
    expect(station.items[0]!.labelUrl).toMatch(/^https:\/\/nutrition\.umd\.edu\/label\.aspx\?RecNumAndPort=/);
  });

  it("turns icons into diet and allergen tags", () => {
    const items = menu.meals.flatMap((m) => m.stations.flatMap((s) => s.items));
    const tags = new Set(items.flatMap((i) => [...i.diets, ...i.contains]));
    expect(tags.size).toBeGreaterThan(0);
    for (const t of tags) expect(t).toMatch(/^[a-z ]+$/);
  });

  it("fails loudly on a page that isn't a menu", () => {
    expect(() => parseDiningMenu("<html><body>Maintenance</body></html>", 19, "2026-09-25")).toThrow(SourceError);
  });
});

describe("study rooms", () => {
  const html = fixture("rooms-stem.html");

  it("lists every library with bookable space", () => {
    expect(parseRoomLocations(html).map((l) => l.id)).toEqual([2552, 14005, 14006, 6745]);
  });

  it("lists a library's categories without 'Show All'", () => {
    const cats = parseRoomCategories(html, 6745);
    expect(cats.map((c) => c.id)).toEqual([23066, 31707]);
    expect(cats.every((c) => c.locationId === 6745)).toBe(true);
  });

  it("reads rooms with capacity and booking links", () => {
    expect(parseRooms(html)).toEqual([
      expect.objectContaining({
        id: 86400,
        name: "Carver Room 3403 G",
        capacity: 10,
        categoryId: 23066,
        locationId: 6745,
        bookingUrl: "https://umd.libcal.com/space/86400",
      }),
      expect.objectContaining({ id: 86401, name: "Chatelet Room 3403 F", capacity: 6 }),
    ]);
  });

  it("merges open half-hours into windows and skips booked slots", () => {
    const rooms = parseRooms(html);
    const grid = JSON.parse(fixture("rooms-stem-grid.json")) as {
      slots: { start: string; end: string; itemId: number; className?: string }[];
    };
    // Mark 10:00–10:30 in the Carver Room as booked.
    const booked = grid.slots.find((s) => s.itemId === 86400 && s.start.endsWith("10:00:00"))!;
    booked.className = "s-lc-eq-checkout";

    const [carver, chatelet] = applyAvailability(rooms, grid);
    expect(carver!.open).toEqual([
      { start: "2026-09-25 08:00:00", end: "2026-09-25 10:00:00" },
      { start: "2026-09-25 10:30:00", end: "2026-09-25 14:00:00" },
    ]);
    expect(chatelet!.open).toEqual([{ start: "2026-09-25 08:00:00", end: "2026-09-25 14:00:00" }]);
  });
});

describe("room booking links", () => {
  it("builds the booking url from the room's own eid, never the feed's url field", () => {
    // A synthetic block whose "url" field points at a generic category page
    // instead of the room's own space page — parseRooms must not trust it.
    const block = `
      ({
        id: "eid_99999",
        title: "Odd Room (Capacity 2)",
        url: "/reserve/some-category-page",
        eid: 99999,
        gid: 1,
        lid: 1,
        grouping: "Test Category",
        capacity: 2,
      })
    `;
    const [room] = parseRooms(block);
    expect(room!.bookingUrl).toBe("https://umd.libcal.com/space/99999");
  });

  it("gives every parsed room its own /space/<id> page, never a generic fallback", () => {
    const rooms = parseRooms(fixture("rooms-stem.html"));
    expect(rooms.length).toBeGreaterThan(0);
    for (const r of rooms) expect(r.bookingUrl).toMatch(/^https:\/\/umd\.libcal\.com\/space\/\d+$/);
  });

  it("carries the chosen date on a room's own booking page", () => {
    expect(roomBookingUrl(86389, "2026-09-28")).toBe("https://umd.libcal.com/space/86389?date=2026-09-28");
  });
});

describe("study room categories", () => {
  const room = (id: number, locationId: number, categoryId: number, categoryName: string) => ({
    id,
    name: String(id),
    capacity: 4,
    locationId,
    categoryId,
    categoryName,
    bookingUrl: "",
  });

  it("lists each bookable study category once, skipping equipment and faculty spaces", () => {
    const rooms = [
      room(1, 10, 100, "Group Study Rooms"),
      room(2, 10, 100, "Group Study Rooms"),
      room(3, 10, 101, "Equipment Loans"),
      room(4, 20, 200, "Faculty Offices"),
      room(5, 20, 201, "Individual Study"),
    ];
    expect(studyRoomCategories(rooms)).toEqual([
      { locationId: 10, categoryId: 100 },
      { locationId: 20, categoryId: 201 },
    ]);
  });
});

describe("RecWell date window", () => {
  const areas = parseRecWellTab(fixture("recwell-eppley.csv"), "indoor");

  it("keeps only the dates from the start date through the given number of days", () => {
    const trimmed = recWellWindow(areas, "2026-01-05", 2);
    expect(Object.keys(trimmed[0]!.hoursByDate)).toEqual(["2026-01-05", "2026-01-06"]);
    expect(recWellOnDate(trimmed, "2026-01-05")[0]!.hours).toMatchObject({ kind: "ranges" });
    expect(recWellOnDate(trimmed, "2026-01-07")).toEqual([]);
  });
});
