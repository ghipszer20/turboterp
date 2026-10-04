// Server-side access to campus data. Pages read pre-built snapshots
// (packages/campus-data/SNAPSHOTS.md), so no request waits on a UMD site.
// Only when a snapshot doesn't exist yet (a fresh checkout, a new day before
// the jobs ran) does a getter fetch live, through the cached fetchers below.
//
//   snapshot    re-read at most every   written by
//   room slots  1 min                   refreshFast (every 5 min)
//   dining      5 min                   refreshFast (when 30 min old) + daily build
//   others      10 min                  daily build
//
//   live fallback  refresh (revalidate)
//   dining         30 min
//   libraries      3 h
//   recwell        6 h
//   calendar       6 h
//   room list      1 day
//   room slots     5 min
//   buses          6 h (in memory)

import { cacheLife } from "next/cache";
import {
  addDays,
  DINING_HALLS,
  fetchAcademicCalendar,
  fetchBuildings,
  fetchCategoryAvailability,
  fetchDiningMenu,
  fetchLibraryHours,
  fetchRecWellAreas,
  fetchRoomCatalog,
  fetchShuttleFeed,
  nextDepartures,
  parseGtfs,
  planArriveBy,
  planTrip,
  routeMap,
  routesOn,
  studyRoomCategories,
  type Building,
  type DiningMenu,
  type Feed,
  type AcademicEvent,
  type LibraryHours,
  type Place,
  type PlanArriveByResult,
  type PlanTripResult,
  type RecWellArea,
  type RoomAvailability,
  type RouteWithMap,
  type Stop,
} from "@turboterp/campus-data";
import {
  defaultSnapshotDir,
  FileSnapshotStore,
  snapshotKeys,
  snapshotOrLive,
  type RoomCatalog,
  type Snapshot,
} from "@turboterp/campus-data/snapshots";

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** Never let one broken source take down a page. */
export async function safe<T>(load: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await load() };
  } catch (err) {
    console.error(err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ---- snapshots ----

let store: FileSnapshotStore | null = null;
function snapshotStore(): FileSnapshotStore {
  return (store ??= new FileSnapshotStore(defaultSnapshotDir()));
}

/** One snapshot, held in memory for `seconds` so concurrent requests share a single read. */
async function readSnapshot<T>(key: string, seconds: number): Promise<Snapshot<T> | null> {
  "use cache";
  cacheLife({ stale: 30, revalidate: seconds, expire: 86400 });
  return snapshotStore().get<T>(key);
}

const STABLE = 600;

export async function getLibraryHours(): Promise<LibraryHours[]> {
  const snap = await readSnapshot<LibraryHours[]>(snapshotKeys.libraryHours, STABLE);
  return (await snapshotOrLive(snap, liveLibraryHours)).data;
}

export async function getAcademicCalendar(): Promise<AcademicEvent[]> {
  const snap = await readSnapshot<AcademicEvent[]>(snapshotKeys.academicCalendar, STABLE);
  return (await snapshotOrLive(snap, liveAcademicCalendar)).data;
}

export async function getRecWellAreas(): Promise<RecWellArea[]> {
  const snap = await readSnapshot<RecWellArea[]>(snapshotKeys.recWellAreas, STABLE);
  return (await snapshotOrLive(snap, liveRecWellAreas)).data;
}

/** UMD building locations, for the trip planner's "From"/"To" search. Barely changes, so it's read like the other stable snapshots. */
export async function getBuildings(): Promise<Building[]> {
  const snap = await readSnapshot<Building[]>(snapshotKeys.buildings, STABLE);
  return (await snapshotOrLive(snap, liveBuildings)).data;
}

export async function getDiningMenu(hallId: number, isoDate: string): Promise<DiningMenu> {
  const snap = await readSnapshot<DiningMenu>(snapshotKeys.diningMenu(isoDate, hallId), 300);
  return (await snapshotOrLive(snap, () => liveDiningMenu(hallId, isoDate))).data;
}

export async function getAllDiningMenus(isoDate: string) {
  return Promise.all(DINING_HALLS.map((h) => safe(() => getDiningMenu(h.id, isoDate))));
}

export type StudyRooms = {
  catalog: RoomCatalog;
  rooms: RoomAvailability[];
  /** Categories that couldn't be loaded. */
  failed: number;
  /** When the oldest availability snapshot shown was fetched; null if all were fetched live. */
  updatedAt: string | null;
};

/** Availability of every study room on a date. Throws only if the room list itself is unavailable. */
export async function getStudyRooms(isoDate: string): Promise<StudyRooms> {
  const catalog = (await snapshotOrLive(await readSnapshot<RoomCatalog>(snapshotKeys.roomCatalog, STABLE), liveRoomCatalog))
    .data;
  const results = await Promise.all(
    studyRoomCategories(catalog.rooms).map((c) =>
      safe(async () =>
        snapshotOrLive(
          await readSnapshot<RoomAvailability[]>(snapshotKeys.roomAvailability(isoDate, c.locationId, c.categoryId), 60),
          () => liveRoomAvailability(c.locationId, c.categoryId, isoDate),
        ),
      ),
    ),
  );
  const loaded = results.flatMap((r) => (r.ok ? [r.data] : []));
  const times = loaded.flatMap((r) => (r.updatedAt ? [r.updatedAt] : [])).sort();
  return {
    catalog,
    rooms: loaded.flatMap((r) => r.data),
    failed: results.length - loaded.length,
    updatedAt: times[0] ?? null,
  };
}

// ---- live fallbacks (only when no snapshot exists) ----

async function liveLibraryHours() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3 * 3600, expire: 2 * 86400 });
  return fetchLibraryHours(2);
}

