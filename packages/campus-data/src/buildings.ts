// UMD building locations, from umd.io's map API (https://api.umd.io/v1/map/buildings).
// Feeds the trip planner's "search a place" boxes -- students pick a building by name
// instead of a bus stop. Snapshotted like the other campus data (SNAPSHOTS.md): never
// fetched per page view.

import { fetchJson, SourceError } from "./http.ts";

/** `code` is Testudo's building abbreviation (e.g. "ARM"); umd.io leaves it "" for many buildings. */
export type Building = { id: string; name: string; code: string; lat: number; lon: number };

type RawBuilding = { name?: unknown; code?: unknown; id?: unknown; lat?: unknown; long?: unknown };

export function parseBuildings(raw: unknown): Building[] {
  if (!Array.isArray(raw)) throw new SourceError("umd-buildings", "feed format changed: not an array");
  const buildings = (raw as RawBuilding[])
    .map((b): Building | null => {
      const name = typeof b.name === "string" ? b.name.trim() : "";
      const id = typeof b.id === "string" ? b.id : typeof b.id === "number" ? String(b.id) : "";
      const lat = Number(b.lat);
      const lon = Number(b.long);
      if (!name || !id || !Number.isFinite(lat) || !Number.isFinite(lon) || (lat === 0 && lon === 0)) return null;
      const code = typeof b.code === "string" ? b.code.trim().toUpperCase() : "";
      return { id, name, code, lat, lon };
    })
    .filter((b): b is Building => b !== null);
  if (buildings.length === 0) throw new SourceError("umd-buildings", "feed format changed: no buildings");
  return buildings;
}

// Testudo building codes umd.io leaves blank or omits -> umd.io building id (matched by name
// against the buildings feed). Hand-kept; unknown codes just mean "no walk time".
// Left out on purpose (off campus, or no confident name match in the feed):
//   BLD3, BLD4 (Shady Grove), DC (Washington),
//   PFR, ZUP, PSC, GVC, RGC, SEN, PBR, RDG.
const CODE_OVERRIDES: Record<string, string> = {
  ATL: "224", // Atlantic Building = the renamed Computer and Space Sciences Building (CSS; no longer used in Testudo, Spring 2027)
  IRB: "432", // Brendan Iribe Center
  YDH: "436", // Yahentamitsi (dining hall)
  ERC: "223", // Energy Research Facility
  BMS: "296", // Biomolecular Sciences Building
  CHI: "059", // Chincoteague Hall
  EDUC: "143", // Benjamin Building (School of Education; umd.io code "EDU")
};

// Buildings missing from the umd.io feed entirely, with hand-entered coordinates.
const EXTRA_BUILDINGS: Record<string, Building> = {
  // School of Public Policy, opened 2023; 38°59'6"N 76°56'19"W (owner, 2026-09-29).
  TMH: { id: "tmh", name: "Thurgood Marshall Hall", code: "TMH", lat: 38.985, lon: -76.93861 },
};

/** The building a Testudo code refers to, or undefined (unknown, off campus, "TBA"). */
export function buildingByCode(buildings: readonly Building[], code: string | null | undefined): Building | undefined {
  const c = (code ?? "").trim().toUpperCase();
  if (!c || c === "TBA") return undefined;
  const overrideId = CODE_OVERRIDES[c];
  if (overrideId) return buildings.find((b) => b.id === overrideId);
  if (EXTRA_BUILDINGS[c]) return EXTRA_BUILDINGS[c];
  return buildings.find((b) => b.code === c);
}

export async function fetchBuildings(): Promise<Building[]> {
  return parseBuildings(await fetchJson("umd-buildings", "https://api.umd.io/v1/map/buildings"));
}
