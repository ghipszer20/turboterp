// The saved schedule's picked sections for today's hero. Same saved-schedule key and format as the
// web; section files come from the cached /api/schedule route at the app's base URL.

import type { Building } from "@turboterp/campus-data";
import { buildingByCode } from "@turboterp/campus-data/buildings";
import { distanceMeters, walkMinutes } from "@turboterp/campus-data/walk";
import { decodeDepartmentSections } from "@turboterp/course-data/schedule-files";
import type { Section } from "@turboterp/course-data/schedules";
import { fetchV1, V1_PATHS } from "@turboterp/app-core/api-v1/client";
import { kvGet, type KeyValueStore } from "@turboterp/app-core/key-value-store";
import { pickedForToday } from "@turboterp/app-core/schedule/leave-by";
import { parseSaved, SAVED_KEY } from "@turboterp/app-core/schedule/saved";

/** Sections the saved schedule picked, or null when there is no saved schedule. `getJson` returns null on any failure. */
export async function loadPickedSections(kv: KeyValueStore, getJson: (path: string) => Promise<unknown>): Promise<Section[] | null> {
  const raw = kvGet(kv, SAVED_KEY);
  if (!raw) return null;
  let term: unknown;
  try {
    term = (JSON.parse(raw) as { term?: unknown }).term;
  } catch {
    return null;
  }
  if (typeof term !== "string") return null;
  const picks = pickedForToday(parseSaved(raw, term));
  const depts = [...new Set(Object.keys(picks).map((c) => c.slice(0, 4)))];
  if (depts.length === 0) return null;
  const files = await Promise.all(
    depts.map(async (d) => {
      const j = await getJson(`/api/schedule/${term}/sections/${d}`).catch(() => null);
      try {
        return j ? decodeDepartmentSections(j).sections : [];
      } catch {
        return [] as Section[];
      }
    }),
  );
  return files.flat().filter((s) => picks[s.courseId] === s.id);
}

/** Walking minutes between two building codes, or null when either is unknown. */
export function walkBetween(buildings: readonly Building[]) {
  return (from: string, to: string): number | null => {
    const a = buildingByCode(buildings, from);
    const b = buildingByCode(buildings, to);
    return a && b ? walkMinutes(distanceMeters(a.lat, a.lon, b.lat, b.lon)) : null;
  };
}

export async function loadBuildings(baseUrl: string, accessToken?: string): Promise<Building[]> {
  const res = await fetchV1<Building[]>(V1_PATHS.buildings, { baseUrl, accessToken, check: (d): d is Building[] => Array.isArray(d) });
  return res.ok ? res.data : [];
}
