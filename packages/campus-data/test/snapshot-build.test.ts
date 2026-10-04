// The snapshot jobs, driven by fixture-backed sources and a temp-directory
// store. Never touches the network.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseAcademicCalendar } from "../src/calendar.ts";
import { parseDiningMenu, type DiningMenu } from "../src/dining.ts";
import { parseLibCalHours, type LibCalHoursFeed } from "../src/libraries.ts";
import { parseRecWellTab } from "../src/recwell.ts";
import { applyAvailability, parseRoomLocations, parseRooms, type Room } from "../src/rooms.ts";
import {
  buildSnapshots,
  pruneSnapshots,
  refreshFast,
  snapshotKeys,
  type CampusSources,
  type SourceStatus,
} from "../src/snapshots/build.ts";
import { FileSnapshotStore } from "../src/snapshots/store.ts";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

// 9am in College Park on 2026-09-25.
const NOW = new Date("2026-09-25T13:00:00.000Z");
const TODAY = "2026-09-25";
const minutesAfter = (min: number) => new Date(NOW.getTime() + min * 60_000);

const GTFS = {
  "routes.txt": "route_id,route_short_name,route_long_name,route_color,route_text_color\n118,118,Gold,FFD200,000000",
  "stops.txt": "stop_id,stop_name,stop_lat,stop_lon\nSTAMP,Stamp,38.9882,-76.9445",
  "trips.txt": "route_id,service_id,trip_id,trip_headsign\n118,WEEKDAY,g1,Metro",
  "stop_times.txt": "trip_id,arrival_time,departure_time,stop_id,stop_sequence\ng1,08:00:00,08:00:00,STAMP,1",
};

/** Fixture-backed sources that count calls; `fail` makes a source throw. */
function fakeSources(fail: Partial<Record<keyof CampusSources, boolean>> = {}) {
  const calls: Record<keyof CampusSources, number> = {
    roomCatalog: 0,
    roomAvailability: 0,
    diningMenu: 0,
    libraryHours: 0,
    recWellAreas: 0,
    shuttleGtfs: 0,
    buildings: 0,
    academicCalendar: 0,
  };
  const roomsHtml = fixture("rooms-stem.html");
  const run = <T,>(name: keyof CampusSources, value: () => T): Promise<T> => {
    calls[name]++;
    return fail[name] ? Promise.reject(new Error(`${name} is down`)) : Promise.resolve(value());
  };
  const sources: CampusSources = {
    roomCatalog: () => run("roomCatalog", () => ({ locations: parseRoomLocations(roomsHtml), rooms: parseRooms(roomsHtml) })),
    roomAvailability: (rooms: Room[], _loc: number, categoryId: number) =>
      run("roomAvailability", () =>
        applyAvailability(
          rooms.filter((r) => r.categoryId === categoryId),
          JSON.parse(fixture("rooms-stem-grid.json")),
        ),
      ),
    diningMenu: (hallId: number, date: string) =>
      run("diningMenu", () => parseDiningMenu(fixture("dining-yahentamitsi.html"), hallId, date)),
    libraryHours: () => run("libraryHours", () => parseLibCalHours(JSON.parse(fixture("libcal-hours.json")) as LibCalHoursFeed)),
    recWellAreas: () => run("recWellAreas", () => parseRecWellTab(fixture("recwell-eppley.csv"), "indoor")),
    shuttleGtfs: () => run("shuttleGtfs", () => ({ ...GTFS })),
    academicCalendar: () => run("academicCalendar", () => parseAcademicCalendar(fixture("academic-calendar-447.html"), "Spring 2027")),
    buildings: () =>
      run("buildings", () => [
        { id: "432", name: "Brendan Iribe Center", code: "", lat: 38.9891607057353, lon: -76.9364438800535 },
        { id: "026", name: "South Campus Dining Hall", code: "SDH", lat: 38.983048, lon: -76.9436837393588 },
      ]),
  };
  return { sources, calls };
}

