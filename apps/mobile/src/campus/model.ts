// Libraries, study rooms and fitness view models. Pure: screens recompute them from the device
// clock every minute, so open / closing text never goes stale. Mirrors the web's LibraryList,
// RoomsView, GymList and ClassesSection.

import type { DayHours, FitnessClass, LibraryHours, RecWellArea, RecWellAreaToday } from "@turboterp/campus-data";
import { orderLibraries } from "@turboterp/campus-data/libraries";
import { recWellOnDate } from "@turboterp/campus-data/recwell";
import { formatMinutes } from "@turboterp/campus-data/hours";
import { roomBookingUrl } from "@turboterp/campus-data/room-url";
import type { ClassKind, ClassPlace } from "@turboterp/campus-data/class-kinds";
import { addDays } from "@turboterp/campus-data/dates";
import type { CampusClock } from "@turboterp/app-core/campus-clock";
import { filterClasses, signupNote, weekdayOf, WEEKDAYS, clockLabel } from "@turboterp/app-core/fitness-classes";
import { EPPLEY_SUBSECTION_FALLBACK, regroupEppleyAreas, type RegroupedArea } from "@turboterp/app-core/gyms";
import { compactLibraryName } from "@turboterp/app-core/library-names";
import {
  dayChoices,
  daysWithOpenRooms,
  dayWindows,
  roomFitsSize,
  roomTypeKey,
  roomTypes,
  shortLibraryName,
  type Win,
} from "@turboterp/app-core/rooms";
import { hoursLabel, hoursStatus, type Status } from "@turboterp/app-core/status";

export type Part<T> = { ok: true; data: T } | { ok: false; error: string };

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null;

// ---- payload shape checks ----

export const isLibrariesPayload = (x: unknown): x is LibraryHours[] => Array.isArray(x);

export type RoomsPayload = {
  catalog: { locations: { id: number; name: string }[] };
  rooms: {
    id: number;
    name: string;
    capacity: number | null;
    locationId: number;
    categoryName: string;
    open: { start: string; end: string }[];
  }[];
  failed: number;
  updatedAt: string | null;
};

export function isRoomsPayload(x: unknown): x is RoomsPayload {
  return isObj(x) && Array.isArray(x.rooms) && isObj(x.catalog) && Array.isArray(x.catalog.locations);
}

export type GymsPayload = { areas: Part<RecWellArea[]>; classes: Part<FitnessClass[]> };

const isPart = (x: unknown): boolean => isObj(x) && typeof x.ok === "boolean";
export const isGymsPayload = (x: unknown): x is GymsPayload => isObj(x) && isPart(x.areas) && isPart(x.classes);

// ---- libraries ----

export type LibraryDay = { date: string; label: string; hours: string };
export type LibraryCard = {
  id: number;
  name: string;
  url: string;
  status: Status;
  text: string;
  week: LibraryDay[];
};
export type LibraryGroup = { title: string; items: LibraryCard[] };

const dayName = (date: string, today: string): string => {
  if (date === today) return "Today";
  return `${weekdayOf(date).slice(0, 3)} ${Number(date.slice(8, 10))}`;
};

const hoursText = (h: DayHours | undefined, next: DayHours | undefined): string =>
  h === undefined ? "Hours unavailable" : (hoursLabel(h, next) ?? h.label);

export function libraryCard(lib: LibraryHours, clock: CampusClock): LibraryCard {
  const s = hoursStatus(lib.days[clock.today], clock.minutes, lib.days[clock.tomorrow]);
  const week: LibraryDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(clock.today, i);
    return { date, label: dayName(date, clock.today), hours: hoursText(lib.days[date], lib.days[addDays(date, 1)]) };
  });
  return { id: lib.id, name: compactLibraryName(lib.name), url: lib.url, status: s.status, text: s.text, week };
}

export function libraryGroups(libs: LibraryHours[], clock: CampusClock): LibraryGroup[] {
  const groups = [
    { title: "Libraries", items: orderLibraries(libs.filter((l) => l.kind === "library")) },
    { title: "Collections & spaces", items: libs.filter((l) => l.kind === "department") },
  ];
  return groups.filter((g) => g.items.length > 0).map((g) => ({ title: g.title, items: g.items.map((l) => libraryCard(l, clock)) }));
}

// ---- study rooms ----

export const ROOM_SIZES = [1, 2, 4, 6, 8] as const;

export type RoomRow = {
  id: number;
  name: string;
  capacity: number | null;
  library: string;
  locationId: number;
  category: string;
  open: { start: string; end: string }[];
};

export function roomRows(p: RoomsPayload): RoomRow[] {
  return p.rooms.map((r) => ({
    id: r.id,
    name: r.name,
    capacity: r.capacity,
    library: p.catalog.locations.find((l) => l.id === r.locationId)?.name ?? "",
    locationId: r.locationId,
    category: r.categoryName,
    open: r.open,
  }));
}

export const roomLibraries = (p: RoomsPayload): { id: number; name: string }[] =>
  p.catalog.locations.map((l) => ({ id: l.id, name: shortLibraryName(l.name) }));

export { dayChoices, daysWithOpenRooms, roomTypes };

export type RoomFilter = { library: number; size: number; type: string | null; day: string; freeNow: boolean };

