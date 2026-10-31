import { describe, expect, it } from "vitest";
import type { FitnessClass, LibraryHours, RecWellArea } from "@turboterp/campus-data";
import { parseHours } from "@turboterp/campus-data/hours";
import {
  classDays,
  classRows,
  gymGroups,
  isGymsPayload,
  isLibrariesPayload,
  isRoomsPayload,
  libraryGroups,
  roomCards,
  roomRows,
  roomSlots,
  type RoomsPayload,
} from "../src/campus/model";

const clock = { today: "2026-10-07", tomorrow: "2026-10-08", minutes: 14 * 60 };

const lib = (id: number, name: string, label: string, kind: "library" | "department" = "library"): LibraryHours => ({
  id,
  name,
  kind,
  url: `https://umd.libcal.com/hours#${id}`,
  days: Object.fromEntries(["07", "08", "09", "10", "11", "12", "13"].map((d) => [`2026-10-${d}`, parseHours(label)])),
});

describe("libraryGroups", () => {
  it("orders McKeldin first, splits collections, and computes status and a 7-day week", () => {
    const g = libraryGroups(
      [lib(1, "STEM Library", "9am - 9pm"), lib(2, "McKeldin Library", "8am - 3pm"), lib(3, "Special Collections", "10am - 5pm", "department")],
      clock,
    );
    expect(g.map((x) => x.title)).toEqual(["Libraries", "Collections & spaces"]);
    expect(g[0]!.items.map((i) => i.name)).toEqual(["McKeldin Library", "STEM Library"]);
    expect(g[0]!.items[0]!.status).toBe("soon");
    expect(g[0]!.items[0]!.text).toBe("Closes in 60 min");
    expect(g[0]!.items[1]!.text).toBe("Open until 9pm");
    const week = g[0]!.items[0]!.week;
    expect(week).toHaveLength(7);
    expect(week[0]).toMatchObject({ date: "2026-10-07", label: "Today", hours: "8am - 3pm" });
    expect(week[1]!.label).toBe("Thu 8");
  });

  it("says hours are unavailable for days the feed lacks", () => {
    const g = libraryGroups([{ ...lib(1, "STEM Library", "9am - 9pm"), days: {} }], clock);
    expect(g[0]!.items[0]!.week[3]!.hours).toBe("Hours unavailable");
  });

  it("recomputes from the clock", () => {
    const l = [lib(1, "STEM Library", "9am - 9pm")];
    expect(libraryGroups(l, { ...clock, minutes: 6 * 60 })[0]!.items[0]!.text).toBe("Opens at 9am");
  });
});

const payload: RoomsPayload = {
  catalog: { locations: [{ id: 1, name: "McKeldin Library" }, { id: 2, name: "STEM Library" }] },
  rooms: [
    { id: 86389, name: "2100A", capacity: 6, locationId: 1, categoryName: "McKeldin Group Study Rooms", open: [{ start: "2026-10-07 09:00:00", end: "2026-10-07 11:00:00" }, { start: "2026-10-07 13:30:00", end: "2026-10-07 16:00:00" }, { start: "2026-10-08 10:00:00", end: "2026-10-08 11:00:00" }] },
    { id: 86390, name: "2100B", capacity: 2, locationId: 1, categoryName: "McKeldin Group Study Rooms", open: [{ start: "2026-10-07 15:00:00", end: "2026-10-07 16:00:00" }] },
    { id: 90001, name: "3201", capacity: null, locationId: 2, categoryName: "STEM Group Study Rooms", open: [{ start: "2026-10-07 16:00:00", end: "2026-10-07 18:00:00" }] },
  ],
  failed: 0,
  updatedAt: null,
};
const rows = roomRows(payload);
const all = { library: 0, size: 1, type: null, day: "2026-10-07", freeNow: false };