let dir: string;
let store: FileSnapshotStore;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "turboterp-build-"));
  store = new FileSnapshotStore(dir);
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("buildSnapshots", () => {
  it("writes every stable snapshot, stamped with the build time", async () => {
    const report = await buildSnapshots(store, NOW, fakeSources().sources);

    expect(report.ok).toBe(true);
    const keys = [
      "rooms/catalog",
      "rooms/2026-09-25/6745-23066",
      "dining/2026-09-25/19",
      "dining/2026-09-25/16",
      "dining/2026-09-25/51",
      "libraries/hours",
      "recwell/areas",
      "buses/gtfs",
      "buildings",
      "calendar/academic",
    ];
    for (const key of keys) {
      expect((await store.get(key))?.updatedAt, key).toBe("2026-09-25T13:00:00.000Z");
    }
    const menu = await store.get<DiningMenu>("dining/2026-09-25/16");
    expect(menu?.data).toMatchObject({ hallId: 16, date: TODAY });
    expect(menu?.data.meals.map((m) => m.name)).toEqual(["Breakfast", "Lunch", "Dinner"]);
  });

  it("names snapshot keys by date so a new day never reads yesterday's menu", () => {
    expect(snapshotKeys.diningMenu("2026-09-26", 19)).toBe("dining/2026-09-26/19");
    expect(snapshotKeys.roomAvailability("2026-09-26", 6745, 23066)).toBe("rooms/2026-09-26/6745-23066");
  });

  it("stores only two weeks of RecWell hours, starting today", async () => {
    await buildSnapshots(store, new Date("2026-01-05T15:00:00.000Z"), fakeSources().sources);
    const areas = await store.get<{ hoursByDate: Record<string, string> }[]>("recwell/areas");
    // The fixture sheet covers 2026-01-01..07; the window drops the earlier days.
    expect(Object.keys(areas!.data[0]!.hoursByDate)).toEqual(["2026-01-05", "2026-01-06", "2026-01-07"]);
  });

  it("keeps the last good snapshot when a source fails, and records the error", async () => {
    await buildSnapshots(store, NOW, fakeSources().sources);
    const before = await store.get("libraries/hours");

    const later = minutesAfter(24 * 60);
    const report = await buildSnapshots(store, later, fakeSources({ libraryHours: true }).sources);

    expect(report.ok).toBe(false);
    expect(report.results.find((r) => r.key === "libraries/hours")).toMatchObject({
      ok: false,
      error: "libraryHours is down",
    });
    expect(await store.get("libraries/hours")).toEqual(before);
    const status = await store.get<SourceStatus>(snapshotKeys.status("libraries/hours"));
    expect(status?.data).toEqual({
      lastAttemptAt: later.toISOString(),
      lastSuccessAt: NOW.toISOString(),
      error: "libraryHours is down",
    });
    // Everything else still refreshed.
    expect((await store.get("recwell/areas"))?.updatedAt).toBe(later.toISOString());
  });

  it("clears a recorded error once the source works again", async () => {
    await buildSnapshots(store, NOW, fakeSources({ libraryHours: true }).sources);
    const later = minutesAfter(60);
    await buildSnapshots(store, later, fakeSources().sources);
    const status = await store.get<SourceStatus>(snapshotKeys.status("libraries/hours"));
    expect(status?.data).toEqual({ lastAttemptAt: later.toISOString(), lastSuccessAt: later.toISOString(), error: null });
  });

  it("rejects a bus feed that won't parse instead of overwriting the good one", async () => {
    await buildSnapshots(store, NOW, fakeSources().sources);
    const broken = fakeSources();
    broken.sources.shuttleGtfs = async () => ({ "routes.txt": GTFS["routes.txt"] }); // stops.txt etc. missing
    const report = await buildSnapshots(store, minutesAfter(60), broken.sources);

    expect(report.results.find((r) => r.key === "buses/gtfs")?.ok).toBe(false);
    expect((await store.get("buses/gtfs"))?.updatedAt).toBe(NOW.toISOString());
  });

  it("builds room availability from the last good catalog when the catalog fetch fails", async () => {
    await buildSnapshots(store, NOW, fakeSources().sources);
    const later = minutesAfter(60);
    const report = await buildSnapshots(store, later, fakeSources({ roomCatalog: true }).sources);

    expect(report.results.find((r) => r.key === "rooms/catalog")?.ok).toBe(false);
    expect((await store.get("rooms/2026-09-25/6745-23066"))?.updatedAt).toBe(later.toISOString());
  });

  it("stores a hall that posted no menu as a valid, empty menu", async () => {
    const { sources } = fakeSources();
    sources.diningMenu = async (hallId, date) => ({ hallId, date, meals: [] });
    const report = await buildSnapshots(store, NOW, sources);
    expect(report.ok).toBe(true);
    expect((await store.get<DiningMenu>("dining/2026-09-25/51"))?.data.meals).toEqual([]);
  });

  it("prunes old dated snapshots at the end of the build", async () => {
    await buildSnapshots(store, NOW, fakeSources().sources);
    const staleKey = snapshotKeys.diningMenu("2026-09-01", 19);
    await store.put(staleKey, { updatedAt: NOW.toISOString(), data: { hallId: 19, date: "2026-09-01", meals: [] } });

    await buildSnapshots(store, minutesAfter(24 * 60), fakeSources().sources);

    expect(await store.get(staleKey)).toBeNull();
  });
});

