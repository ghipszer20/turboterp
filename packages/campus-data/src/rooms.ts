// Study-room availability from UMD Libraries' LibCal space booking.
// Read-only: we show what's open and deep-link to LibCal to book. We never
// submit bookings (see PROJECT_MEMORY.md, "Study-room booking plan").
//
// Discovery (observed 2026-09-24):
//   GET /reserve?lid=L[&gid=G] → HTML with <select id="lid"> (locations),
//     <select id="gid"> (categories) and one JS object per room
//     ({ id: "eid_N", title, url: "/space/N", eid, gid, lid, grouping, capacity }).
//   POST /spaces/availability/grid → { slots: [{ start, end, itemId, className? }] };
//     className "s-lc-eq-checkout" means booked, no className means open.

import * as cheerio from "cheerio";
import { addDays } from "./dates.ts";
import { fetchJson, fetchText, SourceError } from "./http.ts";

const LIBCAL = "https://umd.libcal.com";

export type RoomLocation = { id: number; name: string };
export type RoomCategory = { id: number; locationId: number; name: string };

export type Room = {
  id: number;
  /** Room label, e.g. "7209". */
  name: string;
  capacity: number | null;
  categoryId: number;
  locationId: number;
  categoryName: string;
  /** LibCal page for this room, where the student finishes booking. */
  bookingUrl: string;
};

export type OpenWindow = { start: string; end: string };
export type RoomAvailability = Room & { open: OpenWindow[] };

type GridSlot = { start: string; end: string; itemId: number; className?: string };

function selectOptions(html: string, selectId: string): { id: number; name: string }[] {
  const $ = cheerio.load(html);
  return $(`select#${selectId} option`)
    .toArray()
    .map((o) => ({ id: Number($(o).attr("value")), name: $(o).text().trim() }))
    .filter((o) => Number.isFinite(o.id) && o.id > 0 && o.name !== "");
}

export function parseRoomLocations(html: string): RoomLocation[] {
  const locations = selectOptions(html, "lid");
  if (locations.length === 0) throw new SourceError("rooms", "page layout changed: no locations");
  return locations;
}

export function parseRoomCategories(html: string, locationId: number): RoomCategory[] {
  return selectOptions(html, "gid").map((c) => ({ ...c, locationId }));
}

function jsString(block: string, key: string): string | null {
  const m = new RegExp(`\\b${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`).exec(block);
  return m ? (JSON.parse(`"${m[1]}"`) as string) : null;
}

function jsNumber(block: string, key: string): number | null {
  const m = new RegExp(`\\b${key}:\\s*(\\d+)`).exec(block);
  return m ? Number(m[1]) : null;
}

export function parseRooms(html: string): Room[] {
  const rooms: Room[] = [];
  for (const m of html.matchAll(/id:\s*"eid_\d+"[\s\S]*?\}\)/g)) {
    const block = m[0];
    const id = jsNumber(block, "eid");
    const title = jsString(block, "title");
    const categoryId = jsNumber(block, "gid");
    const locationId = jsNumber(block, "lid");
    if (id === null || title === null || categoryId === null || locationId === null) continue;
    rooms.push({
      id,
      // "7209 (Capacity 2)" → "7209"; capacity comes from its own field.
      name: title.replace(/\s*\(capacity\s*\d+\)\s*$/i, "").trim(),
      capacity: jsNumber(block, "capacity"),
      categoryId,
      locationId,
      categoryName: jsString(block, "grouping") ?? "",
      // Always build this from the room's own eid — never trust the feed's
      // "url" field, which can point at a category or availability page
      // instead of this specific room's booking screen.
      bookingUrl: `${LIBCAL}/space/${id}`,
    });
  }
  return rooms;
}

/** A room's own LibCal booking screen, pre-filled to one date. */
export function roomBookingUrl(roomId: number, isoDate: string): string {
  return `${LIBCAL}/space/${roomId}?date=${isoDate}`;
}

/** How many days past today the availability refresh asks for. */
export const ROOM_LOOKAHEAD_DAYS = 14;

/** The grid request's (exclusive) end date for a fetch on `isoDate`: today through today+14. */
export function roomRangeEnd(isoDate: string): string {
  return addDays(isoDate, ROOM_LOOKAHEAD_DAYS + 1);
}

/** Merge a room's open half-hour slots into contiguous windows; never across midnight. */
export function openWindows(slots: GridSlot[], roomId: number): OpenWindow[] {
  const open = slots
    .filter((s) => s.itemId === roomId && !s.className)
    .sort((a, b) => a.start.localeCompare(b.start));
  const windows: OpenWindow[] = [];
  for (const s of open) {
    const last = windows.at(-1);
    if (last && last.end === s.start && last.start.slice(0, 10) === s.start.slice(0, 10)) last.end = s.end;
    else windows.push({ start: s.start, end: s.end });
  }
  return windows;
}

export function applyAvailability(rooms: Room[], grid: { slots: GridSlot[] }): RoomAvailability[] {
  return rooms.map((room) => ({ ...room, open: openWindows(grid.slots, room.id) }));
}

// ---- network ----

async function reservePage(locationId?: number, categoryId?: number): Promise<string> {
  const params = new URLSearchParams();
  if (locationId) params.set("lid", String(locationId));
  if (categoryId) params.set("gid", String(categoryId));
  return fetchText("rooms", `${LIBCAL}/reserve${params.size ? `?${params}` : ""}`);
}

/** Every bookable room at every library. Changes rarely; cache for a day. */
export async function fetchRoomCatalog(): Promise<{ locations: RoomLocation[]; rooms: Room[] }> {
  const locations = parseRoomLocations(await reservePage());
  const rooms: Room[] = [];
  for (const loc of locations) {
    const categories = parseRoomCategories(await reservePage(loc.id), loc.id);
    for (const cat of categories) {
      rooms.push(...parseRooms(await reservePage(loc.id, cat.id)));
    }
  }
  const unique = new Map(rooms.map((r) => [r.id, r]));
  return { locations, rooms: [...unique.values()] };
}

/** Open windows for every room in one category on one date ("YYYY-MM-DD"). */
export async function fetchCategoryAvailability(
  rooms: Room[],
  locationId: number,
  categoryId: number,
  isoDate: string,
  nextIsoDate: string,
): Promise<RoomAvailability[]> {
  const body = new URLSearchParams({
    lid: String(locationId),
    gid: String(categoryId),
    eid: "-1",
    seat: "0",
    seatId: "0",
    zone: "0",
    start: isoDate,
    end: nextIsoDate,
    pageIndex: "0",
    pageSize: "100",
  });
  const grid = await fetchJson<{ slots: GridSlot[] }>("rooms", `${LIBCAL}/spaces/availability/grid`, {
    method: "POST",
    body: body.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      Referer: `${LIBCAL}/reserve?lid=${locationId}&gid=${categoryId}`,
    },
  });
  return applyAvailability(
    rooms.filter((r) => r.categoryId === categoryId),
    grid,
  );
}

// Not study space for students: equipment loans and faculty-only offices.
const EXCLUDED_CATEGORY = /equipment|faculty/i;

/** Each study-room category (by library) once, in catalog order. */
export function studyRoomCategories(rooms: Room[]): { locationId: number; categoryId: number }[] {
  const seen = new Map<number, { locationId: number; categoryId: number }>();
  for (const r of rooms) {
    if (EXCLUDED_CATEGORY.test(r.categoryName) || seen.has(r.categoryId)) continue;
    seen.set(r.categoryId, { locationId: r.locationId, categoryId: r.categoryId });
  }
  return [...seen.values()];
}
