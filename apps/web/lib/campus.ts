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

import { cacheLife, cacheTag } from "next/cache";
import { campusTagForKey } from "./campus-tags";
import {
  roomRangeEnd,
  DINING_HALLS,
  fetchAcademicCalendar,
  fetchBuildings,
  fetchCategoryAvailability,
  fetchDiningMenu,
  fetchLibraryHours,
  fetchRecWellAreas,
  fetchGroupFitness,
  type FitnessClass,
  fetchStampVenues,
  fetchRoomCatalog,
  studyRoomCategories,
  withWinterBreak,
  type Building,
  type DiningMenu,
  type StampVenue,
  type AcademicEvent,
  type LibraryHours,
  type RecWellArea,
  type RoomAvailability,
} from "@turboterp/campus-data";
import {
  openSnapshotStore,
  snapshotKeys,
  snapshotOrLive,
  type RoomCatalog,
  type Snapshot,
  type SnapshotStore,
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

let store: SnapshotStore | null = null;
function snapshotStore(): SnapshotStore {
  return (store ??= openSnapshotStore());
}

/** One snapshot, held in memory for `seconds` so concurrent requests share a single read. */
async function readSnapshot<T>(key: string, _seconds?: number): Promise<Snapshot<T> | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 1800, expire: 86400 });
  const tag = campusTagForKey(key);
  if (tag) cacheTag(tag);
  return snapshotStore().get<T>(key);
}

const STABLE = 600;

export async function getLibraryHours(): Promise<LibraryHours[]> {
  const snap = await readSnapshot<LibraryHours[]>(snapshotKeys.libraryHours, STABLE);
  return (await snapshotOrLive(snap, liveLibraryHours)).data;
}

export async function getStampVenues(): Promise<StampVenue[]> {
  const snap = await readSnapshot<StampVenue[]>(snapshotKeys.stampVenues, STABLE);
  return (await snapshotOrLive(snap, liveStampVenues)).data;
}

export async function getAcademicCalendar(): Promise<AcademicEvent[]> {
  const snap = await readSnapshot<AcademicEvent[]>(snapshotKeys.academicCalendar, STABLE);
  // Applied on read, so snapshots stored before this rule get the student winter break too.
  return withWinterBreak((await snapshotOrLive(snap, liveAcademicCalendar)).data);
}

export async function getRecWellAreas(): Promise<RecWellArea[]> {
  const snap = await readSnapshot<RecWellArea[]>(snapshotKeys.recWellAreas, STABLE);
  return (await snapshotOrLive(snap, liveRecWellAreas)).data;
}

export async function getGroupFitness(): Promise<FitnessClass[]> {
  const snap = await readSnapshot<FitnessClass[]>(snapshotKeys.groupFitness, STABLE);
  return (await snapshotOrLive(snap, liveGroupFitness)).data;
}

/** UMD building locations, for walking times between classes. Barely changes, so it's read like the other stable snapshots. */
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

async function liveStampVenues() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3 * 3600, expire: 2 * 86400 });
  return fetchStampVenues();
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

async function liveGroupFitness() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 6 * 3600, expire: 3 * 86400 });
  return fetchGroupFitness();
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
  cacheLife({ stale: 60, revalidate: 120, expire: 3600 });
  const { rooms } = await liveRoomCatalog();
  return fetchCategoryAvailability(rooms, locationId, categoryId, isoDate, roomRangeEnd(isoDate));
}
