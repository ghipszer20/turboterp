// The snapshot jobs (how they're scheduled: ../../SNAPSHOTS.md).
//
//   buildSnapshots  daily, ~5am   room catalog, room availability, today's menus,
//                                 library hours, RecWell hours, Shuttle-UM GTFS, academic calendar
//   refreshFast     every ~5 min  room availability; menus once they're 30 min old
//
// A source that fails never overwrites its last good snapshot: the error goes
// to a separate status record, so a snapshot's updatedAt always means "when
// this data was fetched".

import { fetchBuildings, type Building } from "../buildings.ts";
import { addDays, campusDate } from "../dates.ts";
import { DINING_HALLS, fetchDiningMenu, type DiningMenu } from "../dining.ts";
import { parseGtfs, SHUTTLE_UM_GTFS_URL, unzipGtfs } from "../buses.ts";
import { fetchAcademicCalendar, type AcademicEvent } from "../calendar.ts";
import { fetchBytes } from "../http.ts";
import { fetchLibraryHours, type LibraryHours } from "../libraries.ts";
import { fetchRecWellAreas, recWellWindow, type RecWellArea } from "../recwell.ts";
import {
  fetchCategoryAvailability,
  fetchRoomCatalog,
  studyRoomCategories,
  type Room,
  type RoomAvailability,
  type RoomLocation,
} from "../rooms.ts";
import type { SnapshotStore } from "./store.ts";

export type RoomCatalog = { locations: RoomLocation[]; rooms: Room[] };

/** Where each source's data comes from; tests pass fixture-backed fakes. */
export type CampusSources = {
  roomCatalog(): Promise<RoomCatalog>;
  roomAvailability(rooms: Room[], locationId: number, categoryId: number, isoDate: string): Promise<RoomAvailability[]>;
  diningMenu(hallId: number, isoDate: string): Promise<DiningMenu>;
  libraryHours(): Promise<LibraryHours[]>;
  recWellAreas(): Promise<RecWellArea[]>;
  /** The unzipped GTFS text files (file name → contents). */
  shuttleGtfs(): Promise<Record<string, string>>;
  /** UMD building locations, for the trip planner's place search. */
  buildings(): Promise<Building[]>;
  /** Key registrar dates for the current and next terms. */
  academicCalendar(): Promise<AcademicEvent[]>;
};

export const liveSources: CampusSources = {
  roomCatalog: fetchRoomCatalog,
  roomAvailability: (rooms, locationId, categoryId, isoDate) =>
    fetchCategoryAvailability(rooms, locationId, categoryId, isoDate, addDays(isoDate, 1)),
  diningMenu: fetchDiningMenu,
  libraryHours: () => fetchLibraryHours(2),
  recWellAreas: fetchRecWellAreas,
  shuttleGtfs: async () => unzipGtfs(await fetchBytes("buses", SHUTTLE_UM_GTFS_URL)),
  buildings: fetchBuildings,
  academicCalendar: fetchAcademicCalendar,
};

export const snapshotKeys = {
  roomCatalog: "rooms/catalog",
  roomAvailability: (isoDate: string, locationId: number, categoryId: number) =>
    `rooms/${isoDate}/${locationId}-${categoryId}`,
  diningMenu: (isoDate: string, hallId: number) => `dining/${isoDate}/${hallId}`,
  libraryHours: "libraries/hours",
  recWellAreas: "recwell/areas",
  shuttleGtfs: "buses/gtfs",
  buildings: "buildings",
  academicCalendar: "calendar/academic",
  /** The last attempt to refresh a snapshot key. */
  status: (key: string) => `status/${key}`,
} as const;

/** How many days of RecWell hours a snapshot keeps (the sheet covers a whole year). */
export const RECWELL_DAYS = 14;
/** Menus are re-checked once their snapshot is this old. */
export const MENU_RECHECK_MS = 30 * 60_000;

export type SourceStatus = { lastAttemptAt: string; lastSuccessAt: string | null; error: string | null };
export type JobResult = { key: string; ok: boolean; error?: string };
export type JobReport = { ok: boolean; results: JobResult[] };

/** Fetch one snapshot; on success store it, on failure keep the old one. Either way record the attempt. */
async function refresh<T>(
  store: SnapshotStore,
  now: Date,
  key: string,
  load: () => Promise<T>,
): Promise<JobResult & { data?: T }> {
  const at = now.toISOString();
  const previous = await store.get<SourceStatus>(snapshotKeys.status(key));
  try {
    const data = await load();
    await store.put(key, { updatedAt: at, data });
    await store.put<SourceStatus>(snapshotKeys.status(key), {
      updatedAt: at,
      data: { lastAttemptAt: at, lastSuccessAt: at, error: null },
    });
    return { key, ok: true, data };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await store.put<SourceStatus>(snapshotKeys.status(key), {
      updatedAt: at,
      data: { lastAttemptAt: at, lastSuccessAt: previous?.data.lastSuccessAt ?? null, error },
    });
    return { key, ok: false, error };
  }
}

