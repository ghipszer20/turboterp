// Small, pure helpers for the study-rooms UI (kept separate from the data
// fetching in campus.ts so they're easy to unit test).

/** A library's LibCal name, trimmed for a compact filter chip. */
export function shortLibraryName(name: string): string {
  return name
    .replace(/\s+in\s+.*$/i, "")
    .replace(/^Michelle Smith\s+/i, "")
    .replace(/\s+Library$/i, "");
}

/**
 * Whether a room fits a group of `size`. A solo student (size 1) fits any
 * room -- every room seats at least one person, and LibCal's data has no
 * per-room minimum occupancy to rule one out. Larger sizes need a known
 * capacity at least that big; a room with unknown capacity doesn't qualify.
 */
export function roomFitsSize(capacity: number | null, size: number): boolean {
  if (size <= 1) return true;
  return capacity !== null && capacity >= size;
}

// ---- day, time-range and room-type filters ----

export type Win = { start: number; end: number };
type Stamped = { start: string; end: string };

const DAY_MIN = 1440;
const STEP = 30;

function addIsoDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Today plus the next 14 days: "Today", "Thu 8", "Fri 9"... */
export function dayChoices(today: string, ahead = 14): { date: string; label: string }[] {
  return Array.from({ length: ahead + 1 }, (_, i) => {
    const date = addIsoDays(today, i);
    if (i === 0) return { date, label: "Today" };
    const d = new Date(`${date}T12:00:00Z`);
    const weekday = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
    return { date, label: `${weekday} ${d.getUTCDate()}` };
  });
}

/** "2026-10-07 14:30:00" → minutes after midnight of `day` (clipped to that day; next-day midnight is 1440). */
function minutesOn(stamp: string, day: string): number {
  const date = stamp.slice(0, 10);
  if (date < day) return 0;
  if (date > day) return DAY_MIN;
  return Number(stamp.slice(11, 13)) * 60 + Number(stamp.slice(14, 16));
}

/** A room's open windows on one day, as minutes after midnight (end of day is 1440). */
export function dayWindows(open: Stamped[], day: string): Win[] {
  return open
    .filter((w) => w.start.slice(0, 10) === day)
    .map((w) => ({ start: minutesOn(w.start, day), end: minutesOn(w.end, day) }))
    .filter((w) => w.end > w.start);
}

/** Days (YYYY-MM-DD) on which any room has an open window. */
export function daysWithOpenRooms(rooms: { open: Stamped[] }[]): Set<string> {
  const days = new Set<string>();
  for (const r of rooms) for (const w of r.open) days.add(w.start.slice(0, 10));
  return days;
}

/** Half-hour picker values; on today only times after `now` (minutes), rounded up to the next step. */
export function timeOptions(now: number | null): number[] {
  const first = now === null ? 0 : Math.ceil((now + 1) / STEP) * STEP;
  const out: number[] = [];
  for (let m = first; m <= DAY_MIN; m += STEP) out.push(m);
  return out;
}

/**
 * The window to show for a room on `day`, or null if it doesn't qualify.
 * With a from/to range one window must cover all of it; a lone From (or To)
 * means open for the half hour starting at (or ending at) that time.
 * On today, windows already over are ignored and `current` means open now.
 */
export function pickWindow(
  open: Stamped[],
  q: { day: string; today: string; now: number; from: number | null; to: number | null },
): { window: Win; current: boolean } | null {
  const isToday = q.day === q.today;
  const windows = dayWindows(open, q.day).filter((w) => !isToday || w.end > q.now);
  let window: Win | undefined;
  if (q.from !== null || q.to !== null) {
    const lo = q.from ?? q.to! - STEP;
    const hi = q.to ?? q.from! + STEP;
    window = windows.find((w) => w.start <= lo && w.end >= hi);
  } else {
    window = (isToday ? windows.find((w) => w.start <= q.now) : undefined) ?? windows[0];
  }
  if (!window) return null;
  return { window, current: isToday && window.start <= q.now };
}

type TypedRoom = { locationId: number; library: string; category: string };

/** Plain-words room type from a LibCal category name ("McKeldin Study Carrels" → "Study carrel"). */
export function roomTypeLabel(category: string, library: string): string {
  const c = category.toLowerCase();
  if (/carrel/.test(c)) return "Study carrel";
  if (/seminar/.test(c)) return "Seminar room";
  if (/family/.test(c)) return "Family room";
  if (/podcast/.test(c)) return "Podcast lab";
  if (/conversation/.test(c)) return "Conversation room";
  if (/group study/.test(c)) return "Group study room";
  const short = shortLibraryName(library);
  let name = category;
  for (const prefix of [library, `${short} Library`, short, "Terrapin Learning Commons"]) {
    if (prefix && name.toLowerCase().startsWith(prefix.toLowerCase())) name = name.slice(prefix.length).trim();
  }
  name = name.replace(/s$/i, "").trim() || category;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export function roomTypeKey(r: TypedRoom): string {
  return `${r.locationId}|${roomTypeLabel(r.category, r.library)}`;
}

/** The type chips for a library (0 = all). With All, each chip names its library. */
export function roomTypes(rooms: TypedRoom[], library: number): { key: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const r of rooms) {
    if (library !== 0 && r.locationId !== library) continue;
    const key = roomTypeKey(r);
    if (seen.has(key)) continue;
    const type = roomTypeLabel(r.category, r.library);
    seen.set(key, library === 0 ? `${shortLibraryName(r.library)} · ${type}` : type);
  }
  return [...seen].map(([key, label]) => ({ key, label }));
}