async function liveAcademicCalendar() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 6 * 3600, expire: 3 * 86400 });
  return fetchAcademicCalendar();
}

async function liveRecWellAreas() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 6 * 3600, expire: 3 * 86400 });
  return fetchRecWellAreas();
}

async function liveBuildings() {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 86400, expire: 7 * 86400 });
  return fetchBuildings();
}

async function liveDiningMenu(hallId: number, isoDate: string) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 1800, expire: 86400 });
  return fetchDiningMenu(hallId, isoDate);
}

async function liveRoomCatalog() {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 86400, expire: 7 * 86400 });
  return fetchRoomCatalog();
}

async function liveRoomAvailability(locationId: number, categoryId: number, isoDate: string) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  const { rooms } = await liveRoomCatalog();
  return fetchCategoryAvailability(rooms, locationId, categoryId, isoDate, addDays(isoDate, 1));
}

// ---- buses ----
// The parsed feed is big (≈100k stop times), so it lives in server memory,
// parsed from the GTFS snapshot (live download only if there is none) and
// reloaded every 6 hours; only small derived answers go through 'use cache'.

let feed: { loadedAt: number; promise: Promise<Feed> } | null = null;

function loadFeed(): Promise<Feed> {
  if (!feed || Date.now() - feed.loadedAt > 6 * 3_600_000) {
    const promise = snapshotStore()
      .get<Record<string, string>>(snapshotKeys.shuttleGtfs)
      .then((snap) => (snap ? parseGtfs(snap.data) : fetchShuttleFeed()));
    feed = { loadedAt: Date.now(), promise };
    promise.catch(() => {
      feed = null; // retry on the next request instead of caching the failure
    });
  }
  return feed.promise;
}

export type BusStop = { id: string; name: string; lat: number; lon: number; departuresToday: number };

/** Stops with service on a date, busiest first. */
export async function getBusStops(isoDate: string): Promise<BusStop[]> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 86400, expire: 2 * 86400 });
  const f = await loadFeed();
  const counts = new Map<string, number>();
  for (const [stopId] of f.stopTimesByStop) {
    counts.set(stopId, nextDepartures(f, stopId, isoDate, 0, 1000).length);
  }
  return [...f.stops.values()]
    .map((s) => ({ ...s, departuresToday: counts.get(s.id) ?? 0 }))
    .filter((s) => s.departuresToday > 0)
    .sort((a, b) => b.departuresToday - a.departuresToday);
}

export async function getRoutesOn(isoDate: string) {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 86400, expire: 2 * 86400 });
  const f = await loadFeed();
  return {
    routes: routesOn(f, isoDate).sort((a, b) => a.shortName.localeCompare(b.shortName, "en", { numeric: true })),
    validUntil: f.validUntil,
  };
}

type MapStop = { id: string; name: string; lat: number; lon: number };
export type CampusMap = { routes: RouteWithMap[]; stops: MapStop[]; stopRoutes: Record<string, string[]> };

/** Route lines and stops for the Transport map, for the routes running that day. */
export async function getCampusMap(isoDate: string): Promise<CampusMap> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 86400, expire: 2 * 86400 });
  const f = await loadFeed();
  const { routes, stopRoutes } = routeMap(f, isoDate);
  const stops = Object.keys(stopRoutes)
    .map((id) => f.stops.get(id))
    .filter((s): s is Stop => Boolean(s))
    .map(({ id, name, lat, lon }) => ({ id, name, lat, lon }));
  return { routes, stops, stopRoutes };
}

export async function getDepartures(stopIds: string[], isoDate: string, fromMinutes: number, perStop = 4) {
  const f = await loadFeed();
  return stopIds.map((id) => ({
    stopId: id,
    departures: nextDepartures(f, id, isoDate, fromMinutes, perStop).map((d) => ({
      tripId: d.tripId,
      route: d.route.shortName,
      routeName: d.route.longName,
      color: d.route.color,
      textColor: d.route.textColor,
      headsign: d.headsign,
      minutes: d.minutes,
    })),
  }));
}

/** The trip planner: walking the whole way, plus up to 3 Shuttle-UM itineraries between two real places. */
export async function planTripBetween(isoDate: string, fromMinutes: number, from: Place, to: Place): Promise<PlanTripResult> {
  const f = await loadFeed();
  return planTrip(f, isoDate, fromMinutes, from, to);
}

/** Arrive-by mode: the latest way to leave that still gets between two places by `arriveByMinutes`. */
export async function planArriveByBetween(isoDate: string, arriveByMinutes: number, from: Place, to: Place): Promise<PlanArriveByResult> {
  const f = await loadFeed();
  return planArriveBy(f, isoDate, arriveByMinutes, from, to);
}