describe("refreshFast", () => {
  it("refreshes room availability on every run", async () => {
    await buildSnapshots(store, NOW, fakeSources().sources);
    const later = minutesAfter(5);
    const { sources, calls } = fakeSources();
    const report = await refreshFast(store, later, sources);

    expect(report.ok).toBe(true);
    expect(calls.roomAvailability).toBe(1);
    expect(calls.roomCatalog).toBe(0);
    expect((await store.get("rooms/2026-09-25/6745-23066"))?.updatedAt).toBe(later.toISOString());
  });

  it("re-checks menus only once they are 30 minutes old", async () => {
    await buildSnapshots(store, NOW, fakeSources().sources);

    const early = fakeSources();
    await refreshFast(store, minutesAfter(25), early.sources);
    expect(early.calls.diningMenu).toBe(0);
    expect((await store.get("dining/2026-09-25/19"))?.updatedAt).toBe(NOW.toISOString());

    const due = fakeSources();
    await refreshFast(store, minutesAfter(30), due.sources);
    expect(due.calls.diningMenu).toBe(3);
    expect((await store.get("dining/2026-09-25/19"))?.updatedAt).toBe(minutesAfter(30).toISOString());
  });

  it("fetches a new day's menus as soon as the date rolls over", async () => {
    await buildSnapshots(store, NOW, fakeSources().sources);
    const nextDay = new Date("2026-09-26T04:05:00.000Z"); // 12:05am in College Park
    const { sources, calls } = fakeSources();
    await refreshFast(store, nextDay, sources);
    expect(calls.diningMenu).toBe(3);
    expect((await store.get<DiningMenu>("dining/2026-09-26/19"))?.data.date).toBe("2026-09-26");
    expect((await store.get("rooms/2026-09-26/6745-23066"))?.updatedAt).toBe(nextDay.toISOString());
  });

  it("keeps the previous menu when a re-check fails", async () => {
    await buildSnapshots(store, NOW, fakeSources().sources);
    const report = await refreshFast(store, minutesAfter(30), fakeSources({ diningMenu: true }).sources);
    expect(report.ok).toBe(false);
    expect((await store.get("dining/2026-09-25/19"))?.updatedAt).toBe(NOW.toISOString());
  });

  it("reports an error instead of scraping the whole room catalog when none is stored", async () => {
    const { sources, calls } = fakeSources();
    const report = await refreshFast(store, NOW, sources);
    expect(calls.roomCatalog).toBe(0);
    expect(report.results.find((r) => r.key === "rooms/catalog")).toMatchObject({
      ok: false,
      error: expect.stringMatching(/no room catalog snapshot/i),
    });
  });
});

describe("pruneSnapshots", () => {
  async function putDated(key: string) {
    await store.put(key, { updatedAt: NOW.toISOString(), data: 1 });
    await store.put<SourceStatus>(snapshotKeys.status(key), {
      updatedAt: NOW.toISOString(),
      data: { lastAttemptAt: NOW.toISOString(), lastSuccessAt: NOW.toISOString(), error: null },
    });
  }

  it("keeps yesterday, today, and tomorrow by default, and removes everything else dated, including its status entry", async () => {
    const tooOld = snapshotKeys.diningMenu("2026-09-20", 19);
    const yesterday = snapshotKeys.diningMenu("2026-09-24", 19);
    const today = snapshotKeys.diningMenu("2026-09-25", 19);
    const tomorrow = snapshotKeys.roomAvailability("2026-09-26", 6745, 23066);
    const tooNew = snapshotKeys.roomAvailability("2026-09-27", 6745, 23066);
    for (const key of [tooOld, yesterday, today, tomorrow, tooNew]) await putDated(key);

    const result = await pruneSnapshots(store, NOW);

    expect(result.removed.sort()).toEqual([tooNew, tooOld].sort());
    expect(await store.get(tooOld)).toBeNull();
    expect(await store.get(snapshotKeys.status(tooOld))).toBeNull();
    expect(await store.get(tooNew)).toBeNull();
    expect(await store.get(snapshotKeys.status(tooNew))).toBeNull();
    expect(await store.get(yesterday)).not.toBeNull();
    expect(await store.get(today)).not.toBeNull();
    expect(await store.get(tomorrow)).not.toBeNull();
    expect(await store.get(snapshotKeys.status(yesterday))).not.toBeNull();
  });

  it("never touches undated keys", async () => {
    const undated = [
      snapshotKeys.roomCatalog,
      snapshotKeys.libraryHours,
      snapshotKeys.recWellAreas,
      snapshotKeys.shuttleGtfs,
      snapshotKeys.buildings,
      snapshotKeys.academicCalendar,
    ];
    for (const key of undated) await store.put(key, { updatedAt: NOW.toISOString(), data: 1 });

    const result = await pruneSnapshots(store, NOW);

    expect(result.removed).toEqual([]);
    for (const key of undated) expect(await store.get(key)).not.toBeNull();
  });

  it("widens the keep window with keepDays", async () => {
    const key = snapshotKeys.diningMenu("2026-09-22", 19); // 3 days before NOW's campus date
    await putDated(key);

    await pruneSnapshots(store, NOW, { keepDays: 3 });
    expect(await store.get(key)).not.toBeNull();

    await pruneSnapshots(store, NOW, { keepDays: 1 });
    expect(await store.get(key)).toBeNull();
  });
});

describe("academic calendar snapshot", () => {
  it("keeps the last good calendar when the registrar is down", async () => {
    await buildSnapshots(store, NOW, fakeSources().sources);
    const before = await store.get("calendar/academic");
    const report = await buildSnapshots(store, minutesAfter(60), fakeSources({ academicCalendar: true }).sources);
    expect(report.results.find((r) => r.key === "calendar/academic")).toMatchObject({ ok: false });
    expect(await store.get("calendar/academic")).toEqual(before);
  });
});