function report(results: JobResult[]): JobReport {
  return { ok: results.every((r) => r.ok), results: results.map(({ key, ok, error }) => (ok ? { key, ok } : { key, ok, error })) };
}

async function refreshRooms(
  store: SnapshotStore,
  now: Date,
  sources: CampusSources,
  catalog: RoomCatalog | null,
): Promise<JobResult[]> {
  if (!catalog) {
    return [{ key: snapshotKeys.roomCatalog, ok: false, error: "No room catalog snapshot; run the daily build first." }];
  }
  const today = campusDate(now);
  return Promise.all(
    studyRoomCategories(catalog.rooms).map((c) =>
      refresh(store, now, snapshotKeys.roomAvailability(today, c.locationId, c.categoryId), () =>
        sources.roomAvailability(catalog.rooms, c.locationId, c.categoryId, today),
      ),
    ),
  );
}

function refreshMenus(store: SnapshotStore, now: Date, sources: CampusSources, hallIds: number[]) {
  const today = campusDate(now);
  return Promise.all(
    hallIds.map((id) => refresh(store, now, snapshotKeys.diningMenu(today, id), () => sources.diningMenu(id, today))),
  );
}

/** The daily job: every stable source, plus today's rooms and menus. */
export async function buildSnapshots(
  store: SnapshotStore,
  now: Date,
  sources: CampusSources = liveSources,
): Promise<JobReport> {
  const today = campusDate(now);
  const catalogJob = (async () => {
    const result = await refresh(store, now, snapshotKeys.roomCatalog, async () => {
      const catalog = await sources.roomCatalog();
      if (catalog.rooms.length === 0) throw new Error("room catalog came back empty");
      return catalog;
    });
    // A failed catalog fetch falls back to the last good one for today's availability.
    const catalog = result.data ?? (await store.get<RoomCatalog>(snapshotKeys.roomCatalog))?.data ?? null;
    return [result, ...(await refreshRooms(store, now, sources, catalog))];
  })();

  const results = await Promise.all([
    catalogJob,
    refreshMenus(store, now, sources, DINING_HALLS.map((h) => h.id)),
    refresh(store, now, snapshotKeys.libraryHours, () => sources.libraryHours()),
    refresh(store, now, snapshotKeys.recWellAreas, async () =>
      recWellWindow(await sources.recWellAreas(), today, RECWELL_DAYS),
    ),
    refresh(store, now, snapshotKeys.shuttleGtfs, async () => {
      const files = await sources.shuttleGtfs();
      parseGtfs(files); // throws on a feed we couldn't use
      return files;
    }),
    refresh(store, now, snapshotKeys.buildings, () => sources.buildings()),
    refresh(store, now, snapshotKeys.academicCalendar, async () => {
      const events = await sources.academicCalendar();
      if (events.length === 0) throw new Error("academic calendar came back empty");
      return events;
    }),
  ]);
  await pruneSnapshots(store, now);
  return report(results.flat());
}

/** The frequent job: room availability every run, menus once their snapshot is 30 minutes old. */
export async function refreshFast(
  store: SnapshotStore,
  now: Date,
  sources: CampusSources = liveSources,
): Promise<JobReport> {
  const today = campusDate(now);
  const catalog = (await store.get<RoomCatalog>(snapshotKeys.roomCatalog))?.data ?? null;

  const dueHalls: number[] = [];
  for (const hall of DINING_HALLS) {
    const snap = await store.get(snapshotKeys.diningMenu(today, hall.id));
    if (!snap || now.getTime() - Date.parse(snap.updatedAt) >= MENU_RECHECK_MS) dueHalls.push(hall.id);
  }

  const results = await Promise.all([
    refreshRooms(store, now, sources, catalog),
    refreshMenus(store, now, sources, dueHalls),
  ]);
  return report(results.flat());
}

/** The dated key prefixes pruneSnapshots looks under: `<prefix>/<date>/...`. */
const DATED_PREFIXES = ["rooms", "dining"] as const;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type PruneOptions = { keepDays?: number };
export type PruneReport = { removed: string[] };

/**
 * Remove dated snapshots (and their `status/` entries) whose date falls outside
 * `keepDays` days of `now`, in campus time. Defaults to keeping yesterday, today,
 * and tomorrow (keepDays: 1). Undated keys (the room catalog, library hours,
 * RecWell areas, the GTFS feed, building locations) are never touched.
 */
export async function pruneSnapshots(store: SnapshotStore, now: Date, { keepDays = 1 }: PruneOptions = {}): Promise<PruneReport> {
  const today = campusDate(now);
  const from = addDays(today, -keepDays);
  const to = addDays(today, keepDays);
  const removed: string[] = [];
  for (const prefix of DATED_PREFIXES) {
    for (const key of await store.list(prefix)) {
      const date = key.split("/")[1];
      if (!date || !ISO_DATE.test(date) || (date >= from && date <= to)) continue;
      await store.delete(key);
      await store.delete(snapshotKeys.status(key));
      removed.push(key);
    }
  }
  return { removed };
}