describe("rooms", () => {
  it("checks the payload shape", () => {
    expect(isRoomsPayload(payload)).toBe(true);
    expect(isRoomsPayload({ rooms: [] })).toBe(false);
    expect(isLibrariesPayload([])).toBe(true);
    expect(isGymsPayload({ areas: { ok: true, data: [] }, classes: { ok: false, error: "x" } })).toBe(true);
    expect(isGymsPayload({})).toBe(false);
  });

  it("drops windows already over and deep-links each slot to the room and the viewed date", () => {
    const slots = roomSlots(rows[0]!, "2026-10-07", clock);
    expect(slots.map((s) => s.label)).toEqual(["1:30pm-4pm"]);
    expect(slots[0]!.url).toBe("https://umd.libcal.com/space/86389?date=2026-10-07");
    const tomorrow = roomSlots(rows[0]!, "2026-10-08", clock);
    expect(tomorrow[0]!.url).toBe("https://umd.libcal.com/space/86389?date=2026-10-08");
  });

  it("marks a window that has started as current", () => {
    const slots = roomSlots(rows[0]!, "2026-10-07", { ...clock, minutes: 10 * 60 });
    expect(slots.map((s) => [s.label, s.current])).toEqual([["9am-11am", true], ["1:30pm-4pm", false]]);
  });

  it("filters by library, size (unknown capacity fails 2+) and free now", () => {
    expect(roomCards(rows, all, clock).map((c) => c.id)).toEqual([86389, 86390, 90001]);
    expect(roomCards(rows, { ...all, library: 2 }, clock).map((c) => c.id)).toEqual([90001]);
    expect(roomCards(rows, { ...all, size: 4 }, clock).map((c) => c.id)).toEqual([86389]);
    expect(roomCards(rows, { ...all, freeNow: true }, { ...clock, minutes: 14 * 60 + 30 }).map((c) => c.id)).toEqual([86389]);
    expect(roomCards(rows, { ...all, day: "2026-10-08" }, clock).map((c) => c.id)).toEqual([86389]);
  });

  it("titles and subtitles rooms", () => {
    const c = roomCards(rows, all, { ...clock, minutes: 14 * 60 + 30 })[0]!;
    expect(c.title).toBe("2100A · 6 seats");
    expect(c.sub).toBe("Free until 4pm · McKeldin");
  });
});

describe("fitness", () => {
  const area = (group: string, name: string, label: string, setting: "indoor" | "outdoor" = "indoor"): RecWellArea => ({
    group,
    name,
    url: null,
    setting,
    hoursByDate: { "2026-10-07": label, "2026-10-08": label },
  });

  it("puts Eppley first, folds pool tabs into it and falls back for missing subsections", () => {
    const g = gymGroups(
      [
        area("Ritchie Coliseum", "Ritchie Coliseum", "7am - 9pm"),
        area("Eppley Recreation Center", "Eppley Recreation Center", "6am - 11pm"),
        area("Natatorium", "Lap Pool", "7am - 8pm"),
      ],
      clock,
    );
    expect(g.map((x) => x.title)).toEqual(["Eppley Recreation Center", "Ritchie Coliseum"]);
    const eppley = g[0]!.sections;
    expect(eppley.map((s) => s.label)).toEqual([null, "Aquatics", "Climbing", "Pickleball Courts"]);
    expect(eppley[0]!.tiles[0]).toMatchObject({ title: "Building", status: "open", text: "Open until 11pm", url: "https://recwell.umd.edu" });
    expect(eppley[1]!.tiles[0]!.title).toBe("Lap Pool");
    expect(eppley[2]!.fallback?.url).toContain("recwell.umd.edu");
  });

  const cls = (day: string, name: string, start: number, location: string): FitnessClass => ({
    day,
    name,
    location,
    instructor: "",
    start,
    end: start + 50,
    signupUrl: "https://activeterp.umd.edu/x",
  });
  const classes = [
    cls("Wednesday", "Power Yoga", 17 * 60, "ERC Studio 1"),
    cls("Wednesday", "Cycle Strength", 8 * 60, "ERC Cycle"),
    cls("Wednesday", "Zumba", 19 * 60, "Ritchie Studio"),
    cls("Thursday", "Zumba", 19 * 60, "Ritchie Studio"),
  ];

  it("lists the week starting today", () => {
    const d = classDays("2026-10-07");
    expect(d[0]).toEqual({ day: "Wednesday", label: "Today" });
    expect(d[1]).toEqual({ day: "Thursday", label: "Thu" });
    expect(d).toHaveLength(7);
  });

  it("filters by day, kind and place, earliest first, and notes sign-up opening", () => {
    const f = { day: "Wednesday", kind: null, place: null };
    expect(classRows(classes, f, clock).map((r) => r.title)).toEqual(["Cycle Strength", "Power Yoga", "Zumba"]);
    expect(classRows(classes, { ...f, kind: "Mind-body" }, clock).map((r) => r.title)).toEqual(["Power Yoga"]);
    expect(classRows(classes, { ...f, place: "Ritchie" }, clock).map((r) => r.title)).toEqual(["Zumba"]);
    const thu = classRows(classes, { day: "Thursday", kind: null, place: null }, clock)[0]!;
    expect(thu.note).toBe("Sign-ups open Wednesday 7:00 PM");
    expect(thu.signupUrl).toBe("https://activeterp.umd.edu/x");
    expect(thu.sub).toBe("7:00 PM - 7:50 PM · Ritchie Studio");
  });
});