export type RoomSlot = { start: number; end: number; label: string; url: string; current: boolean };
export type RoomCard = { id: number; title: string; sub: string; slots: RoomSlot[]; currentUntil: number | null };

/** Free windows on `day`; on today, windows that are over are dropped and a started one is clipped to now. */
export function roomSlots(room: RoomRow, day: string, clock: CampusClock): RoomSlot[] {
  const isToday = day === clock.today;
  return dayWindows(room.open, day)
    .filter((w: Win) => !isToday || w.end > clock.minutes)
    .map((w: Win) => ({
      start: w.start,
      end: w.end,
      label: `${formatMinutes(w.start)}-${formatMinutes(w.end)}`,
      url: roomBookingUrl(room.id, day),
      current: isToday && w.start <= clock.minutes,
    }));
}

export function roomCards(rows: RoomRow[], f: RoomFilter, clock: CampusClock): RoomCard[] {
  return rows
    .filter(
      (r) =>
        (f.library === 0 || r.locationId === f.library) &&
        (f.type === null || roomTypeKey(r) === f.type) &&
        roomFitsSize(r.capacity, f.size),
    )
    .map((r) => ({ r, slots: roomSlots(r, f.day, clock) }))
    .filter(({ slots }) => slots.length > 0 && (!f.freeNow || f.day !== clock.today || slots.some((s) => s.current)))
    .sort(
      (a, b) =>
        Number(b.slots.some((s) => s.current)) - Number(a.slots.some((s) => s.current)) ||
        a.slots[0]!.start - b.slots[0]!.start ||
        a.r.name.localeCompare(b.r.name, undefined, { numeric: true }),
    )
    .map(({ r, slots }) => {
      const cur = slots.find((s) => s.current);
      return {
        id: r.id,
        title: r.capacity ? `${r.name} · ${r.capacity} ${r.capacity === 1 ? "seat" : "seats"}` : r.name,
        sub: `${cur ? `Free until ${formatMinutes(cur.end)}` : `Free from ${formatMinutes(slots[0]!.start)}`} · ${shortLibraryName(r.library)}`,
        slots,
        currentUntil: cur ? cur.end : null,
      };
    });
}

// ---- fitness ----

export type GymTile = { key: string; title: string; url: string; status: Status; text: string };
export type GymSection = { label: string | null; tiles: GymTile[]; fallback?: { description: string; url: string } };
export type GymGroup = { title: string; sections: GymSection[] };

function gymTile(a: RecWellAreaToday, group: string, minutes: number): GymTile {
  const s = hoursStatus(a.hours, minutes, a.tomorrow);
  return {
    key: `${a.group}-${a.name}`,
    title: a.name === group ? "Building" : a.name,
    url: a.url ?? "https://recwell.umd.edu",
    status: s.status,
    text: s.text,
  };
}

export function gymGroups(all: RecWellArea[], clock: CampusClock): GymGroup[] {
  const areas = regroupEppleyAreas(recWellOnDate(all, clock.today));
  const groups = new Map<string, RegroupedArea[]>();
  for (const a of areas) groups.set(a.group, [...(groups.get(a.group) ?? []), a]);
  const ordered = [...groups.entries()].sort(([a], [b]) => Number(b.startsWith("Eppley")) - Number(a.startsWith("Eppley")));
  return ordered.map(([title, items]) => {
    const sections: GymSection[] = [];
    const base = items.filter((a) => !a.subsection);
    if (base.length > 0) sections.push({ label: null, tiles: base.map((a) => gymTile(a, title, clock.minutes)) });
    if (title === "Eppley Recreation Center") {
      for (const [label, fallback] of Object.entries(EPPLEY_SUBSECTION_FALLBACK)) {
        const sub = items.filter((a) => a.subsection === label);
        sections.push(
          sub.length > 0
            ? { label, tiles: sub.map((a) => gymTile(a, title, clock.minutes)) }
            : { label, tiles: [], fallback },
        );
      }
    }
    return { title, sections };
  });
}

export type ClassRow = { key: string; title: string; sub: string; note: string | null; signupUrl: string | null };

/** The week starting today, so "Today" is first. */
export function classDays(today: string): { day: string; label: string }[] {
  const start = WEEKDAYS.indexOf(weekdayOf(today) as (typeof WEEKDAYS)[number]);
  return Array.from({ length: 7 }, (_, i) => {
    const day = WEEKDAYS[(start + i) % 7]!;
    return { day, label: i === 0 ? "Today" : day.slice(0, 3) };
  });
}

export function classRows(
  classes: FitnessClass[],
  f: { day: string; kind: ClassKind | null; place: ClassPlace | null },
  clock: CampusClock,
): ClassRow[] {
  return filterClasses(classes, f).map((c, i) => {
    const when = c.end === undefined ? clockLabel(c.start) : `${clockLabel(c.start)} - ${clockLabel(c.end)}`;
    return {
      key: `${c.day}-${c.start}-${c.name}-${c.location}-${i}`,
      title: c.name,
      sub: `${when} · ${c.location}${c.instructor ? ` · ${c.instructor}` : ""}`,
      note: c.day === f.day ? signupNote(c, clock.today, clock.minutes) : null,
      signupUrl: c.signupUrl ?? null,
    };
  });
}
